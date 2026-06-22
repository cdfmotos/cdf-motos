import { db } from './db';

type TablaTempId = 'contratos' | 'motos' | 'gps' | 'soats' | 'gastos' | 'recaudo';

/**
 * Genera un ID temporal negativo para registros creados offline.
 * Usa un contador decremental: -1, -2, -3...
 * Nunca colisiona con IDs positivos de Supabase (secuenciales).
 *
 * Cuando el registro se sincronice, el SyncEngine reemplazará
 * este ID negativo por el ID real generado por Supabase.
 */
export async function getNextTempId(tabla: TablaTempId): Promise<number> {
  const tablaMap: Record<TablaTempId, { toArray: () => Promise<any[]> }> = {
    contratos: db.contratos,
    motos: db.motos,
    gps: db.gps,
    soats: db.soats,
    gastos: db.gastos,
    recaudo: db.recaudo,
  };

  const dexieTable = tablaMap[tabla];
  const todos = await dexieTable.toArray();
  const negativos = todos
    .map((r: any) => r.id as number)
    .filter((id: number) => id < 0);

  if (negativos.length === 0) return -1;
  return Math.min(...negativos) - 1;
}

/**
 * Verifica si un ID es temporal (negativo = creado offline).
 */
export function isTempId(id: number): boolean {
  return id < 0;
}
