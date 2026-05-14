import { supabase } from '../../lib/supabase';
import { db } from '../db';
import type { Recaudo } from '../schema';

// Cuántos días hacia atrás cargar en Dexie
const DIAS_RECAUDO_LOCAL = 90;

// Extensión local para Dexie
type RecaudoLocal = Recaudo & {
  _sync_status: 'synced' | 'pending';
};

export async function hidratarRecaudo() {
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
      ascending: false
    })
    .returns<Recaudo[]>();

  if (error) {
    console.error(
      '[Hydrate] Error cargando recaudo:',
      error.message
    );
    return;
  }

  if (!data || data.length === 0) {
    return;
  }

  const recaudos: RecaudoLocal[] = data.map(
    (row: Recaudo) => ({
      ...row,
      _sync_status: 'synced'
    })
  );

  await db.recaudo.bulkPut(recaudos);

  console.log(
    `[Hydrate] recaudo: ${data.length} registros (últimos ${DIAS_RECAUDO_LOCAL} días)`
  );
}