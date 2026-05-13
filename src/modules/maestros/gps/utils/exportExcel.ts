import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { GPS } from '../../../../db/schema';

export type ExportOptionType = 'completo' | 'fecha' | 'rango';

export interface ExportOptions {
  tipo: ExportOptionType;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

const getDatePart = (dateString: string) => {
  return dateString.split(' ')[0];
};

export const exportarGpsExcel = (gpsList: GPS[], opciones: ExportOptions) => {
  let gpsFiltrados = gpsList;

  if (opciones.tipo === 'fecha' && opciones.fecha) {
    gpsFiltrados = gpsList.filter(g => {
      if (!g.created_at) return false;
      return getDatePart(g.created_at) === opciones.fecha;
    });
  } else if (opciones.tipo === 'rango' && opciones.fechaInicio && opciones.fechaFin) {
    gpsFiltrados = gpsList.filter(g => {
      if (!g.created_at) return false;
      const fechaGps = getDatePart(g.created_at);
      return fechaGps >= opciones.fechaInicio! && fechaGps <= opciones.fechaFin!;
    });
  }

  const datosExportar = gpsFiltrados.map(g => ({
    'ID': g.id,
    'Placa Moto': g.moto_placa,
    'IMEI GPS': g.gps_imei,
    'Simcard': g.simcard || '',
    'Fecha Creación': g.created_at ? getDatePart(g.created_at) : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(datosExportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'GPS');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  const fechaHoy = new Date().toISOString().split('T')[0];
  saveAs(blob, `Exportacion_GPS_${fechaHoy}.xlsx`);
};
