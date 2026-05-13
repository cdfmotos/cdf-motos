import React, { useState } from 'react';
import { X, Download, FileSpreadsheet } from 'lucide-react';
import { exportarClientesExcel } from '../utils/exportExcel';
import type { ExportOptionType, ExportOptions } from '../utils/exportExcel';
import type { Cliente } from '../../../../db/schema';

interface ClientesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientes: Cliente[];
}

export function ClientesExportModal({ isOpen, onClose, clientes }: ClientesExportModalProps) {
  const [tipoExportacion, setTipoExportacion] = useState<ExportOptionType>('completo');
  const [fecha, setFecha] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    const opciones: ExportOptions = { 
      tipo: tipoExportacion, 
      fecha, 
      fechaInicio, 
      fechaFin 
    };
    exportarClientesExcel(clientes, opciones);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <h3 className="font-medium">Exportar a Excel</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
              <input
                type="radio"
                name="exportType"
                value="completo"
                checked={tipoExportacion === 'completo'}
                onChange={(e) => setTipoExportacion(e.target.value as ExportOptionType)}
                className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
              />
              <span className="text-sm font-medium text-slate-700">Exportar completo</span>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
              <input
                type="radio"
                name="exportType"
                value="fecha"
                checked={tipoExportacion === 'fecha'}
                onChange={(e) => setTipoExportacion(e.target.value as ExportOptionType)}
                className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
              />
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-slate-700 mb-2">Por fecha de creación</span>
                {tipoExportacion === 'fecha' && (
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                )}
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
              <input
                type="radio"
                name="exportType"
                value="rango"
                checked={tipoExportacion === 'rango'}
                onChange={(e) => setTipoExportacion(e.target.value as ExportOptionType)}
                className="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-1"
              />
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-slate-700 mb-2">Por rango de fechas</span>
                {tipoExportacion === 'rango' && (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-xs text-slate-500 block mb-1">Inicio</span>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-slate-500 block mb-1">Fin</span>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={
              (tipoExportacion === 'fecha' && !fecha) ||
              (tipoExportacion === 'rango' && (!fechaInicio || !fechaFin))
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
}
