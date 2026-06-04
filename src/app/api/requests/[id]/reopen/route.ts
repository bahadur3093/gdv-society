import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';
import { z } from 'zod';

// Validation schema for reopening a request
const reopenRequestSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason for reopening (at least 10 characters)'),
});

/**
 * POST /api/requests/[id]/reopen
 * Reopens a resolved request (only by the resident who created it)
 * Body: { reason: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id: requestId } = params;

    const body = await request.json();

    // Validate request body
    const validationResult = reopenRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        message: validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', '),
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const { reason } = validationResult.data;

    // Check if request exists
    const residentRequest = await prisma.residentRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        status: true,
        reopenCount: true,
      },
    });

    if (!residentRequest) {
      const response: ApiResponse = {
        success: false,
        error: 'Request not found',
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Only the request owner can reopen
    if (residentRequest.userId !== session.user.id) {
      const response: ApiResponse = {
        success: false,
        error: 'Forbidden: You can only reopen your own requests',
      };
      return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
    }

    // Can only reopen RESOLVED requests
    if (residentRequest.status !== 'RESOLVED') {
      const response: ApiResponse = {
        success: false,
        error: 'Only resolved requests can be reopened',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Use transaction to reopen request and add a comment with the reason
    const result = await prisma.$transaction(async (tx) => {
      // Update request to REOPENED status
      const updatedRequest = await tx.residentRequest.update({
        where: { id: requestId },
        data: {
          status: 'REOPENED',
          reopenedAt: new Date(),
          reopenCount: residentRequest.reopenCount + 1,
          lastResidentReplyAt: new Date(), // Reset the auto-resolve timer
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

      // Add a comment with the reopen reason
      await tx.requestComment.create({
        data: {
          requestId,
          authorId: session.user.id,
          content: `**Request Reopened**\n\nReason: ${reason}`,
          isAdminComment: false,
        },
      });

      return updatedRequest;
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: result.id,
        userId: result.userId,
        userName: result.user.name,
        userEmail: result.user.email,
        plotNumber: result.plotNumber,
        requestType: result.requestType,
        status: result.status,
        description: result.description,
        reopenedAt: result.reopenedAt?.toISOString(),
        reopenCount: result.reopenCount,
        lastResidentReplyAt: result.lastResidentReplyAt?.toISOString(),
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: any) {
    console.error('Reopen request error:', error);

    if (error.message?.includes('Unauthorized')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to reopen request',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}