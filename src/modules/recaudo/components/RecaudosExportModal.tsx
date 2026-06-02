import { useState } from 'react';
import { X, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { exportarRecaudosExcel } from '../utils/exportarRecaudosExcel';
import type { RecaudoExportType, RecaudoExportOptions } from '../utils/exportarRecaudosExcel';
import { useToast } from '../../../components/ui/Toast';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

interface RecaudosExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecaudosExportModal({ isOpen, onClose }: RecaudosExportModalProps) {
  const { isOnline } = useOnlineStatus();
  const { addToast } = useToast();
  const [tipoExportacion, setTipoExportacion] = useState<RecaudoExportType>('completo');
  const [fecha, setFecha] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [contratoId, setContratoId] = useState('');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!isOnline) {
      addToast('Esta función requiere conexión a internet', 'error');
      return;
    }

    const opciones: RecaudoExportOptions = {
      tipo: tipoExportacion,
    };

    if (tipoExportacion === 'dia') {
      if (!fecha) {
        addToast('Debe ingresar una fecha', 'error');
        return;
      }
      opciones.fecha = fecha;
    } else if (tipoExportacion === 'rango') {
      if (!fechaInicio || !fechaFin) {
        addToast('Debe ingresar ambas fechas', 'error');
        return;
      }
      opciones.fechaInicio = fechaInicio;
      opciones.fechaFin = fechaFin;
    } else if (tipoExportacion === 'contrato') {
      const idNum = parseInt(contratoId, 10);
      if (isNaN(idNum) || idNum <= 0) {
        addToast('Debe ingresar un número de contrato válido', 'error');
        return;
      }
      opciones.contratoId = idNum;
      if (fechaInicio) opciones.fechaInicio = fechaInicio;
      if (fechaFin) opciones.fechaFin = fechaFin;
    }

    setExporting(true);
    const result = await exportarRecaudosExcel(opciones);
    setExporting(false);

    if (result.success) {
      addToast('Excel exportado correctamente', 'success');
      onClose();
    } else {
      addToast(result.error || 'Error al exportar a Excel', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <h3 className="font-medium">Exportar Recaudos a Excel</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Warning */}
        {!isOnline && (
          <div className="flex items-center gap-2 p-3 mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Sin conexión a internet. Debe estar en línea para exportar.</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {/* Opción Completo */}
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
              <input
                type="radio"
                name="exportType"
                value="completo"
                checked={tipoExportacion === 'completo'}
                onChange={(e) => setTipoExportacion(e.target.value as RecaudoExportType)}
                className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
              />
              <span className="text-sm font-medium text-slate-700">Exportar completo</span>
            </label>

            {/* Opción Por Día */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
              <input
                type="radio"
                name="exportType"
                value="dia"
                checked={tipoExportacion === 'dia'}
                onChange={(e) => setTipoExportacion(e.target.value as RecaudoExportType)}
                className="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-1"
              />
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-slate-700 mb-2">Por día de recaudo</span>
                {tipoExportacion === 'dia' && (
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                )}
              </div>
            </label>

            {/* Opción Rango */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
              <input
                type="radio"
                name="exportType"
                value="rango"
                checked={tipoExportacion === 'rango'}
                onChange={(e) => setTipoExportacion(e.target.value as RecaudoExportType)}
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

            {/* Opción Contrato */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
              <input
                type="radio"
                name="exportType"
                value="contrato"
                checked={tipoExportacion === 'contrato'}
                onChange={(e) => setTipoExportacion(e.target.value as RecaudoExportType)}
                className="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-1"
              />
              <div className="flex flex-col flex-1 space-y-2">
                <span className="text-sm font-medium text-slate-700">Por número de contrato</span>
                {tipoExportacion === 'contrato' && (
                  <>
                    <input
                      type="number"
                      placeholder="Ej: 45"
                      value={contratoId}
                      onChange={(e) => setContratoId(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-xs font-semibold text-slate-500 block">Filtrar rango (Opcional)</span>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block">Inicio</span>
                          <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block">Fin</span>
                          <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
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
              exporting ||
              !isOnline ||
              (tipoExportacion === 'dia' && !fecha) ||
              (tipoExportacion === 'rango' && (!fechaInicio || !fechaFin)) ||
              (tipoExportacion === 'contrato' && !contratoId)
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exportando...' : 'Descargar'}
          </button>
        </div>
      </div>
    </div>
  );
}
