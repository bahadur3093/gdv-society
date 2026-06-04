import { z } from 'zod';
import { HttpStatus } from '@/types';

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  statusCode: number;
  validationErrors: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    validationErrors: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.validationErrors = validationErrors;
  }
}

/**
 * Validates request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and parsed data
 * @throws ValidationError with statusCode 400 if validation fails
 */
export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const validationErrors = result.error.issues.map((err: z.ZodIssue) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    throw new ValidationError('Validation failed', validationErrors);
  }

  return result.data;
}

/**
 * Pagination schema for validating query parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).default(10).catch(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;

// Export ValidationError for use in other modules
export { ValidationError };

/**
 * App config schema for validating configuration data
 */
export const appConfigItemSchema = z.object({
  value: z.string(),
  label: z.string(),
  icon: z.string(),
  description: z.string(),
  enable: z.boolean(),
});

export const appConfigSchema = z.object({
  config_key: z.string().min(1).max(100).optional(),
  config_value: z.array(appConfigItemSchema).or(z.record(z.string(), z.any())).optional(),
  configKey: z.string().min(1).max(100).optional(),
  configValue: z.array(appConfigItemSchema).or(z.record(z.string(), z.any())).optional(),
}).refine(
  (data) => (data.config_key || data.configKey) && (data.config_value || data.configValue),
  {
    message: 'Either config_key/config_value or configKey/configValue must be provided',
  }
);

export type AppConfigItemSchema = z.infer<typeof appConfigItemSchema>;
export type AppConfigSchema = z.infer<typeof appConfigSchema>;
