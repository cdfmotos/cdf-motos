import { supabase } from '../../lib/supabase';
import { db } from '../db';
// Cuántos días hacia atrás cargar en Dexie
const DIAS_RECAUDO_LOCAL = 90;

export async function hidratarRecaudo() {
  const fechaDesde = new Date();
  fechaDesde.setDate(fechaDesde.getDate() - DIAS_RECAUDO_LOCAL);
  const fechaStr = fechaDesde.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('recaudo' as any)
    .select('*')
    .gte('fecha_recaudo', fechaStr)   // solo últimos 90 días
    .order('fecha_recaudo', { ascending: false });

  if (error) {
    console.error('[Hydrate] Error cargando recaudo:', error.message);
    return;
  }

  if (!data || data.length === 0) return;

  await db.recaudo.bulkPut(
    data.map(row => ({ ...row, _sync_status: 'synced' as const })) as any
  );

  console.log(`[Hydrate] recaudo: ${data.length} registros (últimos ${DIAS_RECAUDO_LOCAL} días)`);
}