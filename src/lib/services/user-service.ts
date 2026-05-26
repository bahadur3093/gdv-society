/**
 * User Service
 * Handles user profile and user management operations
 */

import { apiClient } from '@/lib/api-client';
import type { User } from '@/types';

export class UserService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/me');
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<User> {
    return apiClient.get<User>(`/users/${userId}`);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/users/${userId}`, data);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`/users/${userId}`);
  }
}

export const userService = new UserService();
