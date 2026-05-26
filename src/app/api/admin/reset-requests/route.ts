import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/auth-helpers';
import type { ApiResponse, PasswordResetRequest } from '@/types';
import { HttpStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    // Fetch password reset requests
    const requests = await prisma.passwordResetRequest.findMany({
      where: {
        status: status as any,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        approver: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    // Transform to API response format
    const data: PasswordResetRequest[] = requests.map((req) => ({
      id: req.id,
      userId: req.userId,
      status: req.status,
      requestedAt: req.requestedAt.toISOString(),
      approvedAt: req.approvedAt?.toISOString() || null,
      approvedBy: req.approvedBy,
      expiresAt: req.expiresAt.toISOString(),
      token: req.token,
      user: req.user,
      approver: req.approver || undefined,
    }));

    const response: ApiResponse<PasswordResetRequest[]> = {
      success: true,
      data,
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Get reset requests error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch password reset requests',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}