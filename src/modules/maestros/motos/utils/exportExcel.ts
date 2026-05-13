import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Moto } from '../../../../db/schema';

export type ExportOptionType = 'completo' | 'fecha' | 'rango';

export interface ExportOptions {
  tipo: ExportOptionType;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

// 🔹 Extrae solo la parte YYYY-MM-DD de "2026-04-11 12:34:53.429+00"
const getDatePart = (dateString: string) => {
  return dateString.split(' ')[0];
};

export const exportarMotosExcel = (motos: Moto[], opciones: ExportOptions) => {
  let motosFiltradas = motos;

  // 🔹 Filtro por fecha exacta
  if (opciones.tipo === 'fecha' && opciones.fecha) {
    motosFiltradas = motos.filter(m => {
      if (!m.created_at) return false;
      return getDatePart(m.created_at) === opciones.fecha;
    });

  // 🔹 Filtro por rango de fechas
  } else if (opciones.tipo === 'rango' && opciones.fechaInicio && opciones.fechaFin) {
    motosFiltradas = motos.filter(m => {
      if (!m.created_at) return false;

      const fechaMoto = getDatePart(m.created_at);

      return (
        fechaMoto >= opciones.fechaInicio! &&
        fechaMoto <= opciones.fechaFin!
      );
    });
  }

  // 🔹 Mapear datos para Excel
  const datosExportar = motosFiltradas.map(moto => ({
    'ID': moto.id,
    'Placa': moto.placa,
    'Marca': moto.marca || '',
    'Modelo': moto.modelo || '',
    'Año': moto.anio || '',
    'Color': moto.color || '',
    'Motor': moto.motor || '',
    'Chasis/VIN': moto.chasis_vin || '',
    'Propietario': moto.propietario || '',
    'Fecha Compra': moto.fecha_compra || '',
    'Factura Venta': moto.factura_venta || '',
    'Factura Documentos': moto.factura_documentos || '',
    'Fecha Creación': moto.created_at
      ? getDatePart(moto.created_at)
      : '',
  }));

  // 🔹 Crear Excel
  const worksheet = XLSX.utils.json_to_sheet(datosExportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Motos');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  // 🔹 Nombre del archivo con fecha actual
  const fechaHoy = new Date().toISOString().split('T')[0];

  saveAs(blob, `Exportacion_Motos_${fechaHoy}.xlsx`);
};