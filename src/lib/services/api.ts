// lib/api.ts

import { ApiError } from "./api-error";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiResponse<T> {
  data: T;
  success: boolean;
}

async function api<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    throw new ApiError(res.status, res.statusText);
  }
  const json: ApiResponse<T> = await res.json();

  return json.data;
}

// Shorthand methods
export const api_get = <T>(url: string) => api<T>(url, "GET");
export const api_post = <T>(url: string, body: unknown) =>
  api<T>(url, "POST", body);
export const api_put = <T>(url: string, body: unknown) =>
  api<T>(url, "PUT", body);
export const api_del = <T>(url: string) => api<T>(url, "DELETE");
export const api_patch = <T>(url: string, body: unknown) =>
  api<T>(url, "PATCH", body);
