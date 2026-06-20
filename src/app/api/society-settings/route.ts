import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for society settings
const societySettingsSchema = z.object({
  perSqFtRate: z.number().positive('Per Sq.Ft Rate must be greater than 0'),
  sinkingFundPercentage: z.number().min(0, 'Sinking Fund Percentage must be at least 0').max(100, 'Sinking Fund Percentage cannot exceed 100'),
  totalVillas: z.number().int().positive('Total Villas must be a positive integer'),
});

/**
 * GET /api/society-settings
 * Retrieves current society financial settings
 */
export async function GET() {
  try {
    // Get the first (and should be only) settings record
    let settings = await prisma.societySettings.findFirst();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.societySettings.create({
        data: {
          perSqFtRate: 2.15,
          sinkingFundPercentage: 20,
          totalVillas: 47,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        perSqFtRate: settings.perSqFtRate,
        sinkingFundPercentage: settings.sinkingFundPercentage,
        totalVillas: settings.totalVillas,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching society settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch society settings',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/society-settings
 * Updates society financial settings (Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = societySettingsSchema.safeParse(body);

    if (!validationResult.success) {
      const zodError = validationResult.error;
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: zodError.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { perSqFtRate, sinkingFundPercentage, totalVillas } = validationResult.data;

    // Get existing settings or create new one
    const existingSettings = await prisma.societySettings.findFirst();

    let updatedSettings;
    if (existingSettings) {
      // Update existing settings
      updatedSettings = await prisma.societySettings.update({
        where: { id: existingSettings.id },
        data: {
          perSqFtRate,
          sinkingFundPercentage,
          totalVillas,
        },
      });
    } else {
      // Create new settings
      updatedSettings = await prisma.societySettings.create({
        data: {
          perSqFtRate,
          sinkingFundPercentage,
          totalVillas,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Society settings updated successfully',
      data: {
        perSqFtRate: updatedSettings.perSqFtRate,
        sinkingFundPercentage: updatedSettings.sinkingFundPercentage,
        totalVillas: updatedSettings.totalVillas,
      },
    });
  } catch (error) {
    console.error('[API] Error updating society settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update society settings',
      },
      { status: 500 }
    );
  }
}