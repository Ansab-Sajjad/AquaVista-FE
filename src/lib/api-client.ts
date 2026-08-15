export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface FetchOptions extends RequestInit {
  skipJsonParse?: boolean;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipJsonParse, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(headers || {}),
    },
    credentials: "include",
  });

  if (response.status === 401) {
    // Try to refresh the token once
    const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Retry the original request with the new cookie
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: {
          ...(headers || {}),
        },
        credentials: "include",
      });

      if (!retryResponse.ok) {
        const data = await retryResponse.json().catch(() => null);
        throw new ApiError(data?.message || "Request failed", retryResponse.status);
      }

      if (skipJsonParse) return retryResponse as unknown as T;
      return retryResponse.json() as Promise<T>;
    }

    // Refresh failed — redirect to login
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("aquavista-user");
      window.dispatchEvent(new CustomEvent("auth-user-change", { detail: null }));
    }
    throw new ApiError("Session expired", 401);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(data?.message || "Request failed", response.status);
  }

  if (skipJsonParse) return response as unknown as T;
  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),

  upload: <T>(path: string, formData: FormData, options?: FetchOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: formData,
    }),

  raw: <T>(path: string, options?: FetchOptions) =>
    request<T>(path, { ...options, skipJsonParse: true }),
};
