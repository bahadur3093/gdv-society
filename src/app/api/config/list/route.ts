import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/auth-helpers';

/**
 * GET /api/config/list
 * Retrieve all config keys (admin only)
 */
export async function GET() {
  try {
    // Require admin authentication
    await requireAdmin();

    // Fetch all config keys
    const configs = await prisma.appConfig.findMany({
      select: {
        configKey: true,
      },
      orderBy: {
        configKey: 'asc',
      },
    });

    const configKeys = configs.map(config => config.configKey);

    // Return empty array if no configs found instead of throwing error
    return NextResponse.json(
      {
        success: true,
        configs: configKeys,
        count: configKeys.length,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[GET /api/config/list] Error:', error);

    // Check if error is an object with message property
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage?.includes('Unauthorized') || errorMessage?.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: errorMessage.includes('Unauthorized') ? 401 : 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to retrieve configuration list' },
      { status: 500 }
    );
  }
}