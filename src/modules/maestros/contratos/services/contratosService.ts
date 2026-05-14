import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
import { supabase } from '../../../../lib/supabase';
import { limpiarPayload } from '../../../../utils/sync';
import type { Contrato } from '../../../../db/schema';

export async function getContratos(): Promise<Contrato[]> {
  return await db.contratos.toArray();
}

export async function getContratoById(id: number): Promise<Contrato | undefined> {
  return await db.contratos.get(id);
}

export async function getContratosActivosByPlaca(placa: string): Promise<Contrato[]> {
  return await db.contratos
    .where('placa')
    .equalsIgnoreCase(placa)
    .filter(c => c.estado === 'Activo')
    .toArray();
}

export async function createContrato(
  contrato: Omit<Contrato, 'id' | '_sync_status' | 'created_at'> & { id?: number }
): Promise<{ success: boolean; saved?: Contrato; error?: string; localSaved?: boolean }> {
  if (contrato.id) {
    const existingById = await db.contratos.get(contrato.id);
    if (existingById) {
      return { success: false, error: 'Ya existe un contrato con este número de ID' };
    }
  }

  if (contrato.tipo_contrato === 'Moto' && contrato.placa && contrato.cliente_cedula) {
    const existingByCedulaPlaca = await db.contratos
      .where('cliente_cedula').equalsIgnoreCase(contrato.cliente_cedula)
      .filter(c => c.placa?.toLowerCase() === contrato.placa?.toLowerCase())
      .first();
    if (existingByCedulaPlaca) {
      return { success: false, error: 'Ya existe un contrato para este cliente y placa' };
    }
  }

  const newContrato: Contrato = {
    ...contrato,
    id: contrato.id ?? Date.now(),
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .insert(limpiarPayload(newContrato as unknown as Record<string, unknown>) as any)
        .select()
        .single();

      if (error) {
        const localId = await guardarLocal(newContrato);
        const saved = await db.contratos.where('_local_id').equals(localId).first();
        return { success: true, saved, localSaved: true };
      }

      await db.contratos.add({ ...data, _sync_status: 'synced' } as any);
      const saved = await db.contratos.where('id').equals(data.id as number).first();
      return { success: true, saved };
    } catch {
      const localId = await guardarLocal(newContrato);
      const saved = await db.contratos.where('_local_id').equals(localId).first();
      return { success: true, saved, localSaved: true };
    }
  }

  const localId = await guardarLocal(newContrato);
  const saved = await db.contratos.where('_local_id').equals(localId).first();
  return { success: true, saved, localSaved: true };
}

export async function updateContrato(
  id: number,
  updates: Partial<Omit<Contrato, '_sync_status' | 'created_at'>>
): Promise<{ success: boolean; saved?: Contrato; error?: string; localSaved?: boolean }> {
  const existente = await db.contratos.get(id);
  if (!existente) return { success: false, error: 'Contrato no encontrado' };

  const actualizado: Contrato = {
    ...existente,
    ...updates,
    id: updates.id !== undefined ? updates.id : id,
    _sync_status: 'pending',
  };

  if (navigator.onLine) {
    try {
      const { error } = await supabase
        .from('contratos')
        .update(limpiarPayload(actualizado as unknown as Record<string, unknown>) as any)
        .eq('id', id);

      if (error) {
        await db.contratos.put(actualizado);
        await encolar({ tabla: 'contratos', operacion: 'UPDATE', payload: actualizado, pk_value: String(id) });
        return { success: true, saved: actualizado, localSaved: true };
      }

      await db.contratos.put({ ...actualizado, _sync_status: 'synced' });
      return { success: true, saved: actualizado };
    } catch {
      await db.contratos.put(actualizado);
      await encolar({ tabla: 'contratos', operacion: 'UPDATE', payload: actualizado, pk_value: String(id) });
      return { success: true, saved: actualizado, localSaved: true };
    }
  }

  await db.contratos.put(actualizado);
  await encolar({ tabla: 'contratos', operacion: 'UPDATE', payload: actualizado, pk_value: String(id) });
  return { success: true, saved: actualizado, localSaved: true };
}

export async function deleteContrato(id: number): Promise<void> {
  await db.contratos.delete(id);

  await encolar({
    tabla: 'contratos',
    operacion: 'DELETE',
    payload: { id },
    pk_value: id,
  });
}

async function guardarLocal(contrato: Contrato): Promise<string> {
  const localId = `local-${Date.now()}`;
  await db.contratos.add({ ...contrato, _local_id: localId } as any);
  await encolar({
    tabla: 'contratos',
    operacion: 'INSERT',
    payload: contrato,
    pk_value: localId,
  });
  return localId;
}