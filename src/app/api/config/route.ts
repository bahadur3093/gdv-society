import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { appConfigSchema } from '@/lib/validation/common';
import type { ApiResponse } from '@/types';
import { HttpStatus } from '@/types';

/**
 * GET /api/config
 * Retrieves app configuration by config_key
 * Query params: key (required)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const configKey = searchParams.get('key');

    if (!configKey) {
      const response: ApiResponse = {
        success: false,
        error: 'Config key is required',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const config = await prisma.appConfig.findUnique({
      where: {
        configKey,
      },
    });

    if (!config) {
      const response: ApiResponse = {
        success: false,
        error: `Configuration not found for key: ${configKey}`,
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        id: config.id,
        config_key: config.configKey,
        config_value: config.configValue,
        updated_at: config.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: unknown) {
    console.error('Get config error:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch configuration',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * POST /api/config
 * Creates or updates app configuration
 * Body: { config_key: string, config_value: any }
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth();

    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = appConfigSchema.safeParse(body);
    
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        message: validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', '),
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Support both snake_case and camelCase
    const config_key = validationResult.data.config_key || validationResult.data.configKey || '';
    const config_value = validationResult.data.config_value || validationResult.data.configValue || [];

    // Upsert configuration (create or update)
    const config = await prisma.appConfig.upsert({
      where: {
        configKey: config_key,
      },
      update: {
        configValue: config_value,
      },
      create: {
        configKey: config_key,
        configValue: config_value,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: config.id,
        config_key: config.configKey,
        config_value: config.configValue,
        updated_at: config.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.CREATED });
  } catch (error: unknown) {
    console.error('Create/Update config error:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to save configuration',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * PUT /api/config
 * Updates existing app configuration
 * Body: { config_key: string, config_value: any }
 */
export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth();

    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = appConfigSchema.safeParse(body);
    
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        message: validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', '),
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Support both snake_case and camelCase
    const config_key = validationResult.data.config_key || validationResult.data.configKey || '';
    const config_value = validationResult.data.config_value || validationResult.data.configValue || [];

    // Check if config exists
    const existingConfig = await prisma.appConfig.findUnique({
      where: {
        configKey: config_key,
      },
    });

    if (!existingConfig) {
      const response: ApiResponse = {
        success: false,
        error: `Configuration not found for key: ${config_key}`,
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Update configuration
    const config = await prisma.appConfig.update({
      where: {
        configKey: config_key,
      },
      data: {
        configValue: config_value,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: config.id,
        config_key: config.configKey,
        config_value: config.configValue,
        updated_at: config.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: unknown) {
    console.error('Update config error:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to update configuration',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}

/**
 * DELETE /api/config
 * Deletes app configuration by config_key
 * Query params: key (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const configKey = searchParams.get('key');

    if (!configKey) {
      const response: ApiResponse = {
        success: false,
        error: 'Config key is required',
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Check if config exists
    const existingConfig = await prisma.appConfig.findUnique({
      where: {
        configKey,
      },
    });

    if (!existingConfig) {
      const response: ApiResponse = {
        success: false,
        error: `Configuration not found for key: ${configKey}`,
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Delete configuration
    await prisma.appConfig.delete({
      where: {
        configKey,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        message: `Configuration deleted successfully for key: ${configKey}`,
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: unknown) {
    console.error('Delete config error:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete configuration',
    };
    return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
