import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Soat } from '../../../../db/schema';

export type ExportOptionType = 'completo' | 'fecha' | 'rango';

export interface ExportOptions {
  tipo: ExportOptionType;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

// 🔹 Extrae YYYY-MM-DD
const getDatePart = (dateString: string) => {
  return dateString.split(' ')[0];
};

export const exportarSoatsExcel = (soats: Soat[], opciones: ExportOptions) => {
  let soatsFiltrados = soats;

  // 🔹 Filtro por fecha exacta
  if (opciones.tipo === 'fecha' && opciones.fecha) {
    soatsFiltrados = soats.filter(s => {
      if (!s.created_at) return false;
      return getDatePart(s.created_at) === opciones.fecha;
    });

  // 🔹 Filtro por rango
  } else if (opciones.tipo === 'rango' && opciones.fechaInicio && opciones.fechaFin) {
    soatsFiltrados = soats.filter(s => {
      if (!s.created_at) return false;

      const fechaSoat = getDatePart(s.created_at);

      return (
        fechaSoat >= opciones.fechaInicio! &&
        fechaSoat <= opciones.fechaFin!
      );
    });
  }

  // 🔹 Datos para Excel (AJUSTADOS A TU SCHEMA REAL)
  const datosExportar = soatsFiltrados.map(soat => ({
    'ID': soat.id,
    'Placa Moto': soat.moto_placa,
    'N° SOAT': soat.no_soat,
    'Fecha Vencimiento': soat.fecha_vencimiento
      ? getDatePart(soat.fecha_vencimiento)
      : '',
    'Fecha Creación': soat.created_at
      ? getDatePart(soat.created_at)
      : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(datosExportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SOAT');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  const fechaHoy = new Date().toISOString().split('T')[0];

  saveAs(blob, `Exportacion_SOAT_${fechaHoy}.xlsx`);
};