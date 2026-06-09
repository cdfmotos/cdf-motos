import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../modules/login/utils/authUtils';
import { getAuthSession, AUTH_USER_KEY, AUTH_TOKEN_KEY, clearAuthSession } from '../modules/login/utils/authUtils';
import { supabase } from '../lib/supabase';

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
    // 1. Escuchar los cambios de estado de autenticación en Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        clearUser();
        window.dispatchEvent(new CustomEvent('cdf-auth-event', { detail: { action: 'logout' } }));
      } else if (session?.user) {
        localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
      }
    });

    // 2. Verificar la sesión actual al cargar
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        clearUser();
        window.dispatchEvent(new CustomEvent('cdf-auth-event', { detail: { action: 'logout' } }));
      } else {
        localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
      }
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
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
    clearAuthSession();
  };

  useEffect(() => {
    const handleAuthEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string; user?: AuthUser | null }>;
      if (customEvent.detail?.action === 'login' && customEvent.detail?.user) {
        setUser(customEvent.detail.user);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(customEvent.detail.user));
      } else if (customEvent.detail?.action === 'logout') {
        setUser(null);
        clearAuthSession();
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