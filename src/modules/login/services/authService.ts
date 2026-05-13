import { supabase } from '../../../lib/supabase';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    nombre_completo: string;
    rol: string;
    estado: boolean;
    cedula: string;
  };
  token?: string;
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    if (!credentials.password) {
      return { success: false, message: 'La contraseña es obligatoria' };
    }

    // 1. Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return { success: false, message: authError.message };
    }

    if (!authData.user || !authData.session) {
      return { success: false, message: 'Error al iniciar sesión' };
    }

    // 2. Buscar el usuario en la tabla 'users' de Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user) {
      return { success: false, message: 'Usuario no encontrado en la base de datos' };
    }

    // 3. Validar estado = true
    if (user.estado !== true) {
      // Si está inactivo, cerramos la sesión que se acaba de abrir
      await supabase.auth.signOut();
      return { success: false, message: 'El usuario se encuentra inactivo' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        nombre_completo: user.nombre_completo || '',
        rol: user.rol || 'user',
        estado: user.estado || false,
        cedula: user.cedula || ''
      },
      token: authData.session.access_token,
    };
  } catch (error) {
    console.error('Error in loginService:', error);
    return { success: false, message: 'Ocurrió un error al iniciar sesión' };
  }
}
