import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import type { ApiResponse, User } from '@/types';
import { HttpStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    
    // Check if authentication failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user: currentUser } = authResult;

    // Fetch full user details
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
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

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Transform to API response format
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plotNumber: user.plotNumber || undefined,
      emailVerified: user.emailVerified?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const response: ApiResponse<User> = {
      success: true,
      data: userData,
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Get current user error:', error);

    if (error.message?.includes('Unauthorized')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch user profile',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}