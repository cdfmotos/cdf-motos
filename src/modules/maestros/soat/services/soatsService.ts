import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
import { supabase } from '../../../../lib/supabase';
import { limpiarPayload } from '../../../../utils/sync';
import type { Soat } from '../../../../db/schema';

export async function getSoats(): Promise<Soat[]> {
  return await db.soats.toArray();
}

export async function getSoatByPlaca(placa: string): Promise<Soat | undefined> {
  return await db.soats.where('moto_placa').equalsIgnoreCase(placa).first();
}

export async function createSoat(
  soat: Omit<Soat, 'id' | '_sync_status' | 'created_at'>
): Promise<{ success: boolean; saved?: Soat; error?: string; localSaved?: boolean }> {
  const existingSoat = await db.soats.where('no_soat').equalsIgnoreCase(soat.no_soat).first();
  if (existingSoat) {
    return { success: false, error: 'Ya existe un SOAT con este número' };
  }

  const newSoat: Soat = {
    ...soat,
    id: Date.now(),
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('soats')
        .insert(limpiarPayload(newSoat as unknown as Record<string, unknown>) as any)
        .select()
        .single();

      if (error) {
        const localId = await guardarLocal(newSoat);
        const saved = await db.soats.where('_local_id').equals(localId).first();
        return { success: true, saved, localSaved: true };
      }

      await db.soats.add({ ...data, _sync_status: 'synced' } as any);
      const saved = await db.soats.where('id').equals(data.id as number).first();
      return { success: true, saved };
    } catch {
      const localId = await guardarLocal(newSoat);
      const saved = await db.soats.where('_local_id').equals(localId).first();
      return { success: true, saved, localSaved: true };
    }
  }

  const localId = await guardarLocal(newSoat);
  const saved = await db.soats.where('_local_id').equals(localId).first();
  return { success: true, saved, localSaved: true };
}

export async function updateSoat(
  id: number,
  updates: Partial<Omit<Soat, 'id' | '_sync_status' | 'created_at'>>
): Promise<{ success: boolean; saved?: Soat; error?: string; localSaved?: boolean }> {
  const existente = await db.soats.get(id);
  if (!existente) return { success: false, error: 'SOAT no encontrado' };

  const actualizado: Soat = {
    ...existente,
    ...updates,
    _sync_status: 'pending',
  };

  if (navigator.onLine) {
    try {
      const { error } = await supabase
        .from('soats')
        .update(limpiarPayload(actualizado as unknown as Record<string, unknown>) as any)
        .eq('id', existente.id);

      if (error) {
        await db.soats.put(actualizado);
        await encolar({ tabla: 'soats', operacion: 'UPDATE', payload: actualizado, pk_value: String(existente.id) });
        return { success: true, saved: actualizado, localSaved: true };
      }

      await db.soats.put({ ...actualizado, _sync_status: 'synced' });
      return { success: true, saved: actualizado };
    } catch {
      await db.soats.put(actualizado);
      await encolar({ tabla: 'soats', operacion: 'UPDATE', payload: actualizado, pk_value: String(existente.id) });
      return { success: true, saved: actualizado, localSaved: true };
    }
  }

  await db.soats.put(actualizado);
  await encolar({ tabla: 'soats', operacion: 'UPDATE', payload: actualizado, pk_value: String(existente.id) });
  return { success: true, saved: actualizado, localSaved: true };
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

async function guardarLocal(soat: Soat): Promise<string> {
  const localId = `local-${Date.now()}`;
  await db.soats.add({ ...soat, _local_id: localId } as any);
  await encolar({
    tabla: 'soats',
    operacion: 'INSERT',
    payload: soat,
    pk_value: localId,
  });
  return localId;
}