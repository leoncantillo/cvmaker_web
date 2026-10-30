import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function ProtectedRoute({ children }: { children: ReactElement }): ReactElement {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-spinner">Cargando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
