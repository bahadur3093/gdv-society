import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';
import { z } from 'zod';

// Validation schema for creating a comment
const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment is too long'),
});

/**
 * GET /api/requests/[id]/comments
 * Retrieves all comments for a request
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;

    // Check if request exists and user has access
    const residentRequest = await prisma.residentRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!residentRequest) {
      const response: ApiResponse = {
        success: false,
        error: 'Request not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Non-admin users can only view comments on their own requests
    if (user.role !== 'ADMIN' && residentRequest.userId !== user.id) {
      const response: ApiResponse = {
        success: false,
        error: 'Forbidden: You can only view comments on your own requests',
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    // Fetch comments
    const comments = await prisma.requestComment.findMany({
      where: { requestId },
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
    });

    const response: ApiResponse = {
      success: true,
      data: comments.map((comment) => ({
        id: comment.id,
        requestId: comment.requestId,
        content: comment.content,
        isAdminComment: comment.isAdminComment,
        authorId: comment.authorId,
        authorName: comment.author.name,
        authorRole: comment.author.role,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    console.error('Get comments error:', error);

    if (error instanceof Error && error.message?.includes('Unauthorized')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch comments',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * POST /api/requests/[id]/comments
 * Adds a comment to a request
 * Body: { content: string }
 * 
 * Updates lastResidentReplyAt if the comment is from a resident
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;

    const body = await request.json();

    // Validate request body
    const validationResult = createCommentSchema.safeParse(body);

    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        message: validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', '),
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const { content } = validationResult.data;

    // Check if request exists and user has access
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

    // Non-admin users can only comment on their own requests
    if (user.role !== 'ADMIN' && residentRequest.userId !== user.id) {
      const response: ApiResponse = {
        success: false,
        error: 'Forbidden: You can only comment on your own requests',
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    const isAdminComment = user.role === 'ADMIN';
    const isResidentComment = !isAdminComment;

    // Use transaction to create comment and update request atomically
    // Increased timeout to 15000ms (15 seconds) to handle network latency with Neon database
    const result = await prisma.$transaction(async (tx) => {
      // Create comment
      const newComment = await tx.requestComment.create({
        data: {
          requestId,
          authorId: user.id,
          content,
          isAdminComment,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Update request: if resident comments, update lastResidentReplyAt
      // If request was RESOLVED, change status to IN_PROGRESS when either party comments  
      const updateData: Record<string, Date | string> = {
        updatedAt: new Date(),
      };

      if (isResidentComment) {
        updateData.lastResidentReplyAt = new Date();
      }

      // If request is RESOLVED and someone comments, move it to IN_PROGRESS
      if (residentRequest.status === 'RESOLVED') {
        updateData.status = 'IN_PROGRESS';
      }

      await tx.residentRequest.update({
        where: { id: requestId },
        data: updateData,
      });

      return newComment;
    }, {
      maxWait: 10000, // Maximum time to wait for a transaction slot (10 seconds)
      timeout: 15000, // Maximum time for the transaction to complete (15 seconds)
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: result.id,
        requestId: result.requestId,
        content: result.content,
        isAdminComment: result.isAdminComment,
        authorId: result.authorId,
        authorName: result.author.name,
        authorRole: result.author.role,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.CREATED });
  } catch (error) {
    console.error('Create comment error:', error);

    if (error instanceof Error && error.message?.includes('Unauthorized')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to create comment',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}