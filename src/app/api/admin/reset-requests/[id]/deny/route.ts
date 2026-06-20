import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetDenied } from '@/lib/utils/email';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';
import { requireAdmin } from '@/lib/auth/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16+ requirement)
    const { id } = await params;
    
    // Require admin authentication
    const authResult = await requireAdmin();
    
    // Check if authentication failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user: admin } = authResult;

    // Find the reset request
    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!resetRequest) {
      const response: ApiResponse = {
        success: false,
        error: 'Password reset request not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Check if request is still pending
    if (resetRequest.status !== 'PENDING') {
      const response: ApiResponse = {
        success: false,
        error: `Request is already ${resetRequest.status.toLowerCase()}`,
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Update request status to denied
    await prisma.passwordResetRequest.update({
      where: { id },
      data: {
        status: 'DENIED',
        approvedAt: new Date(),
        approvedBy: admin.id,
      },
    });

    // Send denial notification to user (non-blocking)
    sendPasswordResetDenied(resetRequest.user.email, resetRequest.user.name).catch(
      (error) => {
        console.error('Failed to send denial notification:', error);
      }
    );

    const response: ApiResponse = {
      success: true,
      message: 'Password reset request denied',
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Deny reset request error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to deny password reset request',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}