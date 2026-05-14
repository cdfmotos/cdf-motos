import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
import { supabase } from '../../../../lib/supabase';
import { limpiarPayload } from '../../../../utils/sync';
import type { Cliente } from '../../../../db/schema';

export async function getClientes(): Promise<Cliente[]> {
  return await db.clientes.toArray();
}

export async function getClienteByCedula(cedula: string): Promise<Cliente | undefined> {
  return await db.clientes.where('cedula').equalsIgnoreCase(cedula).first();
}

export async function createCliente(
  cliente: Omit<Cliente, 'id' | '_sync_status' | 'created_at'>
): Promise<{ success: boolean; saved?: Cliente; error?: string; localSaved?: boolean }> {
  const existing = await db.clientes.where('cedula').equalsIgnoreCase(cliente.cedula).first();
  if (existing) {
    return { success: false, error: 'Ya existe un cliente con esta cédula' };
  }

  const newCliente: Cliente = {
    ...cliente,
    id: crypto.randomUUID(),
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert(limpiarPayload(newCliente as unknown as Record<string, unknown>) as any)
        .select()
        .single();

      if (error) {
        const localId = await guardarLocal(newCliente);
        const saved = await db.clientes.where('_local_id').equals(localId).first();
        return { success: true, saved, localSaved: true };
      }

      await db.clientes.add({ ...data, _sync_status: 'synced' } as any);
      const saved = await db.clientes.where('id').equals(data.id as string).first();
      return { success: true, saved };
    } catch {
      const localId = await guardarLocal(newCliente);
      const saved = await db.clientes.where('_local_id').equals(localId).first();
      return { success: true, saved, localSaved: true };
    }
  }

  const localId = await guardarLocal(newCliente);
  const saved = await db.clientes.where('_local_id').equals(localId).first();
  return { success: true, saved, localSaved: true };
}

export async function updateCliente(
  id: string,
  updates: Partial<Omit<Cliente, 'id' | '_sync_status' | 'created_at'>>
): Promise<{ success: boolean; saved?: Cliente; error?: string; localSaved?: boolean }> {
  const existente = await db.clientes.get(id);
  if (!existente) return { success: false, error: 'Cliente no encontrado' };

  const actualizado: Cliente = {
    ...existente,
    ...updates,
    _sync_status: 'pending',
  };

  if (navigator.onLine) {
    try {
      const { error } = await supabase
        .from('clientes')
        .update(limpiarPayload(actualizado as unknown as Record<string, unknown>) as any)
        .eq('id', existente.id);

      if (error) {
        await db.clientes.put(actualizado);
        await encolar({ tabla: 'clientes', operacion: 'UPDATE', payload: actualizado, pk_value: id });
        return { success: true, saved: actualizado, localSaved: true };
      }

      await db.clientes.put({ ...actualizado, _sync_status: 'synced' });
      return { success: true, saved: actualizado };
    } catch {
      await db.clientes.put(actualizado);
      await encolar({ tabla: 'clientes', operacion: 'UPDATE', payload: actualizado, pk_value: id });
      return { success: true, saved: actualizado, localSaved: true };
    }
  }

  await db.clientes.put(actualizado);
  await encolar({ tabla: 'clientes', operacion: 'UPDATE', payload: actualizado, pk_value: id });
  return { success: true, saved: actualizado, localSaved: true };
}

export async function deleteCliente(id: string): Promise<void> {
  await db.clientes.delete(id);

  await encolar({
    tabla: 'clientes',
    operacion: 'DELETE',
    payload: { id },
    pk_value: id,
  });
}

async function guardarLocal(cliente: Cliente): Promise<string> {
  const localId = `local-${Date.now()}`;
  await db.clientes.add({ ...cliente, _local_id: localId } as any);
  await encolar({
    tabla: 'clientes',
    operacion: 'INSERT',
    payload: cliente,
    pk_value: localId,
  });
  return localId;
}