import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Gasto } from '../../../db/schema';

export type ExportOptionType = 'completo' | 'fecha' | 'rango';

export interface ExportOptions {
  tipo: ExportOptionType;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export const exportarGastosExcel = (gastos: Gasto[], opciones: ExportOptions) => {
  let gastosFiltrados = gastos;

  if (opciones.tipo === 'fecha' && opciones.fecha) {
    gastosFiltrados = gastos.filter(g => g.fecha === opciones.fecha);
  } else if (opciones.tipo === 'rango' && opciones.fechaInicio && opciones.fechaFin) {
    gastosFiltrados = gastos.filter(g => {
      return g.fecha >= opciones.fechaInicio! && g.fecha <= opciones.fechaFin!;
    });
  }

  const datosExportar = gastosFiltrados.map(g => ({
    'ID': g.id,
    'Fecha': g.fecha,
    'Concepto': g.concepto,
    'Monto': g.monto,
  }));

  const worksheet = XLSX.utils.json_to_sheet(datosExportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gastos');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

  const fechaHoy = new Date().toISOString().split('T')[0];
  saveAs(blob, `Exportacion_Gastos_${fechaHoy}.xlsx`);
};
