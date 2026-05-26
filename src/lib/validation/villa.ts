import { z } from 'zod';

/**
 * Validation schema for creating a new villa
 */
export const createVillaSchema = z.object({
  villaNo: z.number().int().positive('Villa number must be a positive integer'),
  type: z.string().min(1, 'Villa type is required'),
  areaInSqM: z.number().positive('Area in square meters must be positive'),
  ownerName: z.string().min(1, 'Owner name is required'),
  areaInSqFt: z.number().positive('Area in square feet must be positive'),
  remarks: z.string().optional(),
});

/**
 * Validation schema for updating villa information
 * All fields are optional for partial updates
 */
export const updateVillaSchema = z.object({
  type: z.string().min(1, 'Villa type is required').optional(),
  areaInSqM: z.number().positive('Area in square meters must be positive').optional(),
  ownerName: z.string().min(1, 'Owner name is required').optional(),
  areaInSqFt: z.number().positive('Area in square feet must be positive').optional(),
  remarks: z.string().optional(),
});

export type CreateVillaInput = z.infer<typeof createVillaSchema>;
export type UpdateVillaInput = z.infer<typeof updateVillaSchema>;
