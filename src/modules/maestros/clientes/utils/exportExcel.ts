import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Cliente } from '../../../../db/schema';

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

export const exportarClientesExcel = (clientes: Cliente[], opciones: ExportOptions) => {
  let clientesFiltrados = clientes;

  if (opciones.tipo === 'fecha' && opciones.fecha) {
    clientesFiltrados = clientes.filter(c => {
      if (!c.created_at) return false;
      return getDatePart(c.created_at) === opciones.fecha;
    });
  } else if (opciones.tipo === 'rango' && opciones.fechaInicio && opciones.fechaFin) {
    clientesFiltrados = clientes.filter(c => {
      if (!c.created_at) return false;
      const fechaCliente = getDatePart(c.created_at);
      return fechaCliente >= opciones.fechaInicio! && fechaCliente <= opciones.fechaFin!;
    });
  }

  const datosExportar = clientesFiltrados.map(c => ({
    'ID': c.id,
    'Cédula': c.cedula,
    'Nombres': c.nombres,
    'Apellidos': c.apellidos,
    'Celular': c.celular || '',
    'Celular Alternativo': c.celular_alternativo || '',
    'Dirección': c.direccion_residencia || '',
    'Fecha Creación': c.created_at ? getDatePart(c.created_at) : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(datosExportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  const fechaHoy = new Date().toISOString().split('T')[0];
  saveAs(blob, `Exportacion_Clientes_${fechaHoy}.xlsx`);
};
