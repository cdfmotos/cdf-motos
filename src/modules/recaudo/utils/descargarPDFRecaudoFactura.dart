// Automatic FlutterFlow imports
import '/backend/schema/enums/enums.dart';
import '/backend/supabase/supabase.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/custom_code/actions/index.dart'; // Imports other custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

// IMPORTS MANUALES
import 'dart:html' as html;
import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:intl/intl.dart';

Future descargarPDFRecaudoFactura(
  String numeroRecaudo,
  DateTime fechaRecaudo,
  String contratoNum,
  String? placa,
  String nombres,
  String cedula,
  double montoRecaudado,
  double saldoPendiente,
) async {
  final pdf = pw.Document();

  final pageFormat = PdfPageFormat(
    36 * PdfPageFormat.mm,
    110 * PdfPageFormat.mm, // Aumentamos el alto
  );

  final nf = NumberFormat.decimalPattern();

  pdf.addPage(
    pw.Page(
      pageFormat: pageFormat,
      margin: pw.EdgeInsets.symmetric(
          horizontal: 4, vertical: 4), // margen ampliado
      build: (context) {
        return pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.stretch,
          children: [
            pw.Center(
              child: pw.Column(children: [
                pw.Text('COMPROBANTE',
                    style: pw.TextStyle(
                        fontSize: 8, fontWeight: pw.FontWeight.bold)),
                pw.Text('DE RECAUDO',
                    style: pw.TextStyle(
                        fontSize: 8, fontWeight: pw.FontWeight.bold)),
                pw.SizedBox(height: 2),
                pw.Text('NO. $numeroRecaudo', style: pw.TextStyle(fontSize: 7)),
              ]),
            ),
            pw.SizedBox(height: 4),
            pw.Text(
              'Fecha: ${DateFormat('dd/MM/yyyy HH:mm').format(fechaRecaudo)}',
              style: pw.TextStyle(fontSize: 7),
            ),
            pw.SizedBox(height: 2),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Contrato:', style: pw.TextStyle(fontSize: 7)),
                pw.Text(contratoNum, style: pw.TextStyle(fontSize: 7)),
              ],
            ),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Placa:', style: pw.TextStyle(fontSize: 7)),
                pw.Text(placa ?? '', style: pw.TextStyle(fontSize: 7)),
              ],
            ),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Nombre:', style: pw.TextStyle(fontSize: 7)),
                pw.Flexible(
                    child: pw.Text(nombres,
                        textAlign: pw.TextAlign.right,
                        style: pw.TextStyle(fontSize: 7))),
              ],
            ),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Cédula:', style: pw.TextStyle(fontSize: 7)),
                pw.Text(cedula, style: pw.TextStyle(fontSize: 7)),
              ],
            ),
            pw.SizedBox(height: 5),
            pw.Text('Monto Recaudado',
                style:
                    pw.TextStyle(fontSize: 7, fontWeight: pw.FontWeight.bold)),
            pw.Text('\$ ${nf.format(montoRecaudado.toInt())}',
                style: pw.TextStyle(fontSize: 7)),
            pw.SizedBox(height: 2),
            pw.Text('Saldo Pendiente',
                style:
                    pw.TextStyle(fontSize: 7, fontWeight: pw.FontWeight.bold)),
            pw.Text('\$ ${nf.format(saldoPendiente.toInt())}',
                style: pw.TextStyle(fontSize: 7)),
            pw.SizedBox(height: 8), // más espacio inferior
            pw.Divider(thickness: 0.3),
            pw.Text('Nombre de quien entrega',
                textAlign: pw.TextAlign.center,
                style: pw.TextStyle(fontSize: 6)),
            pw.SizedBox(height: 4),
            pw.Divider(thickness: 0.3),
            pw.Text('Firma de quien entrega',
                textAlign: pw.TextAlign.center,
                style: pw.TextStyle(fontSize: 6)),
            pw.SizedBox(height: 8), // espacio extra para evitar corte
          ],
        );
      },
    ),
  );

  final bytes = await pdf.save();
  final blob = html.Blob([bytes], 'application/pdf');
  final url = html.Url.createObjectUrlFromBlob(blob);
  html.window.open(url, '_blank');
}
