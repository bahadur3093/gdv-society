import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetRequestToAdmin } from '@/lib/utils/email';
import { forgotPasswordSchema } from '@/lib/validation/auth';
import { validateRequest } from '@/lib/validation/common';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateRequest(forgotPasswordSchema, body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      const response: ApiResponse = {
        success: true,
        message: 'If the email exists, a password reset request has been submitted to the administrator',
      };
      return NextResponse.json(response, { status: HttpStatus.OK });
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.residentRequest.findFirst({
      where: {
        userId: user.id,
        requestType: 'PASSWORD_RESET',
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      const response: ApiResponse = {
        success: true,
        message: 'A password reset request is already pending for this account',
      };
      return NextResponse.json(response, { status: HttpStatus.OK });
    }

    // Create password reset request as a ResidentRequest
    await prisma.residentRequest.create({
      data: {
        userId: user.id,
        plotNumber: user.plotNumber || 'N/A',
        requestType: 'PASSWORD_RESET',
        status: 'PENDING',
        description: `Password reset request from ${user.name || user.email}`,
      },
    });

    // Send notification to admin (non-blocking)
    sendPasswordResetRequestToAdmin(user.email, user.name).catch((error) => {
      console.error('Failed to send admin notification:', error);
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password reset request submitted. An administrator will review your request shortly.',
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Forgot password error:', error);

    // Handle validation errors
    if (error.statusCode === 400) {
      return NextResponse.json(error, { status: HttpStatus.BAD_REQUEST });
    }

    // Handle other errors
    const response: ApiResponse = {
      success: false,
      error: 'Failed to process password reset request',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}