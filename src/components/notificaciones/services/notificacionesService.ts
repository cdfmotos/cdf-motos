import { db } from '../../../db/db';
import { supabase } from '../../../lib/supabase';
import { encolar } from '../../../db/sync/syncQueue';
import type { Notificacion, UsuarioNotificacion } from '../../../db/schema';

export interface NotificacionConEstado extends Notificacion {
  estado_lectura: 'leida' | 'no_leida';
  usuario_notificacion_id?: number;
}

export async function getNotificacionesUsuario(usuarioId: string, isOnline: boolean): Promise<NotificacionConEstado[]> {
  if (isOnline) {
    try {
      const { data, error } = await supabase
        .from('usuario_notificaciones')
        .select(`
          id,
          estado,
          notificaciones (
            id,
            tipo,
            mensaje,
            contrato_id,
            created_at
          )
        `)
        .eq('usuario_id', usuarioId)
        .order('id', { ascending: false })
        .limit(50);

      if (!error && data) {
        // Actualizar caché local
        const notificacionesLocales: Notificacion[] = [];
        const usrNotificacionesLocales: UsuarioNotificacion[] = [];

        const result = data.map((item: any) => {
          const noti = item.notificaciones;
          
          notificacionesLocales.push(noti);
          usrNotificacionesLocales.push({
            id: item.id,
            usuario_id: usuarioId,
            notificacion_id: noti.id,
            estado: item.estado,
            leida_at: item.estado === 'leida' ? new Date().toISOString() : null,
            _sync_status: 'synced'
          });

          return {
            ...noti,
            estado_lectura: item.estado,
            usuario_notificacion_id: item.id
          } as NotificacionConEstado;
        });

        // Guardar en background
        db.transaction('rw', db.notificaciones, db.usuario_notificaciones, async () => {
          await db.notificaciones.bulkPut(notificacionesLocales);
          await db.usuario_notificaciones.bulkPut(usrNotificacionesLocales);
        }).catch(e => console.error('Error guardando caché de notificaciones', e));

        return result;
      }
    } catch (err) {
      console.error('Error cargando notificaciones online, cayendo a local', err);
    }
  }

  // Carga Local (Offline)
  const usrNotifs = await db.usuario_notificaciones
    .where('usuario_id')
    .equals(usuarioId)
    .reverse()
    .sortBy('id');

  const result: NotificacionConEstado[] = [];

  for (const un of usrNotifs) {
    const noti = await db.notificaciones.get(un.notificacion_id);
    if (noti) {
      result.push({
        ...noti,
        estado_lectura: un.estado as 'leida' | 'no_leida',
        usuario_notificacion_id: un.id
      });
    }
  }

  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function marcarNotificacionLeida(
  usuarioNotificacionId: number, 
  isOnline: boolean
): Promise<void> {
  const usrNotif = await db.usuario_notificaciones.get(usuarioNotificacionId);
  if (!usrNotif) return;

  const actualizacion: UsuarioNotificacion = {
    ...usrNotif,
    estado: 'leida',
    leida_at: new Date().toISOString(),
    _sync_status: isOnline ? 'synced' : 'pending'
  };

  if (isOnline) {
    try {
      const { error } = await supabase
        .from('usuario_notificaciones')
        .update({ estado: 'leida', leida_at: actualizacion.leida_at })
        .eq('id', usuarioNotificacionId);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error marcando leída en Supabase, encolando...', err);
      actualizacion._sync_status = 'pending';
    }
  }

  await db.usuario_notificaciones.put(actualizacion);

  if (actualizacion._sync_status === 'pending') {
    await encolar({
      tabla: 'usuario_notificaciones',
      operacion: 'UPDATE',
      payload: actualizacion,
      pk_value: actualizacion.id,
    });
  }
}
