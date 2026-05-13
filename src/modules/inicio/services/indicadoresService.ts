import { db } from '../../../db/db';

export interface IndicadoresHome {
  numero_contratos_activos: number;
  contratos_sin_recaudar: number;
  dinero_sin_recaudar: number;
  contratos_recaudados: number;
  dinero_recaudado_hoy: number;
  porcentaje_recaudo: number;
}

export async function getIndicadoresHome(): Promise<IndicadoresHome> {
  const hoy = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // CTE: activos — contratos con estado 'Activo'
  const activos = await db.contratos
    .where('estado')
    .equals('Activo')
    .toArray();

  // CTE: totales
  const contratos_activos = activos.length;
  const dinero_esperado_hoy = activos.reduce(
    (sum, c) => sum + (c.cuota_diaria ?? 0), 0
  );

  // CTE: pagos_hoy — recaudos de hoy agrupados por contrato
  const recaudosHoy = await db.recaudo
    .where('fecha_recaudo')
    .equals(hoy)
    .toArray();

  // Agrupar por contrato_id (equivalente al GROUP BY de pagos_hoy)
  const pagosPorContrato = new Map<number, number>();
  for (const r of recaudosHoy) {
    const prev = pagosPorContrato.get(r.contrato_id) ?? 0;
    pagosPorContrato.set(r.contrato_id, prev + (r.monto_recaudado ?? 0));
  }

  // CTE: pagos
  const contratos_recaudados = pagosPorContrato.size;
  const dinero_recaudado_hoy = [...pagosPorContrato.values()]
    .reduce((sum, monto) => sum + monto, 0);

  // SELECT final — cross join entre totales y pagos
  const contratos_sin_recaudar = contratos_activos - contratos_recaudados;
  const dinero_sin_recaudar    = dinero_esperado_hoy - dinero_recaudado_hoy;
  const porcentaje_recaudo     = dinero_esperado_hoy > 0
    ? Math.round((dinero_recaudado_hoy / dinero_esperado_hoy) * 100 * 100) / 100
    : 0;

  return {
    numero_contratos_activos: contratos_activos,
    contratos_sin_recaudar,
    dinero_sin_recaudar,
    contratos_recaudados,
    dinero_recaudado_hoy,
    porcentaje_recaudo,
  };
}