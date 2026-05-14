import { db } from '../../../db/db';
import { encolar } from '../../../db/sync/syncQueue';
import { supabase } from '../../../lib/supabase';
import type { Recaudo, Cliente } from '../../../db/schema';

export interface ContratoWithCliente {
  id?: number;
  placa: string | null;
  valor_contrato: number;
  cuota_diaria: number;
  fecha_inicio: string;
  tipo_contrato: string;
  cliente_cedula: string | null;
  estado: string | null;
  cliente?: {
    nombres: string;
    apellidos: string;
    cedula: string;
  };
  saldo_pendiente: number | null;
  sin_datos_recientes?: boolean;
}

export interface RecaudoInput {
  contrato_id: number;
  monto_recaudado: number;
  fecha_recaudo: string;
  cuota_diaria_pactada: number;
  tipo_contrato: string;
  usuario_id?: string;
}

export async function getContratoById(contratoId: number, isOnline: boolean): Promise<ContratoWithCliente | null> {
  const contrato = await db.contratos.get(contratoId);
  if (!contrato) return null;

  let cliente: Cliente | undefined;
  if (contrato.cliente_cedula) {
    cliente = await db.clientes.where('cedula').equals(contrato.cliente_cedula).first();
  }

  const saldoInfo = await getSaldoPendiente(contratoId, isOnline);

  return {
    id: contrato.id,
    placa: contrato.placa,
    valor_contrato: contrato.valor_contrato,
    cuota_diaria: contrato.cuota_diaria,
    fecha_inicio: contrato.fecha_inicio,
    tipo_contrato: contrato.tipo_contrato,
    cliente_cedula: contrato.cliente_cedula,
    estado: contrato.estado,
    cliente: cliente ? {
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      cedula: cliente.cedula,
    } : undefined,
    saldo_pendiente: saldoInfo.saldo,
    sin_datos_recientes: saldoInfo.sinDatosRecientes,
  };
}

export async function getSaldoPendiente(contratoId: number, isOnline: boolean): Promise<{ saldo: number | null; sinDatosRecientes: boolean }> {
  if (isOnline) {
    try {
      const { data, error } = await supabase
        .from('vista_contratos')
        .select('saldo_pendiente')
        .eq('id', contratoId)
        .single();

      if (error || !data) return { saldo: null, sinDatosRecientes: true };
      return { saldo: data.saldo_pendiente ?? null, sinDatosRecientes: false };
    } catch {
      return { saldo: null, sinDatosRecientes: true };
    }
  }

  const ultimoRecaudo = await db.recaudo
    .where('contrato_id')
    .equals(contratoId)
    .and(r => !!r.fecha_recaudo && r.nuevo_saldo != null)
    .sortBy('fecha_recaudo');

  if (ultimoRecaudo.length > 0) {
    const ultimo = ultimoRecaudo[ultimoRecaudo.length - 1];
    return { saldo: ultimo.nuevo_saldo ?? null, sinDatosRecientes: false };
  }

  return { saldo: null, sinDatosRecientes: true };
}

export async function getRecaudos(): Promise<Recaudo[]> {
  return await db.recaudo.orderBy('fecha_recaudo').reverse().toArray();
}

export async function getRecaudosByContrato(contratoId: number): Promise<Recaudo[]> {
  return await db.recaudo
    .where('contrato_id')
    .equals(contratoId)
    .sortBy('fecha_recaudo');
}

export async function createRecaudo(input: RecaudoInput): Promise<Recaudo> {
  const contrato = await db.contratos.get(input.contrato_id);
  if (!contrato) throw new Error('Contrato no encontrado');

  const { saldo } = await getSaldoPendiente(input.contrato_id, false);

  const saldoPendiente = saldo ?? contrato.valor_contrato;
  const monto = input.monto_recaudado;
  const cuota = input.cuota_diaria_pactada;

  const nuevoSaldo = saldoPendiente - monto;
  const diasPagados = Math.floor(monto / cuota);
  const abono = Math.max(monto - (cuota * diasPagados), 0);

  const newRecaudo: Recaudo = {
    contrato_id: input.contrato_id,
    monto_recaudado: monto,
    cuota_diaria_pactada: cuota,
    fecha_recaudo: input.fecha_recaudo,
    tipo_contrato: input.tipo_contrato,
    usuario_id: input.usuario_id ?? null,
    numero_recaudo: `TMP-${Date.now()}`,
    saldo_pendiente: saldoPendiente,
    nuevo_saldo: nuevoSaldo,
    dias_pagados: diasPagados,
    abono: abono,
    created_at: new Date().toISOString(),
    _sync_status: 'pending',
  };

  await db.recaudo.add(newRecaudo as any);

  await encolar({
    tabla: 'recaudo',
    operacion: 'INSERT',
    payload: newRecaudo,
    pk_value: newRecaudo.id,
  });

  await recalcularSaldosContrato(input.contrato_id);

  return newRecaudo;
}

export async function recalcularSaldosContrato(contratoId: number): Promise<void> {
  const contrato = await db.contratos.get(contratoId);
  if (!contrato) return;

  const valorContrato = contrato.valor_contrato;

  const recaudos = await db.recaudo
    .where('contrato_id')
    .equals(contratoId)
    .sortBy('fecha_recaudo');

  let saldoAcumulado = 0;

  const updates = await Promise.all(recaudos.map(async (r) => {
    const monto = r.monto_recaudado;
    const cuota = r.cuota_diaria_pactada;

    const saldoPendiente = valorContrato - saldoAcumulado;
    const nuevoSaldo = Math.max(saldoPendiente - monto, 0);
    const diasPagados = Math.floor(monto / cuota);
    const abono = Math.max(monto - (cuota * diasPagados), 0);

    saldoAcumulado += monto;

    return {
      key: r.id,
      changes: {
        saldo_pendiente: saldoPendiente,
        nuevo_saldo: nuevoSaldo,
        dias_pagados: diasPagados,
        abono: abono,
      },
    };
  }));

  await Promise.all(updates.map(u => db.recaudo.update(u.key, u.changes)));
}

export async function updateRecaudo(id: number, updates: Partial<RecaudoInput>): Promise<Recaudo> {
  const recaudoExistente = await db.recaudo.get(id);
  if (!recaudoExistente) throw new Error('Recaudo no encontrado');

  const recaudoActualizado: Recaudo = {
    ...recaudoExistente,
    ...updates,
    _sync_status: 'pending',
  };

  await db.recaudo.put(recaudoActualizado as any);

  await encolar({
    tabla: 'recaudo',
    operacion: 'UPDATE',
    payload: recaudoActualizado,
    pk_value: id,
  });

  await recalcularSaldosContrato(recaudoExistente.contrato_id);

  return recaudoActualizado;
}

export async function deleteRecaudo(id: number): Promise<void> {
  const recaudo = await db.recaudo.get(id);
  if (!recaudo) throw new Error('Recaudo no encontrado');

  await db.recaudo.delete(id);

  await encolar({
    tabla: 'recaudo',
    operacion: 'DELETE',
    payload: { id },
    pk_value: id,
  });

  await recalcularSaldosContrato(recaudo.contrato_id);
}