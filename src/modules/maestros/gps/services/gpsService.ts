import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
import { supabase } from '../../../../lib/supabase';
import { limpiarPayload } from '../../../../utils/sync';
import type { GPS } from '../../../../db/schema';

export async function getGpsList(): Promise<GPS[]> {
  return await db.gps.toArray();
}

export async function getGpsByPlaca(placa: string): Promise<GPS | undefined> {
  return await db.gps.where('moto_placa').equalsIgnoreCase(placa).first();
}

export async function createGps(
  gps: Omit<GPS, 'id' | '_sync_status' | 'created_at'>
): Promise<{ success: boolean; saved?: GPS; error?: string; localSaved?: boolean }> {
  const existingImei = await db.gps.where('gps_imei').equalsIgnoreCase(gps.gps_imei).first();
  if (existingImei) {
    return { success: false, error: 'Ya existe un GPS con este IMEI' };
  }

  const newGps: GPS = {
    ...gps,
    id: Date.now(),
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('gps')
        .insert(limpiarPayload(newGps as unknown as Record<string, unknown>) as any)
        .select()
        .single();

      if (error) {
        const localId = await guardarLocal(newGps);
        const saved = await db.gps.where('_local_id').equals(localId).first();
        return { success: true, saved, localSaved: true };
      }

      await db.gps.add({ ...data, _sync_status: 'synced' } as any);
      const saved = await db.gps.where('id').equals(data.id as number).first();
      return { success: true, saved };
    } catch {
      const localId = await guardarLocal(newGps);
      const saved = await db.gps.where('_local_id').equals(localId).first();
      return { success: true, saved, localSaved: true };
    }
  }

  const localId = await guardarLocal(newGps);
  const saved = await db.gps.where('_local_id').equals(localId).first();
  return { success: true, saved, localSaved: true };
}

export async function updateGps(
  id: number,
  updates: Partial<Omit<GPS, 'id' | '_sync_status' | 'created_at'>>
): Promise<{ success: boolean; saved?: GPS; error?: string; localSaved?: boolean }> {
  const existente = await db.gps.get(id);
  if (!existente) return { success: false, error: 'GPS no encontrado' };

  const actualizado: GPS = {
    ...existente,
    ...updates,
    _sync_status: 'pending',
  };

  if (navigator.onLine) {
    try {
      const { error } = await supabase
        .from('gps')
        .update(limpiarPayload(actualizado as unknown as Record<string, unknown>) as any)
        .eq('id', existente.id);

      if (error) {
        await db.gps.put(actualizado);
        await encolar({ tabla: 'gps', operacion: 'UPDATE', payload: actualizado, pk_value: String(existente.id) });
        return { success: true, saved: actualizado, localSaved: true };
      }

      await db.gps.put({ ...actualizado, _sync_status: 'synced' });
      return { success: true, saved: actualizado };
    } catch {
      await db.gps.put(actualizado);
      await encolar({ tabla: 'gps', operacion: 'UPDATE', payload: actualizado, pk_value: String(existente.id) });
      return { success: true, saved: actualizado, localSaved: true };
    }
  }

  await db.gps.put(actualizado);
  await encolar({ tabla: 'gps', operacion: 'UPDATE', payload: actualizado, pk_value: String(existente.id) });
  return { success: true, saved: actualizado, localSaved: true };
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

async function guardarLocal(gps: GPS): Promise<string> {
  const localId = `local-${Date.now()}`;
  await db.gps.add({ ...gps, _local_id: localId } as any);
  await encolar({
    tabla: 'gps',
    operacion: 'INSERT',
    payload: gps,
    pk_value: localId,
  });
  return localId;
}