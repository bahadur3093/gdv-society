import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { ApiResponse, User } from '@/types';
import { HttpStatus } from '@/types';
import { requireAdmin } from '@/lib/auth/auth';

// Validation schema for updating a user
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  plotNumber: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'RESIDENT']).optional(),
  emailVerified: z.string().datetime().optional().nullable(),
});

// Helper: build error response for auth errors
function authError(message: string) {
  const response: ApiResponse = { success: false, error: message };
  return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
}

// GET /api/users/[id] — fetch a single user by id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

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
      const response: ApiResponse = { success: false, error: 'User not found' };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    const data: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plotNumber: user.plotNumber || undefined,
      emailVerified: user.emailVerified?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const response: ApiResponse<User> = { success: true, data };
    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Get user error:', error);
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return authError(error.message);
    }
    const response: ApiResponse = { success: false, error: 'Failed to fetch user' };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

// PUT /api/users/[id] — update a user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      const response: ApiResponse = {
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(', '),
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const { emailVerified, ...rest } = parsed.data;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        // Convert string → Date (or null) for the emailVerified field
        ...(emailVerified !== undefined
          ? { emailVerified: emailVerified ? new Date(emailVerified) : null }
          : {}),
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

    const data: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plotNumber: user.plotNumber || undefined,
      emailVerified: user.emailVerified?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const response: ApiResponse<User> = { success: true, data };
    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Update user error:', error);
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return authError(error.message);
    }
    if (error.code === 'P2025') {
      const response: ApiResponse = { success: false, error: 'User not found' };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }
    const response: ApiResponse = { success: false, error: 'Failed to update user' };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

// DELETE /api/users/[id] — delete a user (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.user.delete({ where: { id } });

    const response: ApiResponse = { success: true, data: null };
    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Delete user error:', error);
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return authError(error.message);
    }
    if (error.code === 'P2025') {
      const response: ApiResponse = { success: false, error: 'User not found' };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }
    const response: ApiResponse = { success: false, error: 'Failed to delete user' };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}