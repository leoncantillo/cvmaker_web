import { env } from '../../config/env';
import type {
  ApiErrorResponse,
  AuthResponse,
  CVListResponse,
  CVResponse,
  HealthResponse,
  PhotoResponse,
  Profile,
  ProfileResponse,
  UserResponse,
} from './types';

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

export class ApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    let response: Response;

    const headers: Record<string, string> = {};

    if (!(options.body instanceof FormData) && options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      response = await fetch(`${env.apiUrl}${path}`, {
        ...options,
        headers: {
          ...headers,
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

  register(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.post<AuthResponse, { email: string; password: string }>('/api/auth/register', credentials);
  }

  login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.post<AuthResponse, { email: string; password: string }>('/api/auth/login', credentials);
  }

  getMe(): Promise<UserResponse> {
    return this.get<UserResponse>('/api/auth/me');
  }

  getProfile(): Promise<ProfileResponse> {
    return this.get<ProfileResponse>('/api/profile');
  }

  updateProfile(profileData: Partial<Profile>): Promise<ProfileResponse> {
    return this.put<ProfileResponse, Partial<Profile>>('/api/profile', profileData);
  }

  uploadPhoto(file: File): Promise<PhotoResponse> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.request<PhotoResponse>('/api/profile/photo', {
      method: 'POST',
      body: formData,
    });
  }

  deletePhoto(): Promise<PhotoResponse> {
    return this.delete<PhotoResponse>('/api/profile/photo');
  }

  listCVs(): Promise<CVListResponse> {
    return this.get<CVListResponse>('/api/cvs');
  }

  createCV(title?: string, importProfile = true): Promise<CVResponse> {
    return this.post<CVResponse, { title?: string; importProfile?: boolean }>('/api/cvs', {
      ...(title !== undefined ? { title } : {}),
      importProfile,
    });
  }

  getCV(id: string): Promise<CVResponse> {
    return this.get<CVResponse>(`/api/cvs/${id}`);
  }

  updateCV(id: string, data: Record<string, unknown>): Promise<CVResponse> {
    return this.put<CVResponse, Record<string, unknown>>(`/api/cvs/${id}`, data);
  }

  duplicateCV(id: string): Promise<CVResponse> {
    return this.post<CVResponse, Record<string, never>>(`/api/cvs/${id}/duplicate`, {});
  }

  deleteCV(id: string): Promise<{ success: boolean; id: string }> {
    return this.delete<{ success: boolean; id: string }>(`/api/cvs/${id}`);
  }
}

export const apiClient = new ApiClient();
