export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  database: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserResponse {
  user: User;
}

export interface ProfileLink {
  label: string;
  url: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string | null;
  headline: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  photoUrl: string | null;
  links: ProfileLink[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  profile: Profile;
}

export interface PhotoResponse {
  photoUrl: string | null;
  success?: boolean;
}
