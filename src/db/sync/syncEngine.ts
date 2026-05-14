import { db } from '../db';
import { supabase } from '../../lib/supabase';
import { marcarExitoso, marcarError } from './syncQueue';
import { limpiarPayload } from '../../utils/sync';

import type { SyncQueueItem } from '../schema';
import type { Database } from '../../types/database.types';

const MAX_INTENTOS = 3;

type TablaSupabase = keyof Database['public']['Tables'];

class SyncEngine {

  private corriendo = false;

  async procesarCola() {

    if (this.corriendo) return;

    if (!navigator.onLine) return;

    this.corriendo = true;

    console.log(
      '[SyncEngine] Iniciando sincronización...'
    );

    try {

      const pendientes = await db.sync_queue
        .where('estado')
        .equals('pending')
        .sortBy('timestamp');

      console.log(
        `[SyncEngine] ${pendientes.length} operaciones pendientes`
      );

      for (const item of pendientes) {

        if (!navigator.onLine) {

          console.log(
            '[SyncEngine] Conexión perdida, pausando...'
          );

          break;
        }

        await this.procesarItem(item);
      }

      console.log(
        '[SyncEngine] Sincronización completada'
      );

    } finally {

      this.corriendo = false;
    }
  }

  private async procesarItem(
    item: SyncQueueItem
  ) {

    if (!item.id) return;

    if (item.intentos >= MAX_INTENTOS) {

      await marcarError(
        item.id,
        `Superó ${MAX_INTENTOS} intentos`
      );

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
    const tabla = item.tabla as TablaSupabase;

    switch (item.operacion) {

      case 'INSERT': {
        const pkStr = String(item.pk_value);
        const datos = limpiarPayload(item.payload as Record<string, unknown>);

        const { data, error } = await supabase
          .from(tabla)
          .insert(datos as any)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (pkStr.startsWith('local-') && (data as any)?.id != null) {
          const tablaMap: Record<string, any> = {
            recaudo: db.recaudo,
            clientes: db.clientes,
            contratos: db.contratos,
            gastos: db.gastos,
            motos: db.motos,
            gps: db.gps,
            soats: db.soats,
            estado_sistema: db.estado_sistema,
            notificaciones: db.notificaciones,
          };
          const dexieTabla = tablaMap[item.tabla];
          if (dexieTabla) {
            await dexieTabla.where('_local_id').equals(pkStr).modify({
              id: (data as any).id,
              _sync_status: 'synced',
            });
          }
        }

        break;
      }

      case 'UPDATE': {
        const datos = limpiarPayload(item.payload as Record<string, unknown>);

        const { error } = await supabase
          .from(tabla)
          .update(datos as any)
          .eq(
            'id' as never,
            item.pk_value as never
          );

        if (error) {
          throw new Error(error.message);
        }

        break;
      }

      case 'DELETE': {

        const { error } = await supabase
          .from(tabla)
          .delete()
          .eq(
            'id' as never,
            item.pk_value as never
          );

        if (error) {
          throw new Error(error.message);
        }

        break;
      }
    }
  }

  private async marcarRegistroSincronizado(item: SyncQueueItem) {
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

    const tabla = tablaMap[item.tabla as keyof typeof tablaMap];
    if (!tabla) return;

    const pkStr = String(item.pk_value);

    if (pkStr.startsWith('local-')) {
      await (tabla as any).where('_local_id').equals(pkStr).modify({ _sync_status: 'synced' });
    } else {
      const pk = item.tabla === 'estado_sistema' ? pkStr : Number(item.pk_value);
      await tabla.update(pk as any, { _sync_status: 'synced' });
    }
  }

  async sincronizarItem(tabla: string, pkValue: string | number): Promise<boolean> {
    if (!navigator.onLine) return false;

    const item = await db.sync_queue
      .where('tabla').equals(tabla)
      .and(i => String(i.pk_value) === String(pkValue))
      .first();

    if (!item || !item.id) return false;

    await db.sync_queue.update(item.id, { estado: 'processing' });

    try {
      await this.ejecutarEnSupabase(item);
      await marcarExitoso(item.id);
      await this.marcarRegistroSincronizado(item);
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      await marcarError(item.id, mensaje);
      return false;
    }
  }
}

export const syncEngine = new SyncEngine();