import { supabase } from '../../../lib/supabase';
import { encolar } from '../../../db/sync/syncQueue';
import { setAuthSession, getAuthSession } from '../../../modules/login/utils/authUtils';
import type { AuthUser } from '../../../modules/login/utils/authUtils';

export async function updateUserProfile(
  userId: string,
  updates: { nombre_completo: string; cedula: string },
  isOnline: boolean
): Promise<AuthUser> {
  const { user: currentUser } = getAuthSession();
  if (!currentUser) throw new Error('Usuario no encontrado');

  const usuarioActualizado: AuthUser = {
    ...currentUser,
    nombre_completo: updates.nombre_completo,
    cedula: updates.cedula,
  };

  if (isOnline) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          nombre_completo: updates.nombre_completo,
          cedula: updates.cedula,
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (err) {
      console.error('Error actualizando perfil en Supabase:', err);
      await encolar({
        tabla: 'users',
        operacion: 'UPDATE',
        payload: {
          id: userId,
          nombre_completo: updates.nombre_completo,
          cedula: updates.cedula,
        },
        pk_value: userId,
      });
    }
  } else {
    await encolar({
      tabla: 'users',
      operacion: 'UPDATE',
      payload: {
        id: userId,
        nombre_completo: updates.nombre_completo,
        cedula: updates.cedula,
      },
      pk_value: userId,
    });
  }

  const token = localStorage.getItem('cdf_motos_auth_token');
  if (token) {
    setAuthSession(usuarioActualizado, token);
  }

  return usuarioActualizado;
}