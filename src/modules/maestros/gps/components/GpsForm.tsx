import React, { useState, useEffect } from 'react';
import { X, Save, Wifi, WifiOff } from 'lucide-react';
import type { GPS } from '../../../../db/schema';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';
import { useToast } from '../../../../components/ui/Toast';

interface GpsFormProps {
  gps: GPS | null;
  onClose: () => void;
  onSave: (
    data: Partial<Omit<GPS, 'id' | '_sync_status' | 'created_at'>>
  ) => Promise<{ success: boolean; error?: string; localSaved?: boolean }>;
  loading: boolean;
}

export function GpsForm({ gps, onClose, onSave, loading }: GpsFormProps) {
  const { isOnline } = useOnlineStatus();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    moto_placa: '',
    gps_imei: '',
    simcard: '',
  });

  useEffect(() => {
    if (gps) {
      setFormData({
        moto_placa: gps.moto_placa || '',
        gps_imei: gps.gps_imei || '',
        simcard: gps.simcard || '',
      });
    } else {
      setFormData({
        moto_placa: '',
        gps_imei: '',
        simcard: '',
      });
    }
  }, [gps]);

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

    const result = await onSave(submitData);

    if (result.success) {
      addToast(
        result.localSaved
          ? 'GPS guardado localmente. Se sincronizará al reconectar.'
          : 'GPS guardado correctamente',
        result.localSaved ? 'warning' : 'success'
      );
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
            {gps ? `Editar GPS: ${gps.moto_placa}` : 'Nuevo Dispositivo GPS'}
          </h2>

          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form id="gps-form" onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Placa Moto *
              </label>
              <input
                type="text"
                name="moto_placa"
                value={formData.moto_placa}
                onChange={handleChange}
                required
                maxLength={6}
                className="w-full px-3 py-2 border border-border rounded-lg uppercase focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                IMEI del GPS *
              </label>
              <input
                type="text"
                name="gps_imei"
                value={formData.gps_imei}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Simcard
              </label>
              <input
                type="text"
                name="simcard"
                value={formData.simcard}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border text-slate-700 bg-white rounded-lg hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="gps-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar GPS'}
          </button>
        </div>

      </div>
    </div>
  );
}