import { env } from '../../config/env';
import type { ApiErrorResponse, HealthResponse } from './types';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null || !('error' in value)) {
    return false;
  }

  const { error } = value;

  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

async function readApiError(response: Response): Promise<ApiError> {
  try {
    const payload: unknown = await response.json();

    if (isApiErrorResponse(payload)) {
      return new ApiError(
        payload.error.code,
        payload.error.message,
        response.status,
        payload.error.details,
      );
    }
  } catch {
    // A non-JSON error response uses the standard fallback below.
  }

  return new ApiError(
    `HTTP_${response.status}`,
    `Request failed with status ${response.status}.`,
    response.status,
  );
}

class ApiClient {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${env.apiUrl}${path}`, {
        ...options,
        headers: {
          ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
      });
    } catch {
      throw new ApiError('NETWORK_ERROR', 'Unable to reach the API.', 0);
    }

    if (!response.ok) {
      throw await readApiError(response);
    }

    return (await response.json()) as T;
  }

  get<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T, B>(path: string, body: B, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T, B>(path: string, body: B, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  checkHealth(): Promise<HealthResponse> {
    return this.get<HealthResponse>('/api/health');
  }
}

export const apiClient = new ApiClient();
