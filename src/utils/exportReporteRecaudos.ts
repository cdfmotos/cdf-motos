import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Database } from '../types/database.types';

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
  }));

  const worksheet = XLSX.utils.json_to_sheet(datosExportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Recaudos');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  const fechaHoy = new Date().toISOString().split('T')[0];
  saveAs(blob, `Reporte_Recaudos_${fechaHoy}.xlsx`);
};