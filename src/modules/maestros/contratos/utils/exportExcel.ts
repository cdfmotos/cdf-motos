import type { Contrato } from '../../../../db/schema';
import { COLORES, crearHojaEstilizada, descargarExcel, type ColorCelda } from '../../../../utils/excelExport';

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

// 🔹 Colores por estado (mismos que los badges de ContratosTable)
const colorEstadoContrato = (estado: string): ColorCelda | undefined => {
  switch (estado.toLowerCase()) {
    case 'activo':
      return COLORES.verde;
    case 'bodega':
    case 'fiscalia':
    case 'paradenuncio':
    case 'robada':
      return COLORES.amarillo;
    case '':
      return undefined;
    default:
      return COLORES.gris;
  }
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

  const worksheet = crearHojaEstilizada(datosExportar, {
    columnasMoneda: ['Valor Contrato', 'Cuota Diaria'],
    columnasColor: { 'Estado': v => colorEstadoContrato(String(v)) },
  });
  descargarExcel(worksheet, 'Contratos', 'Exportacion_Contratos');
};
