import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/password';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';
import { z } from 'zod';
import { validateRequest } from '@/lib/validation/common';

const setPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character (@$!%*?&#)'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateRequest(setPasswordSchema, body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Check if user already has a password
    if (user.password && user.password !== '') {
      const response: ApiResponse = {
        success: false,
        error: 'Password already set. Please use the forgot password flow to reset.',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password set successfully. You can now log in with your new password.',
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Set password error:', error);

    // Handle validation errors
    if (error.statusCode === 400) {
      return NextResponse.json(error, { status: HttpStatus.BAD_REQUEST });
    }

    // Handle other errors
    const response: ApiResponse = {
      success: false,
      error: 'Failed to set password',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
