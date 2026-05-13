// src/db/sync/syncQueue.ts
import { db } from '../db';
import type { SyncQueueItem } from '../schema';

// Agrega una operación a la cola
export async function encolar(item: Omit<SyncQueueItem, 'id' | 'intentos' | 'estado' | 'timestamp'>) {
  await db.sync_queue.add({
    ...item,
    timestamp: Date.now(),
    intentos: 0,
    estado: 'pending',
  });
}

// Cuántos registros están esperando sincronización
export async function contarPendientes(): Promise<number> {
  return db.sync_queue.where('estado').equals('pending').count();
}

// Marcar un item como procesado exitosamente (se elimina)
export async function marcarExitoso(id: number) {
  await db.sync_queue.delete(id);
}

// Marcar un item como fallido, guardar el error y sumar intento
export async function marcarError(id: number, mensaje: string) {
  await db.sync_queue.update(id, {
    estado: 'error',
    error_msg: mensaje,
    intentos: (await db.sync_queue.get(id))?.intentos ?? 0 + 1,
  });
}

// Reintentar los que fallaron (los vuelve a 'pending')
export async function reintentarErrores() {
  await db.sync_queue
    .where('estado').equals('error')
    .modify({ estado: 'pending', error_msg: undefined });
}

// Para debug: ver toda la cola
export async function verCola() {
  return db.sync_queue.orderBy('timestamp').toArray();
}