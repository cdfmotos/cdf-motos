import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Contrato } from '../../../../db/schema';

export type ExportOptionType = 'completo' | 'fecha' | 'rango' | 'estado';

export interface ExportOptions {
  tipo: ExportOptionType;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
}

const getDatePart = (dateString: string) => {
  return dateString.split(' ')[0];
};

export const exportarContratosExcel = (contratos: Contrato[], opciones: ExportOptions) => {
  let contratosFiltrados = contratos;

  if (opciones.tipo === 'fecha' && opciones.fecha) {
    contratosFiltrados = contratos.filter(c => {
      if (!c.created_at) return false;
      return getDatePart(c.created_at) === opciones.fecha;
    });
  } else if (opciones.tipo === 'rango' && opciones.fechaInicio && opciones.fechaFin) {
    contratosFiltrados = contratos.filter(c => {
      if (!c.created_at) return false;
      const fechaContrato = getDatePart(c.created_at);
      return fechaContrato >= opciones.fechaInicio! && fechaContrato <= opciones.fechaFin!;
    });
  } else if (opciones.tipo === 'estado' && opciones.estado) {
    contratosFiltrados = contratos.filter(c => c.estado === opciones.estado);
  }

  const datosExportar = contratosFiltrados.map(c => ({
    'ID': c.id,
    'ID Antiguo': c.id_old || '',
    'Cédula Cliente': c.cliente_cedula || '',
    'Placa Moto': c.placa || '',
    'Tipo de Contrato': c.tipo_contrato,
    'Estado': c.estado || '',
    'Fecha de Inicio': c.fecha_inicio,
    'Valor Contrato': c.valor_contrato,
    'Cuota Diaria': c.cuota_diaria,
    'Fecha Creación': c.created_at ? getDatePart(c.created_at) : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(datosExportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  const fechaHoy = new Date().toISOString().split('T')[0];
  saveAs(blob, `Exportacion_Contratos_${fechaHoy}.xlsx`);
};
