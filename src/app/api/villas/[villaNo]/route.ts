import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/auth-helpers';
import { updateVillaSchema } from '@/lib/validation/villa';
import { validateRequest } from '@/lib/validation/common';
import { calculateVillaExpenses } from '@/lib/utils/calculations';
import type { ApiResponse, ApiError } from '@/types';
import { HttpStatus } from '@/types';

/**
 * GET /api/villas/[villaNo]
 * Retrieve a specific villa by villa number with calculated expenses
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ villaNo: string }> }
) {
  try {
    // Await params (Next.js 16+ requirement)
    const { villaNo: villaNoStr } = await params;
    const villaNo = parseInt(villaNoStr, 10);

    if (isNaN(villaNo)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid villa number',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Fetch villa from database
    const villa = await prisma.villa.findUnique({
      where: { villaNo },
    });

    if (!villa) {
      const response: ApiResponse = {
        success: false,
        error: `Villa ${villaNo} not found`,
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

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

    // Calculate expenses
    const expenses = calculateVillaExpenses(
      villa.areaInSqFt,
      Number(settings.perSqFtRate),
      settings.sinkingFundPercentage
    );

    const villaWithExpenses = {
      villaNo: villa.villaNo,
      type: villa.type,
      areaInSqM: villa.areaInSqM,
      ownerName: villa.ownerName,
      areaInSqFt: villa.areaInSqFt,
      remarks: villa.remarks,
      maintenanceAmount: expenses.totalMaintenance,
      perSqFtRate: Number(settings.perSqFtRate),
      coreOperations: expenses.coreOperations,
      sinkingFund: expenses.sinkingFund,
    };

    const response: ApiResponse = {
      success: true,
      data: villaWithExpenses,
    };
    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: unknown) {
    console.error('Error fetching villa:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch villa',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * PATCH /api/villas/[villaNo]
 * Update villa information (Admin only)
 * Primarily used for updating owner name and area
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ villaNo: string }> }
) {
  try {
    // Await params (Next.js 16+ requirement)
    const { villaNo: villaNoStr } = await params;
    
    // Require admin authentication
    await requireAdmin();

    const villaNo = parseInt(villaNoStr, 10);

    if (isNaN(villaNo)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid villa number',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateRequest(updateVillaSchema, body);

    // Check if villa exists
    const existingVilla = await prisma.villa.findUnique({
      where: { villaNo },
    });

    if (!existingVilla) {
      const response: ApiResponse = {
        success: false,
        error: `Villa ${villaNo} not found`,
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Update villa
    const updatedVilla = await prisma.villa.update({
      where: { villaNo },
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

    // Calculate expenses with updated data
    const expenses = calculateVillaExpenses(
      updatedVilla.areaInSqFt,
      Number(settings.perSqFtRate),
      settings.sinkingFundPercentage
    );

    const villaWithExpenses = {
      villaNo: updatedVilla.villaNo,
      type: updatedVilla.type,
      areaInSqM: updatedVilla.areaInSqM,
      ownerName: updatedVilla.ownerName,
      areaInSqFt: updatedVilla.areaInSqFt,
      remarks: updatedVilla.remarks,
      maintenanceAmount: expenses.totalMaintenance,
      perSqFtRate: Number(settings.perSqFtRate),
      coreOperations: expenses.coreOperations,
      sinkingFund: expenses.sinkingFund,
    };

    const response: ApiResponse = {
      success: true,
      data: villaWithExpenses,
      message: 'Villa updated successfully',
    };
    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: unknown) {
    console.error('Error updating villa:', error);

    if (error instanceof Error && error.name === 'AuthError') {
      const authError = error as Error & { statusCode?: number };
      const response: ApiResponse = {
        success: false,
        error: authError.message,
      };
      return NextResponse.json(response, { status: authError.statusCode || HttpStatus.UNAUTHORIZED });
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as Error & { errors?: Array<{ field: string; message: string }> };
      const response: ApiError = {
        success: false,
        error: validationError.message,
        validationErrors: validationError.errors,
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update villa',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * DELETE /api/villas/[villaNo]
 * Delete a villa (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ villaNo: string }> }
) {
  try {
    // Await params (Next.js 16+ requirement)
    const { villaNo: villaNoStr } = await params;
    
    // Require admin authentication
    await requireAdmin();

    const villaNo = parseInt(villaNoStr, 10);

    if (isNaN(villaNo)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid villa number',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Check if villa exists
    const existingVilla = await prisma.villa.findUnique({
      where: { villaNo },
    });

    if (!existingVilla) {
      const response: ApiResponse = {
        success: false,
        error: `Villa ${villaNo} not found`,
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Delete villa
    await prisma.villa.delete({
      where: { villaNo },
    });

    const response: ApiResponse = {
      success: true,
      message: `Villa ${villaNo} deleted successfully`,
    };
    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: unknown) {
    console.error('Error deleting villa:', error);

    if (error instanceof Error && error.name === 'AuthError') {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: (error as { statusCode?: number }).statusCode || HttpStatus.UNAUTHORIZED });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete villa',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
