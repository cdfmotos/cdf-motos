import { db } from '../../../db/db';
import { encolar } from '../../../db/sync/syncQueue';
import type { Gasto } from '../../../db/schema';

export async function getGastos(): Promise<Gasto[]> {
  return await db.gastos.toArray();
}

export async function createGasto(gasto: Omit<Gasto, 'id' | '_sync_status' | 'created_at'>): Promise<Gasto> {
  const newGasto: Gasto = {
    ...gasto,
    id: Date.now(), // ID temporal para Dexie
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  await db.gastos.add(newGasto);

  await encolar({
    tabla: 'gastos',
    operacion: 'INSERT',
    payload: newGasto,
    pk_value: newGasto.id,
  });

  return newGasto;
}

export async function updateGasto(id: number, updates: Partial<Omit<Gasto, 'id' | '_sync_status' | 'created_at'>>): Promise<Gasto> {
  const gastoExistente = await db.gastos.get(id);
  if (!gastoExistente) throw new Error('Gasto no encontrado');

  const gastoActualizado: Gasto = {
    ...gastoExistente,
    ...updates,
    _sync_status: 'pending',
  };

  await db.gastos.put(gastoActualizado);

  await encolar({
    tabla: 'gastos',
    operacion: 'UPDATE',
    payload: gastoActualizado,
    pk_value: id,
  });

  return gastoActualizado;
}

export async function deleteGasto(id: number): Promise<void> {
  await db.gastos.delete(id);

  await encolar({
    tabla: 'gastos',
    operacion: 'DELETE',
    payload: { id },
    pk_value: id,
  });
}
