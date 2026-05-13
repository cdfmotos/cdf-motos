import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
import type { Cliente } from '../../../../db/schema';

export async function getClientes(): Promise<Cliente[]> {
  return await db.clientes.toArray();
}

export async function getClienteByCedula(cedula: string): Promise<Cliente | undefined> {
  return await db.clientes.where('cedula').equalsIgnoreCase(cedula).first();
}

export async function createCliente(cliente: Omit<Cliente, 'id' | '_sync_status' | 'created_at'>): Promise<Cliente> {
  const newCliente: Cliente = {
    ...cliente,
    id: crypto.randomUUID(), // ID temporal UUID para Dexie
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  // 1. Guardar localmente
  await db.clientes.add(newCliente);

  // 2. Encolar para sincronización
  await encolar({
    tabla: 'clientes',
    operacion: 'INSERT',
    payload: newCliente,
    pk_value: newCliente.id,
  });

  return newCliente;
}

export async function updateCliente(id: string, updates: Partial<Omit<Cliente, 'id' | '_sync_status' | 'created_at'>>): Promise<Cliente> {
  const clienteExistente = await db.clientes.get(id);
  if (!clienteExistente) throw new Error('Cliente no encontrado');

  const clienteActualizado: Cliente = {
    ...clienteExistente,
    ...updates,
    _sync_status: 'pending',
  };

  // 1. Actualizar localmente
  await db.clientes.put(clienteActualizado);

  // 2. Encolar
  await encolar({
    tabla: 'clientes',
    operacion: 'UPDATE',
    payload: clienteActualizado,
    pk_value: id,
  });

  return clienteActualizado;
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
