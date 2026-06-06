import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOwnershipOrAdmin, requireAdmin } from '@/lib/auth/auth-helpers';
import { updateUserSchema } from '@/lib/validation/user';
import { validateRequest } from '@/lib/validation/common';
import type { ApiResponse, User } from '@/types';
import { HttpStatus } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16+ requirement)
    const { id } = await params;
    
    // Require ownership or admin access
    await requireOwnershipOrAdmin(id);

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id },
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
    console.error('Get user error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      const status = error.message?.includes('Unauthorized')
        ? HttpStatus.UNAUTHORIZED
        : HttpStatus.FORBIDDEN;
      return NextResponse.json(response, { status });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch user',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16+ requirement)
    const { id } = await params;
    
    // Require ownership or admin access
    await requireOwnershipOrAdmin(id);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateRequest(updateUserSchema, body);

    // Get current user to check if email is actually changing
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!currentUser) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Check if email is being changed and if it's already taken by another user
    if (validatedData.email && validatedData.email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          error: 'Email is already in use',
        };
        return NextResponse.json(response, { status: HttpStatus.CONFLICT });
      }
    }

    // Prepare update data with proper type conversion for emailVerified
    const updateData: Record<string, unknown> = { ...validatedData };
    // emailVerified is handled separately by admin actions, not through this update endpoint

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
      message: 'User updated successfully',
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    console.error('Update user error:', error);

    const errorObj = error as { statusCode?: number; message?: string };

    if (errorObj.statusCode === 400) {
      return NextResponse.json(error, { status: HttpStatus.BAD_REQUEST });
    }

    if (errorObj.message?.includes('Unauthorized') || errorObj.message?.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: errorObj.message,
      };
      const status = errorObj.message?.includes('Unauthorized')
        ? HttpStatus.UNAUTHORIZED
        : HttpStatus.FORBIDDEN;
      return NextResponse.json(response, { status });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to update user',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16+ requirement)
    const { id } = await params;
    
    // Only admins can delete users
    await requireAdmin();

    // Fetch the user to check if they are an admin
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        email: true,
      },
    });

    if (!userToDelete) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Prevent deletion of admin accounts
    if (userToDelete.role === 'ADMIN') {
      const response: ApiResponse = {
        success: false,
        error: 'Cannot delete admin accounts. Admin accounts can only be modified, not deleted.',
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    console.error('Delete user error:', error);

    const errorObj = error as { message?: string; code?: string };

    if (errorObj.message?.includes('Unauthorized') || errorObj.message?.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: errorObj.message,
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    if (errorObj.code === 'P2025') {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete user',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}