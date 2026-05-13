import { db } from '../../../../db/db';
import { encolar } from '../../../../db/sync/syncQueue';
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

export async function createContrato(contrato: Omit<Contrato, 'id' | '_sync_status' | 'created_at'> & { id?: number }): Promise<Contrato> {
  const newContrato: Contrato = {
    ...contrato,
    id: contrato.id ?? Date.now(), // ID temporal si no se provee o el id ingresado por usuario
    _sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  // 1. Guardar localmente
  await db.contratos.add(newContrato);

  // 2. Encolar para sincronización
  await encolar({
    tabla: 'contratos',
    operacion: 'INSERT',
    payload: newContrato,
    pk_value: newContrato.id,
  });

  return newContrato;
}

export async function updateContrato(id: number, updates: Partial<Omit<Contrato, '_sync_status' | 'created_at'>>): Promise<Contrato> {
  const contratoExistente = await db.contratos.get(id);
  if (!contratoExistente) throw new Error('Contrato no encontrado');

  const isIdChanged = updates.id !== undefined && updates.id !== id;
  
  const contratoActualizado: Contrato = {
    ...contratoExistente,
    ...updates,
    _sync_status: 'pending',
  };

  if (isIdChanged) {
    // Si cambió el ID, borramos el viejo y creamos el nuevo localmente
    await db.contratos.delete(id);
    await db.contratos.add(contratoActualizado);
    
    // Al actualizar el ID primario, encolamos el update pero enviamos el id original como pk_value o borramos y creamos
    // Para simplificar, mandamos el UPDATE con pk_value = id_original, Supabase deberá permitir UPDATE id
    await encolar({
      tabla: 'contratos',
      operacion: 'UPDATE',
      payload: contratoActualizado,
      pk_value: id,
    });
  } else {
    // 1. Actualizar localmente
    await db.contratos.put(contratoActualizado);

    // 2. Encolar
    await encolar({
      tabla: 'contratos',
      operacion: 'UPDATE',
      payload: contratoActualizado,
      pk_value: id,
    });
  }

  return contratoActualizado;
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
