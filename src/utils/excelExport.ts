import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

export interface ColorCelda {
  fondo: string;
  texto: string;
}

// 🔹 Paleta alineada con los badges de la app (Tailwind: fondo -100 / texto -700)
export const COLORES = {
  verde: { fondo: 'DCFCE7', texto: '15803D' },
  amarillo: { fondo: 'FEF9C3', texto: 'A16207' },
  rojo: { fondo: 'FEE2E2', texto: 'B91C1C' },
  gris: { fondo: 'F1F5F9', texto: '475569' },
} satisfies Record<string, ColorCelda>;

export interface OpcionesHoja {
  /** Encabezados de columnas con valores en pesos (formato $ 1.234.567) */
  columnasMoneda?: string[];
  /** Encabezado de columna → función que devuelve el color de la celda según su valor */
  columnasColor?: Record<string, (valor: unknown) => ColorCelda | undefined>;
}

const FORMATO_MONEDA = '"$"#,##0';
const BORDE = { style: 'thin', color: { rgb: 'E2E8F0' } };
const BORDES = { top: BORDE, bottom: BORDE, left: BORDE, right: BORDE };

const ESTILO_ENCABEZADO = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '1E293B' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: BORDES,
};

// 🔹 Crea una hoja con encabezado oscuro, bordes, filas alternadas, filtros,
//    anchos automáticos, formato de moneda y celdas coloreadas por valor
export const crearHojaEstilizada = <T extends Record<string, unknown>>(
  datos: T[],
  opciones: OpcionesHoja = {},
): XLSX.WorkSheet => {
  const worksheet = XLSX.utils.json_to_sheet(datos);
  if (!worksheet['!ref']) return worksheet;

  const rango = XLSX.utils.decode_range(worksheet['!ref']);
  const encabezados: string[] = [];
  for (let c = rango.s.c; c <= rango.e.c; c++) {
    encabezados.push(String(worksheet[XLSX.utils.encode_cell({ r: 0, c })]?.v ?? ''));
  }

  const monedas = new Set(opciones.columnasMoneda ?? []);
  const anchos = encabezados.map(h => h.length);

  for (let r = rango.s.r; r <= rango.e.r; r++) {
    for (let c = rango.s.c; c <= rango.e.c; c++) {
      const celda = worksheet[XLSX.utils.encode_cell({ r, c })];
      if (!celda) continue;

      if (r === 0) {
        celda.s = ESTILO_ENCABEZADO;
        continue;
      }

      const encabezado = encabezados[c];
      const estilo: Record<string, unknown> = {
        alignment: { vertical: 'center' },
        border: BORDES,
      };

      if (r % 2 === 0) estilo.fill = { fgColor: { rgb: 'F8FAFC' } };

      if (monedas.has(encabezado)) {
        // Supabase puede devolver numeric como string: se convierte para que Excel lo sume
        if (celda.t === 's' && celda.v !== '' && !Number.isNaN(Number(celda.v))) {
          celda.t = 'n';
          celda.v = Number(celda.v);
        }
        if (celda.t === 'n') celda.z = FORMATO_MONEDA;
      }

      const color = opciones.columnasColor?.[encabezado]?.(celda.v);
      if (color) {
        estilo.fill = { fgColor: { rgb: color.fondo } };
        estilo.font = { bold: true, color: { rgb: color.texto } };
        estilo.alignment = { vertical: 'center', horizontal: 'center' };
      }

      celda.s = estilo;

      const largo = monedas.has(encabezado) && celda.t === 'n'
        ? Math.round(Number(celda.v)).toLocaleString('es-CO').length + 2
        : String(celda.v ?? '').length;
      anchos[c] = Math.max(anchos[c], largo);
    }
  }

  worksheet['!cols'] = anchos.map(a => ({ wch: Math.min(Math.max(a + 2, 8), 50) }));
  worksheet['!rows'] = [{ hpt: 22 }];
  worksheet['!autofilter'] = { ref: worksheet['!ref'] };

  return worksheet;
};

// 🔹 Fecha local YYYY-MM-DD (toISOString usa UTC y cambia de día en la noche)
const fechaLocalHoy = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
};

// 🔹 Arma el libro con una hoja y lo descarga como `${prefijo}_YYYY-MM-DD.xlsx`
export const descargarExcel = (worksheet: XLSX.WorkSheet, nombreHoja: string, prefijoArchivo: string) => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  saveAs(blob, `${prefijoArchivo}_${fechaLocalHoy()}.xlsx`);
};
