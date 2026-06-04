import { NextRequest, NextResponse } from 'next/server';
import { autoResolveRequests } from '@/lib/cron/auto-resolve-requests';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';

/**
 * GET /api/cron/auto-resolve-requests
 * 
 * Cron endpoint to auto-resolve requests that haven't received resident replies for 7 days.
 * 
 * Security: This endpoint should be protected by:
 * 1. Vercel Cron Secret (Authorization header)
 * 2. Or IP whitelist
 * 3. Or API key
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/auto-resolve-requests",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel Cron sends this header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const response: ApiResponse = {
        success: false,
        error: 'Unauthorized',
      };
      return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
    }

    console.log('Starting auto-resolve cron job...');

    const result = await autoResolveRequests();

    console.log('Auto-resolve cron job completed:', result);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Auto-resolve cron job error:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Auto-resolve cron job failed',
      message: error.message,
    };

    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}