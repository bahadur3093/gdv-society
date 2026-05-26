import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';

/**
 * Standard error handler for API routes
 * @param error - The error object
 * @param defaultMessage - Default error message to use
 * @returns NextResponse with appropriate error response
 */
export function handleApiError(
  error: any,
  defaultMessage: string = 'An error occurred'
): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  // Handle validation errors (from Zod)
  if (error.statusCode === 400 && error.validationErrors) {
    return NextResponse.json(error, { status: HttpStatus.BAD_REQUEST });
  }

  // Handle authentication errors
  if (error.message?.includes('Unauthorized')) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Authentication required',
    };
    return NextResponse.json(response, { status: HttpStatus.UNAUTHORIZED });
  }

  // Handle authorization errors
  if (error.message?.includes('Forbidden')) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'You do not have permission to access this resource',
    };
    return NextResponse.json(response, { status: HttpStatus.FORBIDDEN });
  }

  // Handle Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        const response: ApiResponse = {
          success: false,
          error: 'A record with this value already exists',
        };
        return NextResponse.json(response, { status: HttpStatus.CONFLICT });
      case 'P2025':
        const notFoundResponse: ApiResponse = {
          success: false,
          error: 'Record not found',
        };
        return NextResponse.json(notFoundResponse, { status: HttpStatus.NOT_FOUND });
      default:
        const dbErrorResponse: ApiResponse = {
          success: false,
          error: 'Database error occurred',
        };
        return NextResponse.json(dbErrorResponse, {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
    }
  }

  // Default error response
  const response: ApiResponse = {
    success: false,
    error: defaultMessage,
  };
  return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
}

/**
 * Wrap an API route handler with error handling
 * @param handler - The async route handler function
 * @returns Wrapped handler with error handling
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}