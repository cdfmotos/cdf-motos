import { db } from '../../../db/db';
import { encolar } from '../../../db/sync/syncQueue';
import { supabase } from '../../../lib/supabase';
import type { EstadoSistema } from '../../../db/schema';

export async function getHistorialEstadoSistema(): Promise<EstadoSistema[]> {
  return await db.estado_sistema.orderBy('fecha').reverse().toArray();
}

export async function updateEstadoSistema(
  fecha: string, 
  updates: Partial<EstadoSistema>, 
  isOnline: boolean
): Promise<EstadoSistema> {
  let estadoExistente = await db.estado_sistema.where('fecha').equals(fecha).first();
  
  if (!estadoExistente) {
    // Si no existe, lo creamos
    estadoExistente = {
      fecha,
      abierto: true,
      actualizado_en: new Date().toISOString(),
      actualizado_por: 'Sistema',
      observacion: null,
      _sync_status: 'pending'
    };
  }

  const estadoActualizado: EstadoSistema = {
    ...estadoExistente,
    ...updates,
    actualizado_en: new Date().toISOString(),
  };

  if (isOnline) {
    // Si hay internet, intentar actualizar directamente en Supabase
    try {
      const { data, error } = await supabase
        .from('estado_sistema')
        .upsert({
          fecha: estadoActualizado.fecha,
          abierto: estadoActualizado.abierto,
          observacion: estadoActualizado.observacion,
          actualizado_en: estadoActualizado.actualizado_en,
          actualizado_por: estadoActualizado.actualizado_por,
        })
        .select()
        .single();

      if (!error && data) {
        estadoActualizado._sync_status = 'synced';
        await db.estado_sistema.put(estadoActualizado);
        return estadoActualizado;
      }
    } catch (err) {
      console.error('Error actualizando estado en Supabase, cayendo a offline', err);
    }
  }

  // Comportamiento Offline o si Supabase falló
  estadoActualizado._sync_status = 'pending';
  await db.estado_sistema.put(estadoActualizado);

  await encolar({
    tabla: 'estado_sistema',
    operacion: 'UPDATE', // o INSERT dependiendo si existía, el backend debe manejar upsert preferiblemente
    payload: estadoActualizado,
    pk_value: estadoActualizado.fecha,
  });

  return estadoActualizado;
}
