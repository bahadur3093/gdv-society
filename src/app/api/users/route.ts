import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paginationSchema } from '@/lib/validation/common';
import type { ApiResponse, User, PaginatedResponse } from '@/types';
import { HttpStatus } from '@/types';
import { requireAdmin } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const pagination = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    // Calculate skip for pagination
    const skip = (pagination.page - 1) * pagination.limit;

    // Get total count
    const total = await prisma.user.count();

    // Fetch users
    const users = await prisma.user.findMany({
      skip,
      take: pagination.limit,
      orderBy: {
        [pagination.sortBy]: pagination.sortOrder,
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

    // Transform to API response format
    const data: User[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plotNumber: user.plotNumber || undefined,
      emailVerified: user.emailVerified?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    const response: PaginatedResponse<User> = {
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Get users error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch users',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}