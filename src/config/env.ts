interface EnvironmentConfig {
  readonly apiUrl: string;
}

const apiUrl = import.meta.env.VITE_API_URL?.trim();

if (apiUrl === undefined || apiUrl.length === 0) {
  throw new Error('VITE_API_URL must be configured.');
}

export const env: EnvironmentConfig = {
  apiUrl: apiUrl.replace(/\/$/, ''),
};
