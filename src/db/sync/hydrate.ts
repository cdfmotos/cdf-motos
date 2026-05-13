import type { Table } from 'dexie';
import { supabase } from '../../lib/supabase';
import { db } from '../db';
import { setHydrateState } from './hydrateState';

type SupabaseRow = Record<string, unknown>;

const DIAS_RECAUDO_LOCAL = 90;

const TABLAS: Array<{ nombre: string; tabla: Table<any, any> }> = [
  { nombre: 'contratos',      tabla: db.contratos      },
  { nombre: 'clientes',       tabla: db.clientes        },
  { nombre: 'gastos',         tabla: db.gastos          },
  { nombre: 'motos',          tabla: db.motos           },
  { nombre: 'gps',            tabla: db.gps             },
  { nombre: 'soats',          tabla: db.soats           },
  { nombre: 'estado_sistema', tabla: db.estado_sistema  },
  { nombre: 'notificaciones', tabla: db.notificaciones  },
  { nombre: 'users',          tabla: db.users           },
];

async function hidratarTabla<T extends SupabaseRow>(
  nombre: string,
  dexieTable: Table<T, any>
) {
  setHydrateState({ tablaActual: nombre, mensaje: `Cargando ${nombre}...` });

  const { data, error } = await supabase.from(nombre as any).select('*');

  if (error) throw new Error(`Error en ${nombre}: ${error.message}`);
  if (!data || data.length === 0) return;

  await dexieTable.bulkPut(
    data.map(row => ({ ...row, _sync_status: 'synced' as const })) as T[]
  );
}

async function hidratarRecaudo() {
  setHydrateState({ tablaActual: 'recaudo', mensaje: 'Cargando recaudos recientes...' });

  const fechaDesde = new Date();
  fechaDesde.setDate(fechaDesde.getDate() - DIAS_RECAUDO_LOCAL);
  const fechaStr = fechaDesde.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('recaudo' as any)
    .select('*')
    .gte('fecha_recaudo', fechaStr)
    .order('fecha_recaudo', { ascending: false });

  if (error) throw new Error(`Error en recaudo: ${error.message}`);
  if (!data || data.length === 0) return;

  await db.recaudo.bulkPut(
    data.map(row => ({ ...row, _sync_status: 'synced' as const })) as any
  );
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

  setHydrateState({ status: 'loading', mensaje: 'Iniciando sincronización...' });

  try {
    // Tablas en secuencia para mostrar progreso tabla por tabla
    for (const { nombre, tabla } of TABLAS) {
      await hidratarTabla(nombre, tabla);
    }
    await hidratarRecaudo();

    // Contar pendientes en la cola
    const pendientes = await db.sync_queue
      .where('estado').equals('pending')
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
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    setHydrateState({
      status: 'error',
      mensaje: msg,
      tablaActual: null,
    });
  }
}

// Detecta si hay cambios en Supabase que no están en Dexie
// Compara el created_at del registro más reciente de cada tabla
export async function verificarDesincronizacion() {
  if (!navigator.onLine) return;

  try {
    const { data } = await supabase
      .from('recaudo' as any)
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) return;

    const ultimoSupabase = new Date((data as any).created_at).getTime();

    const ultimoDexie = await db.recaudo
      .orderBy('created_at')
      .last();

    if (!ultimoDexie?.created_at) return;

    const ultimoDexieTs = new Date(ultimoDexie.created_at).getTime();

    // Si Supabase tiene algo más nuevo, marcar como desincronizado
    if (ultimoSupabase > ultimoDexieTs) {
      setHydrateState({
        desincronizado: true,
        mensaje: 'Hay datos nuevos disponibles',
      });
    }
  } catch {
    // Si falla la verificación no es crítico, se ignora silenciosamente
  }
}