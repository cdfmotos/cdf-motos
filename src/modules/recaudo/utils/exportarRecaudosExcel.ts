import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { supabase } from '../../../lib/supabase';

export type RecaudoExportType = 'completo' | 'dia' | 'rango' | 'contrato';

export interface RecaudoExportOptions {
  tipo: RecaudoExportType;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
  contratoId?: number;
}

export async function exportarRecaudosExcel(opciones: RecaudoExportOptions): Promise<{ success: boolean; error?: string }> {
  if (!navigator.onLine) {
    return { success: false, error: 'Esta función requiere conexión a internet' };
  }

  try {
    let query = supabase
      .from('recaudo')
      .select('id, numero_recaudo, contrato_id, fecha_recaudo, monto_recaudado, abono, saldo_pendiente, nuevo_saldo, dias_pagados, tipo_contrato, created_at');

    if (opciones.tipo === 'dia' && opciones.fecha) {
      query = query.eq('fecha_recaudo', opciones.fecha);
    } else if (opciones.tipo === 'rango' && opciones.fechaInicio && opciones.fechaFin) {
      query = query.gte('fecha_recaudo', opciones.fechaInicio).lte('fecha_recaudo', opciones.fechaFin);
    } else if (opciones.tipo === 'contrato' && opciones.contratoId) {
      query = query.eq('contrato_id', opciones.contratoId);
      if (opciones.fechaInicio) {
        query = query.gte('fecha_recaudo', opciones.fechaInicio);
      }
      if (opciones.fechaFin) {
        query = query.lte('fecha_recaudo', opciones.fechaFin);
      }
    }

    const { data: rows, error } = await query
      .order('fecha_recaudo', { ascending: false })
      .order('id', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!rows || rows.length === 0) {
      return { success: false, error: 'No se encontraron recaudos con los filtros seleccionados' };
    }

    const formatTime = (isoString: string | null) => {
      if (!isoString) return '';
      try {
        const d = new Date(isoString);
        return d.toLocaleDateString('es-CO') + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      } catch {
        return isoString;
      }
    };

    const datosExportar = rows.map(r => ({
      'id': r.id,
      'No. Recaudo': r.numero_recaudo || '',
      'Contrato ID': r.contrato_id,
      'Fecha recaudo': r.fecha_recaudo,
      'Monto recaudado': r.monto_recaudado,
      'abono': r.abono ?? 0,
      'saldo_pendiente': r.saldo_pendiente ?? 0,
      'nuevo_saldo': r.nuevo_saldo ?? 0,
      'dias_pagados': r.dias_pagados ?? 0,
      'tipo_contrato': r.tipo_contrato || '',
      'fecha_creacion': formatTime(r.created_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recaudos');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    const fechaHoy = new Date().toISOString().split('T')[0];
    saveAs(blob, `Exportacion_Recaudos_${fechaHoy}.xlsx`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al exportar a Excel' };
  }
}
