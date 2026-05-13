export const AUTH_TOKEN_KEY = 'cdf_motos_auth_token';
export const AUTH_USER_KEY = 'cdf_motos_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  nombre_completo: string;
  rol: string;
  estado: boolean;
  cedula: string;
}

export function setAuthSession(user: AuthUser, token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAuthSession(): { user: AuthUser | null; token: string | null } {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  const user = userStr ? JSON.parse(userStr) : null;
  return { user, token };
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
