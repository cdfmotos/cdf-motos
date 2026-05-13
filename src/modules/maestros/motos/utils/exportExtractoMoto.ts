import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function nf(value: any) {
  return new Intl.NumberFormat('es-CO').format(Math.round(Number(value ?? 0)));
}

function df(value: any) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

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

export async function descargarPDFExtractoMoto({
  logoPath = '/IMG-20230918-WA0110-picaai.png',
  placa = '',
  listaContratos = [],
  modo = 'open',
}: any) {
  const logoDataURL = await loadImageAsDataURL(logoPath);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  let cursorY = margin;
  if (logoDataURL) {
    const logoW = 28;
    const logoH = 14;
    doc.addImage(logoDataURL, 'WEBP', (pageW - logoW) / 2, cursorY, logoW, logoH);
    cursorY += logoH + 4;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`EXTRACTO DE MOTOS - PLACA: ${placa}`, pageW / 2, cursorY, { align: 'center' });
  cursorY += 5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(`Fecha de impresión: ${df(new Date())}`, pageW / 2, cursorY, { align: 'center' });
  cursorY += 8;

  const tableRows = listaContratos.map((c: any) => [
    String(c.numero_contrato),
    String(c.placa),
    String(c.cedula),
    `$${nf(c.valor_contrato)}`,
    `$${nf(c.cuota_diaria)}`,
    df(c.fecha_compra),
    String(c.tipo_contrato)
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['N° Contrato', 'Placa', 'Cédula', 'Valor Contrato', 'Cuota Diaria', 'Fecha Inicio', 'Tipo']],
    body: tableRows,
    styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: 0,
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  const fileName = `ExtractoMoto_${placa}_${new Date().toISOString().slice(0, 10)}.pdf`;

  if (modo === 'download') {
    doc.save(fileName);
  } else {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}