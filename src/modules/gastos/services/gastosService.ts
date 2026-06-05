import { db } from '../../../db/db';
import { encolar } from '../../../db/sync/syncQueue';
import { supabase } from '../../../lib/supabase';
import { limpiarPayload } from '../../../utils/sync';
import type { Gasto } from '../../../db/schema';

// Helper para normalizar fecha a "YYYY-MM-DD" siempre
function normalizarFecha(fecha: unknown): string {
  if (fecha instanceof Date) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(fecha).slice(0, 10);
}

export async function getGastos(): Promise<Gasto[]> {
  const data = await db.gastos.toArray();
  console.log('🔍 fecha raw:', data[0]?.fecha, typeof data[0]?.fecha);
  return data;
}

export async function createGasto(
  gasto: Omit<Gasto, 'id' | '_sync_status' | 'created_at'>
): Promise<Gasto> {
  const cleanGasto = {
    ...gasto,
    fecha: normalizarFecha(gasto.fecha), // ✅ Siempre string "YYYY-MM-DD"
    created_at: new Date().toISOString(),
  };

  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .insert(limpiarPayload(cleanGasto as any) as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const syncedGasto: Gasto = {
        ...data,
        _sync_status: 'synced',
      };
      await db.gastos.put(syncedGasto);
      return syncedGasto;
    } catch (err) {
      console.error('Error inserting gasto online, falling back to local queue:', err);
    }
  }

  // Offline or error fallback
  const localId = `local-${Date.now()}`;
  const pendingGasto: Gasto = {
    ...cleanGasto,
    id: Date.now(), // Dexie primary key is numeric id
    _local_id: localId, // Used by SyncEngine to replace id later
    _sync_status: 'pending',
  };

  await db.gastos.add(pendingGasto);

  await encolar({
    tabla: 'gastos',
    operacion: 'INSERT',
    payload: cleanGasto,
    pk_value: localId,
  });

  return pendingGasto;
}

export async function updateGasto(
  id: number,
  updates: Partial<Omit<Gasto, 'id' | '_sync_status' | 'created_at'>>
): Promise<Gasto> {
  const gastoExistente = await db.gastos.get(id);
  if (!gastoExistente) throw new Error('Gasto no encontrado');

  const cleanUpdates = {
    ...updates,
    ...(updates.fecha !== undefined && { fecha: normalizarFecha(updates.fecha) }),
  };

  const gastoActualizado: Gasto = {
    ...gastoExistente,
    ...cleanUpdates,
  };

  if (gastoExistente._sync_status === 'synced' && navigator.onLine) {
    try {
      const { error } = await supabase
        .from('gastos')
        .update(limpiarPayload(cleanUpdates as any) as any)
        .eq('id', id);

      if (error) {
        throw error;
      }

      const syncedGasto: Gasto = {
        ...gastoActualizado,
        _sync_status: 'synced',
      };
      await db.gastos.put(syncedGasto);
      return syncedGasto;
    } catch (err) {
      console.error('Error updating gasto online, falling back to local queue:', err);
    }
  }

  // Fallback to offline queue
  const pendingGasto: Gasto = {
    ...gastoActualizado,
    _sync_status: 'pending',
  };

  await db.gastos.put(pendingGasto);

  await encolar({
    tabla: 'gastos',
    operacion: 'UPDATE',
    payload: pendingGasto,
    pk_value: gastoExistente._local_id ?? id,
  });

  return pendingGasto;
}

export async function deleteGasto(id: number): Promise<void> {
  const gastoExistente = await db.gastos.get(id);
  if (!gastoExistente) return;

  if (gastoExistente._sync_status === 'synced' && navigator.onLine) {
    try {
      const { error } = await supabase
        .from('gastos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await db.gastos.delete(id);
      return;
    } catch (err) {
      console.error('Error deleting gasto online, falling back to local queue:', err);
    }
  }

  // Fallback to offline queue
  await db.gastos.delete(id);

  await encolar({
    tabla: 'gastos',
    operacion: 'DELETE',
    payload: { id },
    pk_value: gastoExistente._local_id ?? id,
  });
}