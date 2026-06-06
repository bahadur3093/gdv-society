import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/auth-helpers';
import { generatePasswordResetToken } from '@/lib/utils/tokens';
import { sendPasswordResetLink } from '@/lib/utils/email';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';

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

    // Generate reset token with 1 hour expiration
    const { token, expiresAt } = generatePasswordResetToken(1);

    // Update request status to approved
    await prisma.passwordResetRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: admin.id,
        token,
        expiresAt,
      },
    });

    // Send password reset link to user (non-blocking)
    sendPasswordResetLink(resetRequest.user.email, resetRequest.user.name, token).catch(
      (error) => {
        console.error('Failed to send reset link:', error);
      }
    );

    const response: ApiResponse = {
      success: true,
      message: 'Password reset request approved and email sent to user',
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Approve reset request error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to approve password reset request',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}