import React, { useState, useEffect } from 'react';
import { X, Save, Lock, Unlock } from 'lucide-react';
import type { EstadoSistema } from '../../../db/schema';
import { formatDate } from '../../../utils/formatters';

interface EditEstadoModalProps {
  estado: EstadoSistema | null;
  onClose: () => void;
  onSave: (fecha: string, abierto: boolean, observacion?: string) => Promise<boolean>;
}

export function EditEstadoModal({ estado, onClose, onSave }: EditEstadoModalProps) {
  const [abierto, setAbierto] = useState(true);
  const [observacion, setObservacion] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (estado) {
      setAbierto(estado.abierto);
      setObservacion(estado.observacion || '');
    } else {
      // Si es nuevo (hoy), por defecto abierto
      setAbierto(true);
      setObservacion('');
    }
  }, [estado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fechaTarget = estado ? estado.fecha : new Date().toISOString().split('T')[0];
    const success = await onSave(fechaTarget, abierto, observacion);
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-slate-800">
            {estado ? `Editar Estado: ${formatDate(estado.fecha)}` : 'Gestionar Día Actual'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="estado-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Estado del Día</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAbierto(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    abierto 
                      ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
                      : 'bg-slate-50 border-border text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Unlock className="w-5 h-5" />
                  <span className="font-medium">Abierto</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    !abierto 
                      ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' 
                      : 'bg-slate-50 border-border text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Cerrado</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observación (Opcional)</label>
              <textarea 
                value={observacion} 
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej: Cerrado por festivo..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-border text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="estado-form"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Estado'}
          </button>
        </div>
      </div>
    </div>
  );
}
