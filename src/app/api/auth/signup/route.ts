import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/password';
import { sendWelcomeEmail } from '@/lib/utils/email';
import { signUpSchema } from '@/lib/validation/auth';
import { validateRequest } from '@/lib/validation/common';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';
import { AppUser } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateRequest(signUpSchema, body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: 'User with this email already exists',
      };
      return NextResponse.json(response, { status: HttpStatus.CONFLICT });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Store the plain password to send in welcome email
    const plainPassword = validatedData.password;

    // Create user with emailVerified set to null (unverified) for regular users
    // Admin accounts should have emailVerified set to current date immediately
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        plotNumber: validatedData.plotNumber || null,
        role: 'RESIDENT', // Default role
        emailVerified: null, // User must be verified by admin before accessing dashboard
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plotNumber: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send welcome email with password (non-blocking)
    sendWelcomeEmail(user.email, user.name, plainPassword).catch((error) => {
      console.error('Failed to send welcome email:', error);
    });

    // Return user data (without password)
    const userData: AppUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plotNumber: user.plotNumber || undefined,
      emailVerified: user.emailVerified?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const response: ApiResponse<AppUser> = {
      success: true,
      data: userData,
      message: 'User registered successfully',
    };

    return NextResponse.json(response, { status: HttpStatus.CREATED });
  } catch (error: unknown) {
    console.error('Signup error:', error);

    const errorObj = error as { statusCode?: number; error?: string; validationErrors?: unknown[]; code?: string };

    // Handle validation errors from validateRequest
    if (errorObj.statusCode === HttpStatus.BAD_REQUEST) {
      return NextResponse.json(
        {
          success: false,
          error: errorObj.error || 'Validation failed',
          validationErrors: errorObj.validationErrors || [],
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Handle database errors (e.g., Prisma errors)
    if (errorObj.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: HttpStatus.CONFLICT }
      );
    }

    // Handle other errors
    const response: ApiResponse = {
      success: false,
      error: (error as Error).message || 'Failed to register user',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}