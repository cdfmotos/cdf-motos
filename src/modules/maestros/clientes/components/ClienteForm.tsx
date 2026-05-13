import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Cliente } from '../../../../db/schema';

interface ClienteFormProps {
  cliente: Cliente | null;
  onClose: () => void;
  onSave: (data: Partial<Omit<Cliente, 'id' | '_sync_status' | 'created_at'>>) => Promise<void>;
  loading: boolean;
}

export function ClienteForm({ cliente, onClose, onSave, loading }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    cedula: '',
    nombres: '',
    apellidos: '',
    celular: '',
    celular_alternativo: '',
    direccion_residencia: '',
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        cedula: cliente.cedula || '',
        nombres: cliente.nombres || '',
        apellidos: cliente.apellidos || '',
        celular: cliente.celular || '',
        celular_alternativo: cliente.celular_alternativo || '',
        direccion_residencia: cliente.direccion_residencia || '',
      });
    }
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-slate-800">
            {cliente ? `Editar Cliente: ${cliente.nombres}` : 'Nuevo Cliente'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="cliente-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Cédula *</label>
                <input 
                  type="text" 
                  name="cedula" 
                  value={formData.cedula} 
                  onChange={handleChange}
                  required
                  placeholder="Número de documento"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
                <input 
                  type="text" 
                  name="nombres" 
                  value={formData.nombres} 
                  onChange={handleChange}
                  required
                  placeholder="Nombres del cliente"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
                <input 
                  type="text" 
                  name="apellidos" 
                  value={formData.apellidos} 
                  onChange={handleChange}
                  required
                  placeholder="Apellidos del cliente"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Celular Principal</label>
                <input 
                  type="text" 
                  name="celular" 
                  value={formData.celular} 
                  onChange={handleChange}
                  placeholder="Ej. 3001234567"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Celular Alternativo</label>
                <input 
                  type="text" 
                  name="celular_alternativo" 
                  value={formData.celular_alternativo} 
                  onChange={handleChange}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección de Residencia</label>
                <input 
                  type="text" 
                  name="direccion_residencia" 
                  value={formData.direccion_residencia} 
                  onChange={handleChange}
                  placeholder="Dirección completa"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                />
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3 rounded-b-xl shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-border text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="cliente-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
}
