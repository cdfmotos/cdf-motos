import React, { useState, useEffect } from 'react';
import { X, Save, Wifi, WifiOff } from 'lucide-react';
import type { Moto } from '../../../../db/schema';
import { validateMotoForm } from '../utils/motoValidator';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';
import { useToast } from '../../../../components/ui/Toast';

interface MotoFormProps {
  moto: Moto | null;
  onClose: () => void;
  onSave: (data: Partial<Omit<Moto, 'id' | '_sync_status' | 'created_at'>>) => Promise<{ success: boolean; error?: string; localSaved?: boolean }>;
  loading: boolean;
}

export function MotoForm({ moto, onClose, onSave, loading }: MotoFormProps) {
  const { isOnline } = useOnlineStatus();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    motor: '',
    chasis_vin: '',
    fecha_compra: '',
    factura_documentos: '',
    factura_venta: '',
    propietario: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (moto) {
      setFormData({
        placa: moto.placa || '',
        marca: moto.marca || '',
        modelo: moto.modelo || '',
        anio: moto.anio?.toString() || '',
        color: moto.color || '',
        motor: moto.motor || '',
        chasis_vin: moto.chasis_vin || '',
        fecha_compra: moto.fecha_compra || '',
        factura_documentos: moto.factura_documentos || '',
        factura_venta: moto.factura_venta || '',
        propietario: moto.propietario || '',
      });
    }
  }, [moto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateMotoForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData = {
      ...formData,
      placa: formData.placa.toUpperCase(),
      anio: formData.anio ? parseInt(formData.anio, 10) : null,
    };

    const result = await onSave(submitData);
    if (result.success) {
      if (result.localSaved) {
        addToast('Moto guardada localmente. Se sincronizará al reconectar.', 'warning');
      } else {
        addToast('Moto guardada correctamente', 'success');
      }
      onClose();
    } else {
      addToast(result.error || 'Error al guardar', 'error');
    }
  };

  const getInputClass = (fieldName: string) => 
    `w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
      errors[fieldName] 
        ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
        : 'border-border focus:ring-1 focus:ring-primary focus:border-primary'
    }`;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-slate-800">
            {moto ? `Editar Moto: ${moto.placa}` : 'Nueva Moto'}
          </h2>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="moto-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Placa *</label>
              <input 
                type="text" 
                name="placa" 
                value={formData.placa} 
                onChange={handleChange}
                maxLength={6}
                placeholder="Ej: ABC123"
                className={`${getInputClass('placa')} uppercase`} 
              />
              {errors.placa && <span className="text-xs text-red-500 mt-1 block">{errors.placa}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Compra *</label>
              <input 
                type="date" 
                name="fecha_compra" 
                value={formData.fecha_compra} 
                onChange={handleChange}
                className={getInputClass('fecha_compra')} 
              />
              {errors.fecha_compra && <span className="text-xs text-red-500 mt-1 block">{errors.fecha_compra}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marca *</label>
              <input 
                type="text" 
                name="marca" 
                value={formData.marca} 
                onChange={handleChange}
                placeholder="Honda"
                className={getInputClass('marca')} 
              />
              {errors.marca && <span className="text-xs text-red-500 mt-1 block">{errors.marca}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modelo *</label>
              <input 
                type="text" 
                name="modelo" 
                value={formData.modelo} 
                onChange={handleChange}
                placeholder="KLS"
                className={getInputClass('modelo')} 
              />
              {errors.modelo && <span className="text-xs text-red-500 mt-1 block">{errors.modelo}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Año *</label>
              <input 
                type="number" 
                name="anio" 
                value={formData.anio} 
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear() + 1}
                placeholder="2015"
                className={getInputClass('anio')} 
              />
              {errors.anio && <span className="text-xs text-red-500 mt-1 block">{errors.anio}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color *</label>
              <input 
                type="text" 
                name="color" 
                value={formData.color} 
                onChange={handleChange}
                placeholder="Blanco"
                className={getInputClass('color')} 
              />
              {errors.color && <span className="text-xs text-red-500 mt-1 block">{errors.color}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motor *</label>
              <input 
                type="text" 
                name="motor" 
                value={formData.motor} 
                onChange={handleChange}
                placeholder="123456"
                className={getInputClass('motor')} 
              />
              {errors.motor && <span className="text-xs text-red-500 mt-1 block">{errors.motor}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chasis / VIN *</label>
              <input 
                type="text" 
                name="chasis_vin" 
                value={formData.chasis_vin} 
                onChange={handleChange}
                placeholder="123456"
                className={getInputClass('chasis_vin')} 
              />
              {errors.chasis_vin && <span className="text-xs text-red-500 mt-1 block">{errors.chasis_vin}</span>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Propietario *</label>
              <input 
                type="text" 
                name="propietario" 
                value={formData.propietario} 
                onChange={handleChange}
                placeholder="CDF Motos"
                className={getInputClass('propietario')} 
              />
              {errors.propietario && <span className="text-xs text-red-500 mt-1 block">{errors.propietario}</span>}
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
            form="moto-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Moto'}
          </button>
        </div>
      </div>
    </div>
  );
}
