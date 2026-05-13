import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Gasto } from '../../../db/schema';

interface GastoFormProps {
  gasto: Gasto | null;
  onClose: () => void;
  onSave: (data: Partial<Omit<Gasto, 'id' | '_sync_status' | 'created_at'>>) => Promise<void>;
  loading: boolean;
}

export function GastoForm({ gasto, onClose, onSave, loading }: GastoFormProps) {
  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (gasto) {
      setFormData({
        concepto: gasto.concepto || '',
        monto: gasto.monto?.toString() || '',
        fecha: gasto.fecha || new Date().toISOString().split('T')[0],
      });
    }
  }, [gasto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.concepto.trim()) newErrors.concepto = 'El concepto es obligatorio';
    if (!formData.monto.trim() || Number(formData.monto) <= 0) newErrors.monto = 'Ingrese un monto válido';
    if (!formData.fecha.trim()) newErrors.fecha = 'La fecha es obligatoria';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const submitData = {
      concepto: formData.concepto,
      monto: Number(formData.monto),
      fecha: formData.fecha,
    };
    
    await onSave(submitData);
  };

  const getInputClass = (fieldName: string) => 
    `w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
      errors[fieldName] 
        ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
        : 'border-border focus:ring-1 focus:ring-primary focus:border-primary'
    }`;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-slate-800">
            {gasto ? 'Editar Gasto' : 'Nuevo Gasto'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="gasto-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
              <input 
                type="date" 
                name="fecha" 
                value={formData.fecha} 
                onChange={handleChange}
                className={getInputClass('fecha')} 
              />
              {errors.fecha && <span className="text-xs text-red-500 mt-1 block">{errors.fecha}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Concepto *</label>
              <textarea 
                name="concepto" 
                value={formData.concepto} 
                onChange={handleChange}
                placeholder="Descripción del gasto"
                rows={3}
                className={getInputClass('concepto')} 
              />
              {errors.concepto && <span className="text-xs text-red-500 mt-1 block">{errors.concepto}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto *</label>
              <input 
                type="number" 
                name="monto" 
                value={formData.monto} 
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Ej: 50000"
                className={getInputClass('monto')} 
              />
              {errors.monto && <span className="text-xs text-red-500 mt-1 block">{errors.monto}</span>}
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
            form="gasto-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Gasto'}
          </button>
        </div>
      </div>
    </div>
  );
}
