import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/auth';

// Validation schema for updating request
const updateRequestSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'REOPENED']).optional(),
  adminNotes: z.string().optional(),
});

/**
 * GET /api/requests/[id]
 * Retrieves a single request by ID with all comments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    
    // Check if authentication failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    const { id } = await params;

    const residentRequest = await prisma.residentRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            plotNumber: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!residentRequest) {
      const response: ApiResponse = {
        success: false,
        error: 'Request not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Non-admin users can only view their own requests
    if (user.role !== 'ADMIN' && residentRequest.userId !== user.id) {
      const response: ApiResponse = {
        success: false,
        error: 'Forbidden: You can only view your own requests',
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        id: residentRequest.id,
        userId: residentRequest.userId,
        userName: residentRequest.user.name,
        userEmail: residentRequest.user.email,
        plotNumber: residentRequest.plotNumber,
        requestType: residentRequest.requestType,
        status: residentRequest.status,
        description: residentRequest.description,
        adminNotes: residentRequest.adminNotes,
        newPlotSize: residentRequest.newPlotSize,
        familyMemberName: residentRequest.familyMemberName,
        familyMemberRelation: residentRequest.familyMemberRelation,
        familyMemberContact: residentRequest.familyMemberContact,
        createdAt: residentRequest.createdAt.toISOString(),
        updatedAt: residentRequest.updatedAt.toISOString(),
        resolvedAt: residentRequest.resolvedAt?.toISOString(),
        resolvedBy: residentRequest.resolvedBy,
        lastResidentReplyAt: residentRequest.lastResidentReplyAt?.toISOString(),
        reopenedAt: residentRequest.reopenedAt?.toISOString(),
        reopenCount: residentRequest.reopenCount,
        comments: residentRequest.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          isAdminComment: comment.isAdminComment,
          authorId: comment.authorId,
          authorName: comment.author.name,
          authorRole: comment.author.role,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
        })),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Get request error:', error);

    if (error.message?.includes('Unauthorized')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch request',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * PATCH /api/requests/[id]
 * Updates a request (admin only for status/adminNotes)
 * Body: { status?, adminNotes? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();

    // Validate request body
    const validationResult = updateRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        message: validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', '),
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const { status, adminNotes } = validationResult.data;

    // Check if request exists
    const existingRequest = await prisma.residentRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      const response: ApiResponse = {
        success: false,
        error: 'Request not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Update request
    const updatedRequest = await prisma.residentRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
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
        adminNotes: updatedRequest.adminNotes,
        createdAt: updatedRequest.createdAt.toISOString(),
        updatedAt: updatedRequest.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Update request error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to update request',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * DELETE /api/requests/[id]
 * Deletes a request (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if request exists
    const existingRequest = await prisma.residentRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      const response: ApiResponse = {
        success: false,
        error: 'Request not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Delete request (comments will be cascade deleted)
    await prisma.residentRequest.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Request deleted successfully',
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Delete request error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete request',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}