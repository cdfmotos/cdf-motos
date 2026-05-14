// src/db/sync/syncEngine.ts

import { db } from '../db';
import { supabase } from '../../lib/supabase';
import { marcarExitoso, marcarError } from './syncQueue';

import type { SyncQueueItem } from '../schema';
import type { Database } from '../../types/database.types';

// Máximo de intentos antes de dejar un registro en estado 'error'
const MAX_INTENTOS = 3;

// Tipo seguro de tablas válidas de Supabase
type TablaSupabase = keyof Database['public']['Tables'];

class SyncEngine {
  private corriendo = false;

  async procesarCola() {
    if (this.corriendo) return;
    if (!navigator.onLine) return;

    this.corriendo = true;

    console.log('[SyncEngine] Iniciando sincronización...');

    try {
      const pendientes = await db.sync_queue
        .where('estado')
        .equals('pending')
        .sortBy('timestamp');

      console.log(`[SyncEngine] ${pendientes.length} operaciones pendientes`);

      for (const item of pendientes) {
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

    if (item.intentos >= MAX_INTENTOS) {
      await marcarError(item.id, `Superó ${MAX_INTENTOS} intentos`);
      return;
    }

    await db.sync_queue.update(item.id, {
      estado: 'processing',
    });

    try {
      await this.ejecutarEnSupabase(item);

      await marcarExitoso(item.id);

      await this.marcarRegistroSincronizado(item);

    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'Error desconocido';

      console.error(
        `[SyncEngine] Error en ${item.tabla} ${item.operacion}:`,
        mensaje
      );

      await marcarError(item.id, mensaje);
    }
  }

  private async ejecutarEnSupabase(item: SyncQueueItem) {

    // Cast seguro de tabla
    const tabla = item.tabla as TablaSupabase;

    // Payload limpio
    const datos = limpiarPayload(
      item.payload as Record<string, unknown>
    );

    switch (item.operacion) {

      case 'INSERT': {

        const { error } = await supabase
          .from(tabla)
          .insert(datos as never);

        if (error) {
          throw new Error(error.message);
        }

        break;
      }

      case 'UPDATE': {

        const { error } = await supabase
          .from(tabla)
          .update(datos as never)
          .eq('id', item.pk_value);

        if (error) {
          throw new Error(error.message);
        }

        break;
      }

      case 'DELETE': {

        const { error } = await supabase
          .from(tabla)
          .delete()
          .eq('id', item.pk_value);

        if (error) {
          throw new Error(error.message);
        }

        break;
      }
    }
  }

  private async marcarRegistroSincronizado(
    item: SyncQueueItem
  ) {

    const tablaMap = {
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

    const tabla =
      tablaMap[item.tabla as keyof typeof tablaMap];

    if (!tabla) return;

    if (item.tabla === 'estado_sistema') {

      await tabla.update(item.pk_value, {
        _sync_status: 'synced',
      });

    } else {

      await tabla.update(Number(item.pk_value), {
        _sync_status: 'synced',
      });
    }
  }
}

// Elimina campos internos de Dexie
function limpiarPayload(
  payload: Record<string, unknown>
) {

  const {
    _sync_status,
    _local_id,
    id,
    ...datos
  } = payload;

  return datos;
}

export const syncEngine = new SyncEngine();