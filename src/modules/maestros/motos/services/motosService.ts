import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
import { supabase } from '../../../../lib/supabase';
import { limpiarPayload } from '../../../../utils/sync';
import type { Moto } from '../../../../db/schema';

export async function getMotos(): Promise<Moto[]> {
  return await db.motos.toArray();
}

export async function getMotoByPlaca(placa: string): Promise<Moto | undefined> {
  return await db.motos.where('placa').equalsIgnoreCase(placa).first();
}

export async function createMoto(
  moto: Omit<Moto, 'id' | '_sync_status' | 'created_at'>
): Promise<{ success: boolean; saved?: Moto; error?: string; localSaved?: boolean }> {
  const existingPlaca = await db.motos.where('placa').equalsIgnoreCase(moto.placa).first();
  if (existingPlaca) {
    return { success: false, error: 'Ya existe una moto con esta placa' };
  }

  const newMoto: Moto = {
    ...moto,
    id: Date.now(),
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('motos')
        .insert(limpiarPayload(newMoto as unknown as Record<string, unknown>) as any)
        .select()
        .single();

      if (error) {
        const localId = await guardarLocal(newMoto);
        const saved = await db.motos.where('_local_id').equals(localId).first();
        return { success: true, saved, localSaved: true };
      }

      await db.motos.add({ ...data, _sync_status: 'synced' } as any);
      const saved = await db.motos.where('id').equals(data.id as number).first();
      return { success: true, saved };
    } catch {
      const localId = await guardarLocal(newMoto);
      const saved = await db.motos.where('_local_id').equals(localId).first();
      return { success: true, saved, localSaved: true };
    }
  }

  const localId = await guardarLocal(newMoto);
  const saved = await db.motos.where('_local_id').equals(localId).first();
  return { success: true, saved, localSaved: true };
}

export async function updateMoto(
  id: number,
  updates: Partial<Omit<Moto, 'id' | '_sync_status' | 'created_at'>>
): Promise<{ success: boolean; saved?: Moto; error?: string; localSaved?: boolean }> {
  const existente = await db.motos.get(id);
  if (!existente) return { success: false, error: 'Moto no encontrada' };

  const actualizado: Moto = {
    ...existente,
    ...updates,
    _sync_status: 'pending',
  };

  if (navigator.onLine) {
    try {
      const { error } = await supabase
        .from('motos')
        .update(limpiarPayload(actualizado as unknown as Record<string, unknown>) as any)
        .eq('id', existente.id);

      if (error) {
        await db.motos.put(actualizado);
        await encolar({ tabla: 'motos', operacion: 'UPDATE', payload: actualizado, pk_value: String(existente.id) });
        return { success: true, saved: actualizado, localSaved: true };
      }

      await db.motos.put({ ...actualizado, _sync_status: 'synced' });
      return { success: true, saved: actualizado };
    } catch {
      await db.motos.put(actualizado);
      await encolar({ tabla: 'motos', operacion: 'UPDATE', payload: actualizado, pk_value: String(existente.id) });
      return { success: true, saved: actualizado, localSaved: true };
    }
  }

  await db.motos.put(actualizado);
  await encolar({ tabla: 'motos', operacion: 'UPDATE', payload: actualizado, pk_value: String(existente.id) });
  return { success: true, saved: actualizado, localSaved: true };
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

async function guardarLocal(moto: Moto): Promise<string> {
  const localId = `local-${Date.now()}`;
  await db.motos.add({ ...moto, _local_id: localId } as any);
  await encolar({
    tabla: 'motos',
    operacion: 'INSERT',
    payload: moto,
    pk_value: localId,
  });
  return localId;
}