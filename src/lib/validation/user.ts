import { z } from 'zod';

/**
 * Update user schema for validating user updates
 */
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  plotNumber: z.string().optional(),
  role: z.enum(['ADMIN', 'RESIDENT']).optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
