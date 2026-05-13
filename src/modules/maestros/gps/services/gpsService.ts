import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
import type { GPS } from '../../../../db/schema';

export async function getGpsList(): Promise<GPS[]> {
  return await db.gps.toArray();
}

export async function getGpsByPlaca(placa: string): Promise<GPS | undefined> {
  return await db.gps.where('moto_placa').equalsIgnoreCase(placa).first();
}

export async function createGps(gps: Omit<GPS, 'id' | '_sync_status' | 'created_at'>): Promise<GPS> {
  const newGps: GPS = {
    ...gps,
    id: Date.now(), // ID temporal para Dexie
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  // 1. Guardar localmente
  await db.gps.add(newGps);

  // 2. Encolar para sincronización
  await encolar({
    tabla: 'gps',
    operacion: 'INSERT',
    payload: newGps,
    pk_value: newGps.id,
  });

  return newGps;
}

export async function updateGps(id: number, updates: Partial<Omit<GPS, 'id' | '_sync_status' | 'created_at'>>): Promise<GPS> {
  const gpsExistente = await db.gps.get(id);
  if (!gpsExistente) throw new Error('GPS no encontrado');

  const gpsActualizado: GPS = {
    ...gpsExistente,
    ...updates,
    _sync_status: 'pending',
  };

  // 1. Actualizar localmente
  await db.gps.put(gpsActualizado);

  // 2. Encolar
  await encolar({
    tabla: 'gps',
    operacion: 'UPDATE',
    payload: gpsActualizado,
    pk_value: id,
  });

  return gpsActualizado;
}

export async function deleteGps(id: number): Promise<void> {
  await db.gps.delete(id);

  await encolar({
    tabla: 'gps',
    operacion: 'DELETE',
    payload: { id },
    pk_value: id,
  });
}
