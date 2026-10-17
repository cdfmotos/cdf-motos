import type { Gasto } from '../../../db/schema';
import { crearHojaEstilizada, descargarExcel } from '../../../utils/excelExport';

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

  const worksheet = crearHojaEstilizada(datosExportar, {
    columnasMoneda: ['Monto'],
  });
  descargarExcel(worksheet, 'Gastos', 'Exportacion_Gastos');
};
