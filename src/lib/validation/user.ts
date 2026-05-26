import { z } from 'zod';

/**
 * User creation validation schema
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  plotNumber: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * User update validation schema
 */
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  plotNumber: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  emailVerified: z.union([z.string(), z.null()]).optional(), // Accept ISO date string or null
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * User query validation schema
 */
export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  role: z.enum(['USER', 'ADMIN']).optional(),
  search: z.string().optional(),
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;
