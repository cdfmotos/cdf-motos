import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Formatea un número con separador de miles (sin decimales).
 * Ej: 1500000 → "1.500.000"
 */
function nf(value: any) {
  return new Intl.NumberFormat('es-CO').format(Math.round(Number(value ?? 0)));
}

/**
 * Formatea una fecha ISO o Date a dd/MM/yyyy.
 */
function df(value: any) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Carga una imagen local (ruta pública) y la convierte a base64 Data URL.
 * Funciona en navegador con fetch.
 *
 * @param {string} src  - Ruta pública p.ej. '/logocdfmotos.webp'
 * @returns {Promise<string>}  data URL o cadena vacía si falla
 */
async function loadImageAsDataURL(src: string): Promise<string> {
  try {
    const res = await fetch(src);
    if (!res.ok) return '';
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

/**
 * Genera y descarga (o abre en nueva pestaña) el PDF de extracto de contrato.
 */
export async function descargarPDFExtractoContrato({
  logoPath = '/IMG-20230918-WA0110-picaai.png',
  contratoNum,
  nombres,
  apellidos,
  cedula,
  placa = '',
  cuotaDiariaPactada,
  fechaInicial,
  saldoALaFecha,
  valorContrato,
  listaRecaudos = [],
  modo = 'open',
}: any) {
  // ── 1. Logo ──────────────────────────────────────────────────────────────
  const logoDataURL = await loadImageAsDataURL(logoPath);

  // ── 2. Todos los recaudos ──────────────────────────────────────────────
  // listaRecaudos viene en orden descendente (más recientes primero)
  const todosRecaudos = listaRecaudos;

  // ── 3. Crear documento ───────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  // ── 4. Logo ───────────────────────────────────────────────────────────────
  let cursorY = margin;
  if (logoDataURL) {
    const logoW = 28;
    const logoH = 14;
    doc.addImage(logoDataURL, 'WEBP', (pageW - logoW) / 2, cursorY, logoW, logoH);
    cursorY += logoH + 4;
  }

  // ── 5. Título ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('EXTRACTO DE RECAUDO POR CONTRATO', pageW / 2, cursorY, { align: 'center' });
  cursorY += 5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(`Fecha de impresión: ${df(new Date())}`, pageW / 2, cursorY, { align: 'center' });
  cursorY += 8;

  // ── 6. Bloque de datos del contrato ───────────────────────────────────────
  const boxX = margin;
  const boxW = pageW - margin * 2;
  const boxH = 24;
  doc.setDrawColor(180);
  doc.rect(boxX, cursorY, boxW, boxH);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const col1X = boxX + 4;
  const col2X = boxX + boxW / 2 + 4;
  let rowY = cursorY + 5;
  const rowStep = 4.5;

  // Columna izquierda
  doc.text(`CONTRATO No: ${contratoNum}`, col1X, rowY);
  doc.text(`NOMBRES: ${nombres}`, col1X, rowY + rowStep);
  doc.text(`APELLIDOS: ${apellidos}`, col1X, rowY + rowStep * 2);
  doc.text(`CÉDULA: ${cedula}`, col1X, rowY + rowStep * 3);
  doc.text(`PLACA: ${placa}`, col1X, rowY + rowStep * 4);

  // Columna derecha
  doc.text(`CUOTA DIARIA: $${nf(cuotaDiariaPactada)}`, col2X, rowY);
  doc.text(`FECHA INI: ${df(fechaInicial)}`, col2X, rowY + rowStep);
  doc.text(`SALDO A LA FECHA: $${nf(saldoALaFecha)}`, col2X, rowY + rowStep * 2);
  doc.text(`VALOR CONTRATO: $${nf(valorContrato)}`, col2X, rowY + rowStep * 3);

  cursorY += boxH + 6;

  // ── 7. Tabla de recaudos ──────────────────────────────────────────────────
  const tableRows = todosRecaudos.map((r: any) => [
    String(contratoNum),
    String(r.numero_recaudo ?? ''),
    String(r.placa ?? placa ?? ''),
    `$${nf(r.monto_recaudado)}`,
    `$${nf(r.cuota_diaria_pactada)}`,
    df(r.fecha_recaudo),
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['Contrato', 'N° Recaudo', 'Placa', 'Monto', 'Cuota', 'Fecha']],
    body: tableRows,
    styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: 0,
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 28 },
      2: { cellWidth: 22 },
      3: { cellWidth: 32 },
      4: { cellWidth: 32 },
      5: { cellWidth: 32 },
    },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  // ── 8. Salida ─────────────────────────────────────────────────────────────
  const fileName = `Extracto_${contratoNum}_${new Date().toISOString().slice(0, 10)}.pdf`;

  if (modo === 'download') {
    doc.save(fileName);
  } else {
    // Abrir en nueva pestaña (igual que dart:html window.open)
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Liberar memoria después de un momento
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}