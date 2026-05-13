// src/db/sync/syncEngine.ts
import { db } from '../db';
import { supabase } from '../../lib/supabase';
import { marcarExitoso, marcarError } from './syncQueue';
import type { SyncQueueItem } from '../schema';

// Máximo de intentos antes de dejar un registro en estado 'error'
const MAX_INTENTOS = 3;

class SyncEngine {
  private corriendo = false;

  // Punto de entrada principal — lo llama useOnlineStatus al detectar conexión
  async procesarCola() {
    // Evita que se ejecute en paralelo si ya está procesando
    if (this.corriendo) return;
    if (!navigator.onLine) return;

    this.corriendo = true;
    console.log('[SyncEngine] Iniciando sincronización...');

    try {
      // Toma todos los pendientes ordenados por timestamp (FIFO)
      const pendientes = await db.sync_queue
        .where('estado').equals('pending')
        .sortBy('timestamp');

      console.log(`[SyncEngine] ${pendientes.length} operaciones pendientes`);

      for (const item of pendientes) {
        // Si perdió conexión durante el proceso, para y espera
        if (!navigator.onLine) {
          console.log('[SyncEngine] Conexión perdida, pausando...');
          break;
        }
        await this.procesarItem(item);
      }

      console.log('[SyncEngine] Sincronización completada');
    } finally {
      this.corriendo = false;
    }
  }

  private async procesarItem(item: SyncQueueItem) {
    if (!item.id) return;

    // Si ya superó el máximo de intentos, se deja en error y se salta
    if (item.intentos >= MAX_INTENTOS) {
      await marcarError(item.id, `Superó ${MAX_INTENTOS} intentos`);
      return;
    }

    // Marcar como 'processing' para que no lo tome otro proceso
    await db.sync_queue.update(item.id, { estado: 'processing' });

    try {
      await this.ejecutarEnSupabase(item);
      await marcarExitoso(item.id);

      // Actualizar el _sync_status del registro en Dexie a 'synced'
      await this.marcarRegistroSincronizado(item);

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`[SyncEngine] Error en ${item.tabla} ${item.operacion}:`, mensaje);
      await marcarError(item.id, mensaje);
    }
  }

  private async ejecutarEnSupabase(item: SyncQueueItem) {
    const payload = item.payload as Record<string, unknown>;

    // Limpiar campos internos de Dexie antes de enviar a Supabase
    const datos = limpiarPayload(payload);

    switch (item.operacion) {
      case 'INSERT': {
        const { error } = await supabase
          .from(item.tabla)
          .insert(datos);
        if (error) throw new Error(error.message);
        break;
      }

      case 'UPDATE': {
        const { error } = await supabase
          .from(item.tabla)
          .update(datos)
          .eq('id', item.pk_value);
        if (error) throw new Error(error.message);
        break;
      }

      case 'DELETE': {
        const { error } = await supabase
          .from(item.tabla)
          .delete()
          .eq('id', item.pk_value);
        if (error) throw new Error(error.message);
        break;
      }
    }
  }

  // Después de sincronizar, actualiza el registro local a 'synced'
  private async marcarRegistroSincronizado(item: SyncQueueItem) {
    const tablaMap: Record<string, any> = {
      recaudo: db.recaudo,
      contratos: db.contratos,
      clientes: db.clientes,
      gastos: db.gastos,
      motos: db.motos,
      gps: db.gps,
      soats: db.soats,
      estado_sistema: db.estado_sistema,
      notificaciones: db.notificaciones,
    };

    const tabla = tablaMap[item.tabla];
    if (!tabla) return;

    // estado_sistema usa 'fecha' como PK, el resto usan 'id'
    if (item.tabla === 'estado_sistema') {
      await tabla.update(item.pk_value, { _sync_status: 'synced' });
    } else {
      await tabla.update(Number(item.pk_value), { _sync_status: 'synced' });
    }
  }
}

// Elimina los campos internos de Dexie que no existen en Supabase
function limpiarPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const { _sync_status, _local_id, id, ...datos } = payload;
  return datos;
}

// Exportar instancia única (singleton)
export const syncEngine = new SyncEngine();