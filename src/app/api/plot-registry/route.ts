import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateVillaExpenses, DEFAULT_TOTAL_VILLAS } from '@/lib/utils/calculations';
import type { ApiResponse, PlotData } from '@/types';
import { HttpStatus } from '@/types';

/**
 * GET /api/plot-registry
 * Retrieve all plots (villas) with calculated expense data
 * This endpoint provides the same data as PLOT_REGISTRY but from the database
 */
export async function GET(request: NextRequest) {
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

    // Enrich villa data with calculated expenses to match PlotData interface
    const plotRegistry: PlotData[] = villas.map((villa) => {
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
        remarks: villa.remarks || '',
        fixedAmount: expenses.fixedAmount,
        variableAmount: expenses.variableAmount,
        hybridTotal: expenses.hybridTotal,
        flatRate: expenses.flatRate,
      };
    });

    const response: ApiResponse<PlotData[]> = {
      success: true,
      data: plotRegistry,
    };
    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Error fetching plot registry:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch plot registry data',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
