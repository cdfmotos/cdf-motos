import React, { useState } from 'react';
import { useConfiguracion } from './hooks/useConfiguracion';
import { HistorialEstadosTable } from './components/HistorialEstadosTable';
import { EditEstadoModal } from './components/EditEstadoModal';
import { Settings, RefreshCcw, CalendarClock } from 'lucide-react';
import type { EstadoSistema } from '../../db/schema';

export function ConfiguracionPage() {
  const { historial, loading, error, cambiarEstadoDia, syncEstado, reload } = useConfiguracion();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEstado, setEditingEstado] = useState<EstadoSistema | null>(null);

  const handleEdit = (estado: EstadoSistema) => {
    setEditingEstado(estado);
    setIsModalOpen(true);
  };

  const handleGestionarHoy = () => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const estadoHoy = historial.find(e => e.fecha === hoyStr);
    
    if (estadoHoy) {
      setEditingEstado(estadoHoy);
    } else {
      setEditingEstado(null); // Significa que creará uno nuevo
    }
    setIsModalOpen(true);
  };

  const handleSave = async (fecha: string, abierto: boolean, observacion?: string) => {
    return await cambiarEstadoDia(fecha, abierto, observacion);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h1>
            <p className="text-sm text-slate-500">Gestión de estados y cierres diarios</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={reload}
            className="flex items-center gap-2 px-3 py-2 border border-border text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            title="Recargar datos"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleGestionarHoy}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
          >
            <CalendarClock className="w-4 h-4" />
            Gestionar Hoy
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <HistorialEstadosTable 
        data={historial} 
        loading={loading} 
        onEdit={handleEdit} 
        onSync={syncEstado}
      />

      {isModalOpen && (
        <EditEstadoModal 
          estado={editingEstado}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEstado(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
