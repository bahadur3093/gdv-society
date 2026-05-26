/**
 * Request Service
 * Handles resident requests and admin request management
 */

import { apiClient } from '@/lib/api-client';
import type { PasswordResetRequest } from '@/types';

export interface CreateResetRequestParams {
  userId: string;
}

export interface ApproveResetRequestParams {
  requestId: string;
}

export interface DenyResetRequestParams {
  requestId: string;
}

export class RequestService {
  /**
   * Get all reset requests (admin only)
   */
  async getAllResetRequests(): Promise<PasswordResetRequest[]> {
    return apiClient.get<PasswordResetRequest[]>('/admin/reset-requests');
  }

  /**
   * Approve reset request (admin only)
   */
  async approveResetRequest(requestId: string): Promise<PasswordResetRequest> {
    return apiClient.post<PasswordResetRequest>(
      `/admin/reset-requests/${requestId}/approve`
    );
  }

  /**
   * Deny reset request (admin only)
   */
  async denyResetRequest(requestId: string): Promise<PasswordResetRequest> {
    return apiClient.post<PasswordResetRequest>(
      `/admin/reset-requests/${requestId}/deny`
    );
  }
}

export const requestService = new RequestService();
