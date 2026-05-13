/**
 * extractoContrato.js
 * Equivalente JS/Dexie del view_extracto_contrato de Supabase.
 *
 * Dependencia: tu instancia de Dexie (db) con las tablas:
 *   - contratos  { id, placa, valor_contrato, cliente_cedula, fecha_inicio, ... }
 *   - recaudo    { id, numero_recaudo, monto_recaudado, cuota_diaria_pactada,
 *                  fecha_recaudo, saldo_pendiente, nuevo_saldo, tipo_contrato,
 *                  abono, contrato_id, usuario_id, dias_pagados, created_at }
 *   - clientes   { cedula, nombres, apellidos, ... }
 */

import { supabase } from '../../../../lib/supabase';
import type { Database } from '../../../../types/database.types';

type ViewExtractoContratoRow = Database['public']['Views']['view_extracto_contrato']['Row'];
export async function getExtractoContrato(db: any, contratoId: number | string) {

  // DEBUG ─────────────────────────────────────────────
  const all = await db.recaudo.toArray();

  console.table(
    all.map((r: any) => ({
      id: r.id,
      idType: typeof r.id,
      contrato_id: r.contrato_id,
      contratoType: typeof r.contrato_id,
      fecha: r.fecha_recaudo
    }))
  );

  // 1. Contrato ──────────────────────────────────────
  const contrato = await db.contratos.get(Number(contratoId));

  if (!contrato) {
    throw new Error(`Contrato ${contratoId} no encontrado`);
  }

  const valorContrato = Number(contrato.valor_contrato ?? 0);

  // 2. Cliente ───────────────────────────────────────
  const cliente = await db.clientes
    .where('cedula')
    .equals(String(contrato.cliente_cedula))
    .first();

  // 3. Recaudos ──────────────────────────────────────
  const recaudosRaw = await db.recaudo
    .where('contrato_id')
    .anyOf(Number(contratoId), String(contratoId))
    .toArray();

  console.log('CONTRATO ID BUSCADO:', contratoId);
  console.log('RECAUDOS ENCONTRADOS:', recaudosRaw);

  // Ordenar ascendente
  recaudosRaw.sort((a: any, b: any) => {

    const fechaA = new Date(a.fecha_recaudo).getTime();
    const fechaB = new Date(b.fecha_recaudo).getTime();

    const fd = fechaA - fechaB;

    return fd !== 0
      ? fd
      : Number(a.id) - Number(b.id);
  });

  // 4. Calcular acumulado ────────────────────────────
  let acumulado = 0;

  const recaudos = recaudosRaw.map((r: any) => {

    const montoRecaudado = Number(r.monto_recaudado ?? 0);

    acumulado += montoRecaudado;

    const saldoALaFecha = valorContrato - acumulado;

    const saldoPendiente =
      r.saldo_pendiente != null
        ? Number(r.saldo_pendiente)
        : saldoALaFecha;

    const nuevoSaldo =
      r.nuevo_saldo != null
        ? Number(r.nuevo_saldo)
        : saldoALaFecha - montoRecaudado;

    const pctSaldoPendiente =
      valorContrato !== 0
        ? round2((100 * saldoPendiente) / valorContrato)
        : 0;

    const pctRecaudado =
      valorContrato !== 0
        ? round2((100 * acumulado) / valorContrato)
        : 0;

    return {
      // ids
      contrato_id: Number(contrato.id),
      id_recaudo: Number(r.id),

      // recaudo
      numero_recaudo: r.numero_recaudo,
      fecha_recaudo: r.fecha_recaudo,
      monto_recaudado: montoRecaudado,
      cuota_diaria_pactada: Number(r.cuota_diaria_pactada ?? 0),
      dias_pagados: Number(r.dias_pagados ?? 0),
      abono: Number(r.abono ?? 0),

      // contrato
      placa: contrato.placa,
      valor_contrato: valorContrato,

      // calculados
      recaudo_acumulado: acumulado,
      saldo_a_la_fecha: saldoALaFecha,
      saldo_pendiente: saldoPendiente,
      nuevo_saldo: nuevoSaldo,
      porcentaje_saldo_pendiente: pctSaldoPendiente,
      porcentaje_recaudado: pctRecaudado,

      // cliente
      cliente_cedula: contrato.cliente_cedula,
      nombres: cliente?.nombres ?? '',
      apellidos: cliente?.apellidos ?? '',
    };
  });

  // 5. Resumen ───────────────────────────────────────
  const ultimo = recaudos.at(-1);

  const saldoALaFecha = ultimo
    ? ultimo.saldo_a_la_fecha
    : valorContrato;

  const pctRecaudado = ultimo
    ? ultimo.porcentaje_recaudado
    : 0;

  const pctSaldoPendiente = ultimo
    ? ultimo.porcentaje_saldo_pendiente
    : 100;

  // 6. Orden desc igual que la view ─────────────────
  const recaudosDesc = [...recaudos].reverse();

  return {
    contrato,
    cliente: cliente ?? {},
    saldoALaFecha,
    porcentajeRecaudado: pctRecaudado,
    porcentajeSaldoPendiente: pctSaldoPendiente,
    recaudos: recaudosDesc,
  };
}

// ─── Online: usa view de Supabase ────────────────────────────────────────────

export async function getExtractoContratoOnline(contratoId: number): Promise<{
  contrato: object;
  cliente: object;
  saldoALaFecha: number;
  porcentajeRecaudado: number;
  porcentajeSaldoPendiente: number;
  recaudos: Array<object>;
}> {
  const { data: rows, error } = await supabase
    .from('view_extracto_contrato')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('fecha_recaudo', { ascending: true })
    .order('id_recaudo', { ascending: true });

  if (error) throw new Error(`Error consultando view: ${error.message}`);
  if (!rows || rows.length === 0) {
    throw new Error('No se encontraron datos para este contrato');
  }

  // Extraer info del contrato desde el primer registro
  const primer = rows[0];
  const contrato = {
    id: contratoId,
    placa: primer.placa,
    valor_contrato: primer.valor_contrato,
    cliente_cedula: primer.cliente_cedula,
    cuota_diaria: primer.cuota_diaria_pactada,
  };

  const cliente = {
    nombres: primer.nombres,
    apellidos: primer.apellidos,
  };

  // Calcular resumen desde el último registro
  const ultimo = rows[rows.length - 1];
  const saldoALaFecha = ultimo.saldo_a_la_fecha ?? 0;
  const porcentajeRecaudado = ultimo.porcentaje_recaudado ?? 0;
  const porcentajeSaldoPendiente = ultimo.porcentaje_saldo_pendiente ?? 100;

  // Ordenar desc para mantener consistencia con versión offline
  const recaudos = [...rows].reverse();

  return {
    contrato,
    cliente,
    saldoALaFecha,
    porcentajeRecaudado,
    porcentajeSaldoPendiente,
    recaudos,
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function round2(n: number) {
  return Math.round(n * 100) / 100;
}