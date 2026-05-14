import { jsPDF } from 'jspdf';

export interface ReciboPDFData {
  numeroRecaudo: string;
  fechaRecaudo: Date;
  contratoNum: string;
  placa: string | null;
  nombres: string;
  cedula: string;
  montoRecaudado: number;
  saldoPendiente: number;
}

export function generarPDFRecibo(data: ReciboPDFData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [36, 110],
  });

  const nf = (v: number) =>
    new Intl.NumberFormat('es-CO').format(Math.round(v));

  const fechaStr = data.fechaRecaudo.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('COMPROBANTE', 18, 5, { align: 'center' });
  doc.text('DE RECAUDO', 18, 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`NO. ${data.numeroRecaudo}`, 18, 13, { align: 'center' });

  doc.setFontSize(7);
  doc.text(`Fecha: ${fechaStr}`, 4, 18);
  doc.text(`Contrato: ${data.contratoNum}`, 4, 23);
  doc.text(`Placa: ${data.placa ?? ''}`, 4, 28);
  doc.text(`Nombre: ${data.nombres}`, 4, 33);
  doc.text(`Cédula: ${data.cedula}`, 4, 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Monto Recaudado', 4, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`$ ${nf(data.montoRecaudado)}`, 4, 49);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Saldo Pendiente', 4, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(`$ ${nf(data.saldoPendiente)}`, 4, 58);

  doc.setLineWidth(0.3);
  doc.line(4, 63, 32, 63);
  doc.setFontSize(6);
  doc.text('Nombre de quien entrega', 18, 67, { align: 'center' });
  doc.line(4, 70, 32, 70);
  doc.text('Firma de quien entrega', 18, 74, { align: 'center' });

  doc.output('dataurlnewwindow');
}