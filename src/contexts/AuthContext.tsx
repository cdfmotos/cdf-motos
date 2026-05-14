import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../modules/login/utils/authUtils';
import { getAuthSession, AUTH_USER_KEY } from '../modules/login/utils/authUtils';

export type UserRole = 'Admin' | 'Cajero' | 'Socio';

export interface AuthContextType {
  user: AuthUser | null;
  rol: UserRole | null;
  isAdmin: boolean;
  isCajero: boolean;
  isSocio: boolean;
  isAuthenticated: boolean;
  updateUser: (user: AuthUser) => void;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = getAuthSession();
  const [user, setUser] = useState<AuthUser | null>(session.user);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_USER_KEY) {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  useEffect(() => {
    const handleAuthEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string; user?: AuthUser | null }>;
      if (customEvent.detail?.action === 'login' && customEvent.detail?.user) {
        setUser(customEvent.detail.user);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(customEvent.detail.user));
      } else if (customEvent.detail?.action === 'logout') {
        setUser(null);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    };

    window.addEventListener('cdf-auth-event', handleAuthEvent);
    return () => window.removeEventListener('cdf-auth-event', handleAuthEvent);
  }, []);

  const rol = (user?.rol as UserRole) ?? null;
  const isAdmin = rol === 'Admin';
  const isCajero = rol === 'Cajero';
  const isSocio = rol === 'Socio';

  return (
    <AuthContext.Provider value={{
      user,
      rol,
      isAdmin,
      isCajero,
      isSocio,
      isAuthenticated: !!user,
      updateUser,
      clearUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}