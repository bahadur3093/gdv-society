import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';

/**
 * POST /api/requests/[id]/resolve
 * Resolves a request (can be done by admin or the resident who created it)
 * Marks the request as RESOLVED and records who resolved it and when
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;

    // Check if request exists
    const residentRequest = await prisma.residentRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!residentRequest) {
      const response: ApiResponse = {
        success: false,
        error: 'Request not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Check authorization: only admin or the request owner can resolve
    const isAdmin = user.role === 'ADMIN';
    const isOwner = residentRequest.userId === user.id;

    if (!isAdmin && !isOwner) {
      const response: ApiResponse = {
        success: false,
        error: 'Forbidden: You can only resolve your own requests',
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    // Check if already resolved
    if (residentRequest.status === 'RESOLVED') {
      const response: ApiResponse = {
        success: false,
        error: 'Request is already resolved',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Update request to RESOLVED
    const updatedRequest = await prisma.residentRequest.update({
      where: { id: requestId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: user.id,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            plotNumber: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: updatedRequest.id,
        userId: updatedRequest.userId,
        userName: updatedRequest.user.name,
        userEmail: updatedRequest.user.email,
        plotNumber: updatedRequest.plotNumber,
        requestType: updatedRequest.requestType,
        status: updatedRequest.status,
        description: updatedRequest.description,
        resolvedAt: updatedRequest.resolvedAt?.toISOString(),
        resolvedBy: updatedRequest.resolvedBy,
        createdAt: updatedRequest.createdAt.toISOString(),
        updatedAt: updatedRequest.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Resolve request error:', error);

    if (error.message?.includes('Unauthorized')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to resolve request',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}