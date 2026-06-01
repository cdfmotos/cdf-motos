import { db } from '../../../db/db';
import { encolar } from '../../../db/sync/syncQueue';
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
  const newGasto: Gasto = {
    ...gasto,
    fecha: normalizarFecha(gasto.fecha), // ✅ Siempre string "YYYY-MM-DD"
    id: Date.now(),
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

export async function updateGasto(
  id: number,
  updates: Partial<Omit<Gasto, 'id' | '_sync_status' | 'created_at'>>
): Promise<Gasto> {
  const gastoExistente = await db.gastos.get(id);
  if (!gastoExistente) throw new Error('Gasto no encontrado');

  const gastoActualizado: Gasto = {
    ...gastoExistente,
    ...updates,
    // ✅ Normalizar solo si viene fecha en el update
    ...(updates.fecha !== undefined && { fecha: normalizarFecha(updates.fecha) }),
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