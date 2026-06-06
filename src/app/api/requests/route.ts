import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { paginationSchema } from '@/lib/validation/common';
import type { ApiResponse, PaginatedResponse } from '@/types';
import { HttpStatus } from '@/types';
import { z } from 'zod';

// Validation schema for creating a request
const createRequestSchema = z.object({
  requestType: z.enum(['PLOT_SIZE_UPDATE', 'PAYMENT_ISSUE', 'EXPENSE_SHEET_MONTHLY', 'EXPENSE_SHEET_YEARLY', 'ADD_FAMILY_MEMBER', 'PASSWORD_RESET']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  newPlotSize: z.number().positive().optional(),
  familyMemberDetails: z.object({
    name: z.string().min(1),
    relationship: z.string().min(1),
    contact: z.string().min(1),
  }).optional(),
});

/**
 * GET /api/requests
 * Retrieves requests with pagination and filtering
 * Query params: page, limit, status, requestType, userId (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    
    // Check if authentication failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const pagination = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const status = searchParams.get('status');
    const requestType = searchParams.get('requestType');
    const userId = searchParams.get('userId');

    // Build where clause
    const where: Record<string, unknown> = {};

    // Non-admin users can only see their own requests
    if (user.role !== 'ADMIN') {
      where.userId = user.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (requestType) {
      where.requestType = requestType;
    }

    // Get total count
    const total = await prisma.residentRequest.count({ where });

    // Fetch requests with user details and comment count
    const requests = await prisma.residentRequest.findMany({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: {
        [pagination.sortBy]: pagination.sortOrder,
      },
      select: {
        id: true,
        userId: true,
        plotNumber: true,
        requestType: true,
        status: true,
        description: true,
        adminNotes: true,
        newPlotSize: true,
        familyMemberName: true,
        familyMemberRelation: true,
        familyMemberContact: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true,
        resolvedBy: true,
        lastResidentReplyAt: true,
        reopenedAt: true,
        reopenCount: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            plotNumber: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const data = requests.map((req) => ({
      id: req.id,
      userId: req.userId,
      userName: req.user.name,
      userEmail: req.user.email,
      plotNumber: req.plotNumber,
      requestType: req.requestType,
      status: req.status,
      description: req.description,
      adminNotes: req.adminNotes,
      newPlotSize: req.newPlotSize,
      familyMemberName: req.familyMemberName,
      familyMemberRelation: req.familyMemberRelation,
      familyMemberContact: req.familyMemberContact,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
      resolvedAt: req.resolvedAt?.toISOString(),
      resolvedBy: req.resolvedBy,
      lastResidentReplyAt: req.lastResidentReplyAt?.toISOString(),
      reopenedAt: req.reopenedAt?.toISOString(),
      reopenCount: req.reopenCount,
      commentCount: req._count.comments,
    }));

    const response: PaginatedResponse<typeof data[0]> = {
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
  } catch (error: unknown) {
    console.error('Get requests error:', error);

    if (error instanceof Error && error.message?.includes('Unauthorized')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch requests';
    const response: ApiResponse = {
      success: false,
      error: errorMessage,
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * POST /api/requests
 * Creates a new resident request
 * Body: { requestType, description, newPlotSize?, familyMemberDetails? }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    
    // Check if authentication failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;

    const body = await request.json();

    // Validate request body
    const validationResult = createRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        message: validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', '),
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const { requestType, description, newPlotSize, familyMemberDetails } = validationResult.data;

    // Get user's plot number
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plotNumber: true },
    });

    if (!userRecord?.plotNumber) {
      const response: ApiResponse = {
        success: false,
        error: 'User plot number not found',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Create request
    const newRequest = await prisma.residentRequest.create({
      data: {
        userId: user.id,
        plotNumber: userRecord.plotNumber,
        requestType,
        description,
        status: 'PENDING',
        newPlotSize,
        familyMemberName: familyMemberDetails?.name,
        familyMemberRelation: familyMemberDetails?.relationship,
        familyMemberContact: familyMemberDetails?.contact,
      },
      select: {
        id: true,
        userId: true,
        plotNumber: true,
        requestType: true,
        status: true,
        description: true,
        newPlotSize: true,
        familyMemberName: true,
        familyMemberRelation: true,
        familyMemberContact: true,
        createdAt: true,
        updatedAt: true,
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
        id: newRequest.id,
        userId: newRequest.userId,
        userName: newRequest.user.name,
        userEmail: newRequest.user.email,
        plotNumber: newRequest.plotNumber,
        requestType: newRequest.requestType,
        status: newRequest.status,
        description: newRequest.description,
        newPlotSize: newRequest.newPlotSize,
        familyMemberName: newRequest.familyMemberName,
        familyMemberRelation: newRequest.familyMemberRelation,
        familyMemberContact: newRequest.familyMemberContact,
        createdAt: newRequest.createdAt.toISOString(),
        updatedAt: newRequest.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.CREATED });
  } catch (error: unknown) {
    console.error('Create request error:', error);

    if (error instanceof Error && error.message?.includes('Unauthorized')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to create request';
    const response: ApiResponse = {
      success: false,
      error: errorMessage,
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}