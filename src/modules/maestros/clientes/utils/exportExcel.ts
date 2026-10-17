import type { Cliente } from '../../../../db/schema';
import { crearHojaEstilizada, descargarExcel } from '../../../../utils/excelExport';

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

  const worksheet = crearHojaEstilizada(datosExportar);
  descargarExcel(worksheet, 'Clientes', 'Exportacion_Clientes');
};
