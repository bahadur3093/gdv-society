/**
 * User Service
 * Handles user profile and user management operations
 */

import { apiClient } from '@/lib/api-client';
import { AppUser } from '@/types/auth';

export class UserService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<AppUser> {
    return apiClient.get<AppUser>('/users/me');
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<AppUser> {
    return apiClient.get<AppUser>(`/users/${userId}`);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<AppUser[]> {
    return apiClient.get<AppUser[]>('/users');
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: Partial<AppUser>): Promise<AppUser> {
    return apiClient.put<AppUser>(`/users/${userId}`, data);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`/users/${userId}`);
  }
}

export const userService = new UserService();
