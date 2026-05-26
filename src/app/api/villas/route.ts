import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/auth-helpers';
import { createVillaSchema } from '@/lib/validation/villa';
import { validateRequest } from '@/lib/validation/common';
import { calculateVillaExpenses, DEFAULT_TOTAL_VILLAS } from '@/lib/utils/calculations';
import type { ApiResponse, ApiError } from '@/types';
import { HttpStatus } from '@/types';

/**
 * GET /api/villas
 * Retrieve all villas with calculated expense data
 */
export async function GET() {
  try {
    // Fetch all villas from database
    const villas = await prisma.villa.findMany({
      orderBy: { villaNo: 'asc' },
    });

    // Fetch society settings for expense calculations
    const settings = await prisma.societySettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!settings) {
      const response: ApiResponse = {
        success: false,
        error: 'Society settings not found. Please configure financial settings first.',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Calculate total number of villas for fixed amount calculation
    const totalVillas = villas.length || DEFAULT_TOTAL_VILLAS;

    // Enrich villa data with calculated expenses
    const villasWithExpenses = villas.map((villa) => {
      const expenses = calculateVillaExpenses(
        villa.areaInSqFt,
        totalVillas,
        settings
      );

      return {
        villaNo: villa.villaNo,
        type: villa.type,
        areaInSqM: villa.areaInSqM,
        ownerName: villa.ownerName,
        areaInSqFt: villa.areaInSqFt,
        remarks: villa.remarks,
        fixedAmount: expenses.fixedAmount,
        variableAmount: expenses.variableAmount,
        hybridTotal: expenses.hybridTotal,
        flatRate: expenses.flatRate,
      };
    });

    const response: ApiResponse = {
      success: true,
      data: villasWithExpenses,
    };
    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Error fetching villas:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch villas',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * POST /api/villas
 * Create a new villa (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateRequest(createVillaSchema, body);

    // Check if villa number already exists
    const existingVilla = await prisma.villa.findUnique({
      where: { villaNo: validatedData.villaNo },
    });

    if (existingVilla) {
      const response: ApiResponse = {
        success: false,
        error: `Villa number ${validatedData.villaNo} already exists`,
      };
      return NextResponse.json(response, { status: HttpStatus.CONFLICT });
    }

    // Create new villa
    const villa = await prisma.villa.create({
      data: validatedData,
    });

    // Fetch society settings for expense calculations
    const settings = await prisma.societySettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!settings) {
      const response: ApiResponse = {
        success: false,
        error: 'Society settings not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Get total villas count
    const totalVillas = await prisma.villa.count();

    // Calculate expenses for the new villa
    const expenses = calculateVillaExpenses(
      villa.areaInSqFt,
      totalVillas,
      settings
    );

    const villaWithExpenses = {
      villaNo: villa.villaNo,
      type: villa.type,
      areaInSqM: villa.areaInSqM,
      ownerName: villa.ownerName,
      areaInSqFt: villa.areaInSqFt,
      remarks: villa.remarks,
      fixedAmount: expenses.fixedAmount,
      variableAmount: expenses.variableAmount,
      hybridTotal: expenses.hybridTotal,
      flatRate: expenses.flatRate,
    };

    const response: ApiResponse = {
      success: true,
      data: villaWithExpenses,
      message: 'Villa created successfully',
    };
    return NextResponse.json(response, { status: HttpStatus.CREATED });
  } catch (error: any) {
    console.error('Error creating villa:', error);

    if (error.name === 'AuthError') {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: error.statusCode });
    }

    if (error.name === 'ValidationError') {
      const response: ApiError = {
        success: false,
        error: error.message,
        validationErrors: error.errors,
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to create villa',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
