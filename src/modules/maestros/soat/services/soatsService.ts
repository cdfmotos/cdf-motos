import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
import type { Soat } from '../../../../db/schema';

export async function getSoats(): Promise<Soat[]> {
  return await db.soats.toArray();
}

export async function getSoatByPlaca(placa: string): Promise<Soat | undefined> {
  return await db.soats.where('moto_placa').equalsIgnoreCase(placa).first();
}

export async function createSoat(soat: Omit<Soat, 'id' | '_sync_status' | 'created_at'>): Promise<Soat> {
  const newSoat: Soat = {
    ...soat,
    id: Date.now(), // ID temporal para Dexie
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  // 1. Guardar localmente
  await db.soats.add(newSoat);

  // 2. Encolar para sincronización
  await encolar({
    tabla: 'soats',
    operacion: 'INSERT',
    payload: newSoat,
    pk_value: newSoat.id,
  });

  return newSoat;
}

export async function updateSoat(id: number, updates: Partial<Omit<Soat, 'id' | '_sync_status' | 'created_at'>>): Promise<Soat> {
  const soatExistente = await db.soats.get(id);
  if (!soatExistente) throw new Error('SOAT no encontrado');

  const soatActualizado: Soat = {
    ...soatExistente,
    ...updates,
    _sync_status: 'pending',
  };

  // 1. Actualizar localmente
  await db.soats.put(soatActualizado);

  // 2. Encolar
  await encolar({
    tabla: 'soats',
    operacion: 'UPDATE',
    payload: soatActualizado,
    pk_value: id,
  });

  return soatActualizado;
}

export async function deleteSoat(id: number): Promise<void> {
  await db.soats.delete(id);

  await encolar({
    tabla: 'soats',
    operacion: 'DELETE',
    payload: { id },
    pk_value: id,
  });
}
