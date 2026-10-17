import type { Database } from '../types/database.types';
import { crearHojaEstilizada, descargarExcel } from './excelExport';

type VistaReportePendientes = Database['public']['Views']['vista_reporte_pendientes']['Row'];

export const exportarReporteRecaudosExcel = (data: VistaReportePendientes[]) => {
  const datosExportar = data.map(r => ({
    'Contrato #': r.contrato_numero,
    'Placa': r.placa || 'N/A',
    'Cliente': r.cliente || '',
    'Cuota Diaria': r.cuota_diaria,
    'Valor Contrato': r.valor_contrato,
    'Saldo Pendiente': r.saldo_pendiente,
    'Tipo Contrato': r.tipo_contrato || '',
    'Último Recaudo': r.fecha_último_recaudo || 'N/A',
  }));

  const worksheet = crearHojaEstilizada(datosExportar, {
    columnasMoneda: ['Cuota Diaria', 'Valor Contrato', 'Saldo Pendiente'],
  });
  descargarExcel(worksheet, 'Reporte Recaudos', 'Reporte_Recaudos');
};