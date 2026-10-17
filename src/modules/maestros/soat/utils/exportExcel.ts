import type { Soat } from '../../../../db/schema';
import { COLORES, crearHojaEstilizada, descargarExcel, type ColorCelda } from '../../../../utils/excelExport';

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

const DIAS_ALERTA_VENCIMIENTO = 30;

type EstadoSoat = 'Vigente' | 'Próximo a vencer' | 'Vencido' | 'Sin fecha';

// 🔹 Convierte YYYY-MM-DD a días (UTC) para comparar sin desfases de zona horaria
const toDayNumber = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

// 🔹 Calcula el estado según la fecha de vencimiento (fecha local de hoy)
const calcularEstadoSoat = (fechaVencimiento?: string | null): EstadoSoat => {
  if (!fechaVencimiento) return 'Sin fecha';

  const fechaVenc = getDatePart(fechaVencimiento).slice(0, 10);
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  const diasRestantes = toDayNumber(fechaVenc) - toDayNumber(hoyStr);
  if (Number.isNaN(diasRestantes)) return 'Sin fecha';

  if (diasRestantes < 0) return 'Vencido';
  if (diasRestantes <= DIAS_ALERTA_VENCIMIENTO) return 'Próximo a vencer';
  return 'Vigente';
};

// 🔹 Colores por estado (mismos tonos que la tabla)
const COLORES_ESTADO: Record<EstadoSoat, ColorCelda> = {
  'Vigente': COLORES.verde,
  'Próximo a vencer': COLORES.amarillo,
  'Vencido': COLORES.rojo,
  'Sin fecha': COLORES.gris,
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
    'Estado': calcularEstadoSoat(soat.fecha_vencimiento),
    'Fecha Creación': soat.created_at
      ? getDatePart(soat.created_at)
      : '',
  }));

  const worksheet = crearHojaEstilizada(datosExportar, {
    columnasColor: { 'Estado': v => COLORES_ESTADO[v as EstadoSoat] },
  });

  descargarExcel(worksheet, 'SOAT', 'Exportacion_SOAT');
};