import { ApiError } from "./api-error";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: Record<string, unknown>;
}

async function apiRaw<T>(
  endpoint: string,
  method: HttpMethod,
  body?: unknown
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // ignore JSON parse failure
    }
    throw new ApiError(res.status, errorMessage);
  }

  return res.json();
}

// Unwrapped — returns `data` only (your current behavior)
export const api_get = <T,>(url: string) =>
  apiRaw<T>(url, "GET").then((r) => r.data);
export const api_post = <T,>(url: string, body: unknown) =>
  apiRaw<T>(url, "POST", body).then((r) => r.data);
export const api_put = <T,>(url: string, body: unknown) =>
  apiRaw<T>(url, "PUT", body).then((r) => r.data);
export const api_del = <T,>(url: string) =>
  apiRaw<T>(url, "DELETE").then((r) => r.data);
export const api_patch = <T,>(url: string, body: unknown) =>
  apiRaw<T>(url, "PATCH", body).then((r) => r.data);

// Full envelope — returns { data, pagination, success, meta }
export const api_get_full = <T,>(url: string) => apiRaw<T>(url, "GET");
export const api_post_full = <T,>(url: string, body: unknown) =>
  apiRaw<T>(url, "POST", body);