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
