import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';
import { z } from 'zod';
import { validateRequest } from '@/lib/validation/common';

const checkEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateRequest(checkEmailSchema, body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
      },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'No account found with this email address',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Check if user has a password set
    debugger
    const hasPassword = user.password !== null && user.password !== '';

    const response: ApiResponse = {
      success: true,
      data: {
        email: user.email,
        name: user.name,
        hasPassword,
        requiresPasswordSetup: !hasPassword,
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Check email error:', error);

    // Handle validation errors
    if (error.statusCode === HttpStatus.BAD_REQUEST) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Validation failed',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Handle other errors
    const response: ApiResponse = {
      success: false,
      error: 'Failed to check email',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
