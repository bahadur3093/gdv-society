import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/auth-helpers';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Only admins can approve password reset requests
    await requireAdmin();

    const body = await request.json();
    const { requestId, adminNotes } = body;

    if (!requestId) {
      const response: ApiResponse = {
        success: false,
        error: 'Request ID is required',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Find the password reset request
    const resetRequest = await prisma.residentRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!resetRequest) {
      const response: ApiResponse = {
        success: false,
        error: 'Password reset request not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    if (resetRequest.requestType !== 'PASSWORD_RESET') {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid request type',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    if (resetRequest.status !== 'PENDING') {
      const response: ApiResponse = {
        success: false,
        error: 'Request has already been processed',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Update the request status to approved
    await prisma.residentRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        adminNotes: adminNotes || 'Password reset approved',
        updatedAt: new Date(),
      },
    });

    // Clear the user's password to force password setup on next login
    await prisma.user.update({
      where: { id: resetRequest.userId },
      data: {
        password: '', // Empty string to indicate password needs to be set
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password reset request approved. User will be prompted to set a new password on next login.',
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: unknown) {
    console.error('Approve password reset error:', error);

    if (error instanceof Error) {
      if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized',
        };
        return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
      }
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to approve password reset request',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}