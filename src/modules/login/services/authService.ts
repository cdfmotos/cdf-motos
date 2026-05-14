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

export interface RegisterData {
  nombre_completo: string;
  cedula: string;
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const CEDULA_REGEX = /^[0-9]{6,12}$/;

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>\"'%;()&+]/g, '');
}

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/\s+/g, '');
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

export async function recuperarContrasena(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanEmail = sanitizeEmail(email);

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, message: 'Ingresa un correo electrónico válido' };
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('estado, email')
      .eq('email', cleanEmail)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error buscando usuario:', fetchError);
      return { success: false, message: 'Error al verificar el usuario. Intenta de nuevo.' };
    }

    if (!existingUser) {
      return { success: false, message: 'Este correo electrónico no está registrado' };
    }

    if (existingUser.estado !== true) {
      return { success: false, message: 'El usuario está inactivo. Contacta al administrador para activar tu cuenta.' };
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      console.error('Error enviando correo de recuperación:', resetError);
      return { success: false, message: 'No se pudo enviar el correo de recuperación. Intenta de nuevo.' };
    }

    return { success: true, message: 'Revisa tu correo electrónico para restablecer la contraseña' };
  } catch (error) {
    console.error('Error en recuperarContrasena:', error);
    return { success: false, message: 'Ocurrió un error inesperado. Intenta de nuevo.' };
  }
}

export async function registrarUsuario(data: RegisterData): Promise<{ success: boolean; message: string }> {
  try {
    const nombre = sanitizeInput(data.nombre_completo);
    const cedula = sanitizeInput(data.cedula);
    const email = sanitizeEmail(data.email);
    const password = data.password;

    if (!nombre) return { success: false, message: 'El nombre es obligatorio' };
    if (!CEDULA_REGEX.test(cedula)) return { success: false, message: 'La cédula debe tener entre 6 y 12 dígitos numéricos' };
    if (!EMAIL_REGEX.test(email)) return { success: false, message: 'Ingresa un correo electrónico válido' };
    if (password.length < 8) return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };

    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre_completo: nombre, cedula }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
        return { success: false, message: 'Este correo ya está registrado. ¿Olvidaste tu contraseña?' };
      }
      console.error('Error en signUp:', signUpError);
      return { success: false, message: 'No se pudo crear la cuenta. Intenta de nuevo.' };
    }

    if (!authUser.user) {
      return { success: false, message: 'Error al crear la cuenta. Intenta de nuevo.' };
    }

    const { error: insertError } = await supabase.from('users').insert({
      id: authUser.user.id,
      email,
      nombre_completo: nombre,
      cedula,
      rol: 'Cajero',
      estado: false,
    });

    if (insertError) {
      console.error('Error insertando en users:', insertError);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return { success: false, message: 'Error al registrar el usuario. Intenta de nuevo.' };
    }

    return { success: true, message: 'Registro exitoso. El administrador activará tu cuenta pronto.' };
  } catch (error) {
    console.error('Error en registrarUsuario:', error);
    return { success: false, message: 'Ocurrió un error inesperado. Intenta de nuevo.' };
  }
}
