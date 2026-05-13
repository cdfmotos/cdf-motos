import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
import type { Moto } from '../../../../db/schema';

export async function getMotos(): Promise<Moto[]> {
  return await db.motos.toArray();
}

export async function getMotoByPlaca(placa: string): Promise<Moto | undefined> {
  return await db.motos.where('placa').equalsIgnoreCase(placa).first();
}

export async function createMoto(moto: Omit<Moto, 'id' | '_sync_status' | 'created_at'>): Promise<Moto> {
  const newMoto: Moto = {
    ...moto,
    id: Date.now(), // ID temporal para Dexie
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  // 1. Guardar localmente
  await db.motos.add(newMoto);

  // 2. Encolar para sincronización
  await encolar({
    tabla: 'motos',
    operacion: 'INSERT',
    payload: newMoto,
    pk_value: newMoto.id,
  });

  return newMoto;
}

export async function updateMoto(id: number, updates: Partial<Omit<Moto, 'id' | '_sync_status' | 'created_at'>>): Promise<Moto> {
  const motoExistente = await db.motos.get(id);
  if (!motoExistente) throw new Error('Moto no encontrada');

  const motoActualizada: Moto = {
    ...motoExistente,
    ...updates,
    _sync_status: 'pending',
  };

  // 1. Actualizar localmente
  await db.motos.put(motoActualizada);

  // 2. Encolar
  await encolar({
    tabla: 'motos',
    operacion: 'UPDATE',
    payload: motoActualizada,
    pk_value: id,
  });

  return motoActualizada;
}

export async function deleteMoto(id: number): Promise<void> {
  await db.motos.delete(id);

  await encolar({
    tabla: 'motos',
    operacion: 'DELETE',
    payload: { id },
    pk_value: id,
  });
}
