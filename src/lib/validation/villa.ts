import { z } from 'zod';

/**
 * Create villa schema for validating villa creation
 */
export const createVillaSchema = z.object({
  villaNo: z.number().int().positive('Villa number must be a positive integer'),
  type: z.string().min(1, 'Villa type is required'),
  areaInSqM: z.number().positive('Area must be a positive number'),
  areaInSqFt: z.number().positive('Area must be a positive number'),
  ownerName: z.string().min(1, 'Owner name is required'),
  remarks: z.string().optional(),
});

export type CreateVillaSchema = z.infer<typeof createVillaSchema>;

/**
 * Update villa schema for validating villa updates
 */
export const updateVillaSchema = z.object({
  type: z.string().min(1, 'Villa type is required').optional(),
  areaInSqM: z.number().positive('Area must be a positive number').optional(),
  areaInSqFt: z.number().positive('Area must be a positive number').optional(),
  ownerName: z.string().min(1, 'Owner name is required').optional(),
  remarks: z.string().optional(),
});

export type UpdateVillaSchema = z.infer<typeof updateVillaSchema>;
