import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/auth-helpers';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';
import { hashPassword } from '@/lib/utils/password';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: 'User ID is required',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Empty the password field to force user to create new password
    // For Admin accounts: Always set emailVerified to current timestamp
    // For User accounts: Keep current emailVerified status (admin can update separately)
    // Note: We set password to an empty string instead of null to avoid database constraint issues
    // The login flow checks for empty/falsy password values to trigger password setup
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: '', // Empty password string - user will be prompted to set new password
        emailVerified: user.role === 'ADMIN' ? new Date() : user.emailVerified, // Always verify admin accounts
      },
    });

    // Create a password reset request for tracking
    const resetRequest = await prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        status: 'APPROVED',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        token: crypto.randomBytes(32).toString('hex'),
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully. User must create a new password on next login.',
      data: {
        resetRequestId: resetRequest.id,
        expiresAt: resetRequest.expiresAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    console.error('Password reset error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Unauthorized') || errorMessage.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: errorMessage,
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to reset password',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}