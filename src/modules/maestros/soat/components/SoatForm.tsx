import React, { useState, useEffect } from 'react';
import { X, Save, Wifi, WifiOff, Search } from 'lucide-react';
import type { Soat } from '../../../../db/schema';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';
import { useToast } from '../../../../components/ui/Toast';
import { db } from '../../../../db/db';

interface SoatFormProps {
  soat: Soat | null;
  onClose: () => void;
  onSave: (
    data: Partial<Omit<Soat, 'id' | '_sync_status' | 'created_at'>>
  ) => Promise<{ success: boolean; error?: string; localSaved?: boolean }>;
  loading: boolean;
}

export function SoatForm({ soat, onClose, onSave, loading }: SoatFormProps) {
  const { isOnline } = useOnlineStatus();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    moto_placa: '',
    no_soat: '',
    fecha_vencimiento: '',
  });

  const [motoSeleccionada, setMotoSeleccionada] = useState<any | null>(null);
  const [motosLoading, setMotosLoading] = useState(false);
  const [busquedaError, setBusquedaError] = useState<string | null>(null);

  const buscarMoto = async (placa: string) => {
    const placaLimpia = placa.trim().toUpperCase();
    if (!placaLimpia) return;

    setMotosLoading(true);
    setBusquedaError(null);
    try {
      const moto = await db.motos.where('placa').equalsIgnoreCase(placaLimpia).first();
      if (moto) {
        setMotoSeleccionada(moto);
        setFormData(prev => ({ ...prev, moto_placa: moto.placa }));
      } else {
        setMotoSeleccionada(null);
        setBusquedaError('No se encontró ninguna moto con esta placa.');
      }
    } catch (err) {
      console.error('Error al buscar moto:', err);
      setBusquedaError('Error al buscar la moto.');
    } finally {
      setMotosLoading(false);
    }
  };

  useEffect(() => {
    if (soat) {
      setFormData({
        moto_placa: soat.moto_placa || '',
        no_soat: soat.no_soat || '',
        fecha_vencimiento: soat.fecha_vencimiento || '',
      });
      if (soat.moto_placa) {
        buscarMoto(soat.moto_placa);
      }
    } else {
      setFormData({
        moto_placa: '',
        no_soat: '',
        fecha_vencimiento: '',
      });
      setMotoSeleccionada(null);
      setBusquedaError(null);
    }
  }, [soat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motoSeleccionada) {
      addToast('Debe buscar y verificar una placa de moto existente antes de continuar.', 'error');
      return;
    }

    const submitData = {
      ...formData,
      moto_placa: formData.moto_placa.toUpperCase(),
    };

    const result = await onSave(submitData);

    if (result.success) {
      if (result.localSaved) {
        addToast(
          'SOAT guardado localmente. Se sincronizará al reconectar.',
          'warning'
        );
      } else {
        addToast('SOAT guardado correctamente', 'success');
      }
      onClose();
    } else {
      addToast(result.error || 'Error al guardar', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-slate-800">
            {soat ? `Editar SOAT: ${soat.moto_placa}` : 'Nuevo SOAT'}
          </h2>

          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                isOnline
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
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

        {/* Form */}
        <div className="p-6">
          <form id="soat-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Placa Moto *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="moto_placa"
                  value={formData.moto_placa}
                  onChange={(e) => {
                    handleChange(e);
                    if (motoSeleccionada) setMotoSeleccionada(null);
                    if (busquedaError) setBusquedaError(null);
                  }}
                  required
                  maxLength={6}
                  placeholder="Ej. AAA123"
                  className="flex-1 min-w-0 px-3 py-2 border border-border rounded-lg uppercase focus:ring-1 focus:ring-primary focus:border-primary outline-none text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => buscarMoto(formData.moto_placa)}
                  disabled={motosLoading || !formData.moto_placa}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                >
                  <Search className="w-4 h-4" />
                  {motosLoading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {motoSeleccionada && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 space-y-1">
                  <div className="font-semibold text-green-900">Moto vinculada correctamente:</div>
                  <div><span className="font-medium">Marca:</span> {motoSeleccionada.marca || 'N/A'} - <span className="font-medium">Modelo:</span> {motoSeleccionada.modelo || 'N/A'}</div>
                  <div><span className="font-medium">Propietario:</span> {motoSeleccionada.propietario || 'N/A'}</div>
                </div>
              )}

              {busquedaError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  ⚠️ {busquedaError}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                N° de SOAT *
              </label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha Vencimiento *
              </label>
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

        {/* Footer */}
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