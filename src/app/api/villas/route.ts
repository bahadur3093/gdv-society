import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/auth-helpers';
import { createVillaSchema } from '@/lib/validation/villa';
import { validateRequest } from '@/lib/validation/common';
import { calculateVillaExpenses } from '@/lib/utils/calculations';
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

    // Enrich villa data with calculated expenses
    const villasWithExpenses = villas.map((villa) => {
      const expenses = calculateVillaExpenses(
        villa.areaInSqFt,
        Number(settings.perSqFtRate)
      );

      return {
        villaNo: villa.villaNo,
        type: villa.type,
        areaInSqM: villa.areaInSqM,
        ownerName: villa.ownerName,
        areaInSqFt: villa.areaInSqFt,
        remarks: villa.remarks,
        maintenanceAmount: expenses.maintenanceAmount,
        perSqFtRate: expenses.perSqFtRate,
      };
    });

    const response: ApiResponse = {
      success: true,
      data: villasWithExpenses,
    };
    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    console.error('Error fetching villas:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch villas',
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

    // Calculate expenses for the new villa
    const expenses = calculateVillaExpenses(
      villa.areaInSqFt,
      Number(settings.perSqFtRate)
    );

    const villaWithExpenses = {
      villaNo: villa.villaNo,
      type: villa.type,
      areaInSqM: villa.areaInSqM,
      ownerName: villa.ownerName,
      areaInSqFt: villa.areaInSqFt,
      remarks: villa.remarks,
      maintenanceAmount: expenses.maintenanceAmount,
      perSqFtRate: expenses.perSqFtRate,
    };

    const response: ApiResponse = {
      success: true,
      data: villaWithExpenses,
      message: 'Villa created successfully',
    };
    return NextResponse.json(response, { status: HttpStatus.CREATED });
  } catch (error) {
    console.error('Error creating villa:', error);

    if (error instanceof Error && error.name === 'AuthError') {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: (error as { statusCode?: number }).statusCode || HttpStatus.UNAUTHORIZED });
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as { errors?: Array<{ field: string; message: string }> };
      const response: ApiError = {
        success: false,
        error: error.message,
        validationErrors: validationError.errors,
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create villa',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
