import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import type { UserRole } from '../../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: UserRole[];
  fallbackPath?: string;
}

export function RequireAuth({ children, roles, fallbackPath = '/login' }: RequireAuthProps) {
  const { user, rol, isAuthenticated } = useAuthContext();

  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (roles && rol && !roles.includes(rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso denegado</h2>
          <p className="text-slate-500">No tienes permiso para acceder a este módulo.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}