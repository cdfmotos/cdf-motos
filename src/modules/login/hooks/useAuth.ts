import { useState } from 'react';
import { loginUser} from '../services/authService';
import type { LoginCredentials } from '../services/authService';
import { setAuthSession, getAuthSession, clearAuthSession} from '../utils/authUtils';
import type { AuthUser } from '../utils/authUtils';

export function useAuth() {
  const session = getAuthSession();
  const [user, setUser] = useState<AuthUser | null>(session.user);

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };
  const [token, setToken] = useState<string | null>(session.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      
      if (response.success && response.user && response.token) {
        setAuthSession(response.user, response.token);
        setUser(response.user);
        setToken(response.token);
        return true;
      } else {
        setError(response.message || 'Error desconocido');
        return false;
      }
    } catch (err) {
      setError('Ocurrió un error al intentar autenticar.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
  };

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    logout,
    updateUser,
  };
}
