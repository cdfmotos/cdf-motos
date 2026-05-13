import React, { useEffect, useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { getExtractoMoto } from '../services/extractoMoto';
import { descargarPDFExtractoMoto } from '../utils/exportExtractoMoto';
import { db } from '../../../../db/db';

interface ExtractoMotoDialogProps {
  open: boolean;
  onClose: () => void;
  placa: string | null;
}

const nf = (v: number | string | null | undefined) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .format(Number(v ?? 0));

const df = (v: Date | string | null | undefined) => {
  if (!v) return '—';
  const d = v instanceof Date ? v : new Date(v);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function ExtractoMotoDialog({ open, onClose, placa }: ExtractoMotoDialogProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    if (!open || !placa) return;
    setLoading(true);
    setError('');
    setData([]);

    getExtractoMoto(db, placa)
      .then(setData)
      .catch((e: any) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [open, placa]);

  const handleDescargarPDF = async () => {
    if (!data.length) return;
    setGenerandoPDF(true);
    try {
      await descargarPDFExtractoMoto({
        logoPath: '/IMG-20230918-WA0110-picaai.png',
        placa: placa,
        listaContratos: data,
        modo: 'open',
      });
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-slate-800">
              Extracto de Moto {placa ? `- ${placa}` : ''}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {loading && (
            <div className="py-12 text-center text-slate-500 animate-pulse">
              Cargando extracto...
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              Error: {error}
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-6">
              {/* Tabla */}
              <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-medium">N° Contrato</th>
                        <th className="px-4 py-3 font-medium">Placa</th>
                        <th className="px-4 py-3 font-medium">Cédula</th>
                        <th className="px-4 py-3 font-medium">Valor Contrato</th>
                        <th className="px-4 py-3 font-medium">Cuota Diaria</th>
                        <th className="px-4 py-3 font-medium">Fecha Inicio</th>
                        <th className="px-4 py-3 font-medium">Tipo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                            Sin contratos registrados para esta moto
                          </td>
                        </tr>
                      ) : (
                        data.map((c: any) => (
                          <tr key={c.numero_contrato} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700">{c.numero_contrato}</td>
                            <td className="px-4 py-3 text-slate-600">{c.placa}</td>
                            <td className="px-4 py-3 text-slate-600">{c.cedula}</td>
                            <td className="px-4 py-3 font-medium text-green-600">{nf(c.valor_contrato)}</td>
                            <td className="px-4 py-3 text-slate-600">{nf(c.cuota_diaria)}</td>
                            <td className="px-4 py-3 text-slate-600">{df(c.fecha_compra)}</td>
                            <td className="px-4 py-3 text-slate-600">{c.tipo_contrato}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-border text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
          {data && data.length > 0 && (
            <button 
              onClick={handleDescargarPDF}
              disabled={generandoPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-70"
            >
              <Download className="w-4 h-4" />
              {generandoPDF ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}