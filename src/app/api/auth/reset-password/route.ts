import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/password';
import { isTokenExpired } from '@/lib/utils/tokens';
import { resetPasswordSchema } from '@/lib/validation/auth';
import { validateRequest } from '@/lib/validation/common';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateRequest(resetPasswordSchema, body);

    // Find password reset request by token
    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { token: validatedData.token },
      include: { user: true },
    });

    if (!resetRequest) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired reset token',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Check if request is approved
    if (resetRequest.status !== 'APPROVED') {
      const response: ApiResponse = {
        success: false,
        error: 'This password reset request has not been approved yet',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Check if token has expired
    if (isTokenExpired(resetRequest.expiresAt)) {
      // Mark as expired
      await prisma.passwordResetRequest.update({
        where: { id: resetRequest.id },
        data: { status: 'EXPIRED' },
      });

      const response: ApiResponse = {
        success: false,
        error: 'Reset token has expired. Please request a new password reset.',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password);

    // Update user password and mark request as completed
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetRequest.update({
        where: { id: resetRequest.id },
        data: { status: 'COMPLETED' },
      }),
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Reset password error:', error);

    // Handle validation errors
    if (error.statusCode === 400) {
      return NextResponse.json(error, { status: HttpStatus.BAD_REQUEST });
    }

    // Handle other errors
    const response: ApiResponse = {
      success: false,
      error: 'Failed to reset password',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}