import {
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { apiClient } from '../services/api/client';
import type { User } from '../services/api/types';
import { AuthContext, type AuthContextType } from './AuthContextDefinition';

const TOKEN_STORAGE_KEY = 'cvmaker_token';

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth(): Promise<void> {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      apiClient.setAuthToken(storedToken);

      try {
        const response = await apiClient.getMe();
        if (isMounted) {
          setUser(response.user);
          setToken(storedToken);
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          apiClient.setAuthToken(null);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await apiClient.login({ email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    apiClient.setAuthToken(response.token);
    setUser(response.user);
    setToken(response.token);
  };

  const register = async (email: string, password: string): Promise<void> => {
    const response = await apiClient.register({ email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    apiClient.setAuthToken(response.token);
    setUser(response.user);
    setToken(response.token);
  };

  const logout = (): void => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    apiClient.setAuthToken(null);
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
