import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Soat } from '../../../../db/schema';

interface SoatFormProps {
  soat: Soat | null;
  onClose: () => void;
  onSave: (data: Partial<Omit<Soat, 'id' | '_sync_status' | 'created_at'>>) => Promise<void>;
  loading: boolean;
}

export function SoatForm({ soat, onClose, onSave, loading }: SoatFormProps) {
  const [formData, setFormData] = useState({
    moto_placa: '',
    no_soat: '',
    fecha_vencimiento: '',
  });

  useEffect(() => {
    if (soat) {
      setFormData({
        moto_placa: soat.moto_placa || '',
        no_soat: soat.no_soat || '',
        fecha_vencimiento: soat.fecha_vencimiento || '',
      });
    }
  }, [soat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      moto_placa: formData.moto_placa.toUpperCase(),
    };
    
    await onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-slate-800">
            {soat ? `Editar SOAT: ${soat.moto_placa}` : 'Nuevo SOAT'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="soat-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Placa Moto *</label>
              <input 
                type="text" 
                name="moto_placa" 
                value={formData.moto_placa} 
                onChange={handleChange}
                required
                maxLength={6}
                placeholder="Ej. AAA123"
                className="w-full px-3 py-2 border border-border rounded-lg uppercase focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">N° de SOAT *</label>
              <input 
                type="text" 
                name="no_soat" 
                value={formData.no_soat} 
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Vencimiento *</label>
              <input 
                type="date" 
                name="fecha_vencimiento" 
                value={formData.fecha_vencimiento} 
                onChange={handleChange}
                required
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
            form="soat-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar SOAT'}
          </button>
        </div>
      </div>
    </div>
  );
}
