import type { Table } from 'dexie';
import { supabase } from '../../lib/supabase';
import { db } from '../db';
import { setHydrateState } from './hydrateState';

type SupabaseRow = Record<string, unknown>;

const DIAS_RECAUDO_LOCAL = 90;

type SyncRow = SupabaseRow & {
  _sync_status: 'synced' | 'pending';
};

type NombreTabla =
  | 'contratos'
  | 'clientes'
  | 'gastos'
  | 'motos'
  | 'gps'
  | 'soats'
  | 'estado_sistema'
  | 'notificaciones'
  | 'users';

const TABLAS: Array<{
  nombre: NombreTabla;
  tabla: Table<any, any>;
}> = [
  { nombre: 'contratos', tabla: db.contratos },
  { nombre: 'clientes', tabla: db.clientes },
  { nombre: 'gastos', tabla: db.gastos },
  { nombre: 'motos', tabla: db.motos },
  { nombre: 'gps', tabla: db.gps },
  { nombre: 'soats', tabla: db.soats },
  { nombre: 'estado_sistema', tabla: db.estado_sistema },
  { nombre: 'notificaciones', tabla: db.notificaciones },
  { nombre: 'users', tabla: db.users },
];

async function hidratarTabla<T extends SupabaseRow>(
  nombre: NombreTabla,
  dexieTable: Table<T, any>
) {
  setHydrateState({
    tablaActual: nombre,
    mensaje: `Cargando ${nombre}...`,
  });

  const { data, error } = await supabase
    .from(nombre)
    .select('*');

  if (error) {
    throw new Error(`Error en ${nombre}: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return;
  }

  const rows: SyncRow[] = data.map(
    (row: SupabaseRow) => ({
      ...row,
      _sync_status: 'synced',
    })
  );

  await dexieTable.bulkPut(rows as T[]);
}

async function hidratarRecaudo() {
  setHydrateState({
    tablaActual: 'recaudo',
    mensaje: 'Cargando recaudos recientes...',
  });

  const fechaDesde = new Date();

  fechaDesde.setDate(
    fechaDesde.getDate() - DIAS_RECAUDO_LOCAL
  );

  const fechaStr = fechaDesde
    .toISOString()
    .split('T')[0];

  const { data, error } = await supabase
    .from('recaudo')
    .select('*')
    .gte('fecha_recaudo', fechaStr)
    .order('fecha_recaudo', {
      ascending: false,
    });

  if (error) {
    throw new Error(`Error en recaudo: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return;
  }

  const recaudos: SyncRow[] = data.map(
    (row: SupabaseRow) => ({
      ...row,
      _sync_status: 'synced',
    })
  );

  await db.recaudo.bulkPut(recaudos as any[]);
}

export async function hidratarDB() {
  if (!navigator.onLine) {
    setHydrateState({
      status: 'idle',
      mensaje: 'Sin conexión — usando datos locales',
      tablaActual: null,
    });

    return;
  }

  setHydrateState({
    status: 'loading',
    mensaje: 'Iniciando sincronización...',
  });

  try {
    // Tablas en secuencia para mostrar progreso tabla por tabla
    for (const { nombre, tabla } of TABLAS) {
      await hidratarTabla(nombre, tabla);
    }

    await hidratarRecaudo();

    // Contar pendientes en la cola
    const pendientes = await db.sync_queue
      .where('estado')
      .equals('pending')
      .count();

    setHydrateState({
      status: 'success',
      mensaje: 'Datos sincronizados',
      tablaActual: null,
      pendientes,
      ultimaSync: new Date(),
      desincronizado: false,
    });

  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : 'Error desconocido';

    setHydrateState({
      status: 'error',
      mensaje: msg,
      tablaActual: null,
    });
  }
}

// Detecta si hay cambios en Supabase que no están en Dexie
// Compara el created_at del registro más reciente
export async function verificarDesincronizacion() {
  if (!navigator.onLine) {
    return;
  }

  try {
    const { data } = await supabase
      .from('recaudo')
      .select('created_at')
      .order('created_at', {
        ascending: false,
      })
      .limit(1)
      .single();

    if (!data || !data.created_at) {
      return;
    }

    const ultimoSupabase = new Date(
      data.created_at as string
    ).getTime();

    const ultimoDexie = await db.recaudo
      .orderBy('created_at')
      .last();

    if (!ultimoDexie?.created_at) {
      return;
    }

    const ultimoDexieTs = new Date(
      ultimoDexie.created_at
    ).getTime();

    // Si Supabase tiene algo más nuevo
    if (ultimoSupabase > ultimoDexieTs) {
      setHydrateState({
        desincronizado: true,
        mensaje: 'Hay datos nuevos disponibles',
      });
    }

  } catch {
    // Ignorar silenciosamente
  }
}