/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */

import { signIn, signOut } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import type { SignUpRequest } from '@/types';
import { AppUser } from '@/types/auth';

export interface SignInParams {
  email: string;
  password: string;
  callbackUrl?: string;
}

export interface SignInResult {
  success: boolean;
  error?: string;
  url?: string;
}

export class AuthService {
  /**
   * Sign in user with credentials
   */
  async signIn({ email, password, callbackUrl = '/dashboard' }: SignInParams): Promise<SignInResult> {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      return {
        success: true,
        url: result?.url || callbackUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An error occurred during sign in',
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(callbackUrl: string = '/auth/signin'): Promise<void> {
    await signOut({ callbackUrl });
  }

  /**
   * Register new user
   */
  async signUp(data: SignUpRequest): Promise<AppUser> {
    return apiClient.post<AppUser>('/auth/signup', data);
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return apiClient.post<void>('/auth/reset-password', {
      token,
      password: newPassword,
    });
  }
}

export const authService = new AuthService();
