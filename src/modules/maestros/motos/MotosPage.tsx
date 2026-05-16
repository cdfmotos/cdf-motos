import { useState, useCallback } from 'react';
import { useMotos } from './hooks/useMotos';
import { MotosFilter } from './components/MotosFilter';
import { MotosTable } from './components/MotosTable';
import { MotoForm } from './components/MotoForm';
import { MotosExportModal } from './components/MotosExportModal';
import { ExtractoMotoDialog } from './components/ExtractoMotoDialog';
import { Plus, RefreshCcw, FileSpreadsheet } from 'lucide-react';
import { syncEngine } from '../../../db/sync/syncEngine';
import { useBlockedDay } from '../../../hooks/useBlockedDay';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import type { Moto } from '../../../db/schema';

export function MotosPage() {
  const { motos, loading, error, filters, setFilters, addMoto, editMoto, removeMoto, reload } = useMotos();
  const { isAdmin } = useAuthContext();
  const { canWrite } = useBlockedDay();
  const { addToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingMoto, setEditingMoto] = useState<Moto | null>(null);
  const [saving, setSaving] = useState(false);
  const [extractoMotoPlaca, setExtractoMotoPlaca] = useState<string | null>(null);

  const handleSync = useCallback(async (moto: Moto) => {
    const pk = moto._local_id ?? String(moto.id);
    return await syncEngine.sincronizarItem('motos', pk);
  }, []);

  const handleOpenNew = () => {
    if (!canWrite()) {
      addToast('El día está cerrado. No se permiten nuevos registros.', 'warning');
      return;
    }
    setEditingMoto(null);
    setIsFormOpen(true);
  };

  const handleEdit = (moto: Moto) => {
    if (!isAdmin || !canWrite()) {
      addToast('El día está cerrado o no tienes permisos para editar.', 'warning');
      return;
    }
    setEditingMoto(moto);
    setIsFormOpen(true);
  };

  const handleDelete = async (moto: Moto) => {
    if (!isAdmin || !canWrite()) {
      addToast('No tienes permisos para eliminar.', 'warning');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar la moto con placa ${moto.placa}?`)) {
      await removeMoto(moto.id);
    }
  };

  const handleExtracto = (moto: Moto) => {
    setExtractoMotoPlaca(moto.placa);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMoto(null);
  };

  const handleSave = async (data: Partial<Omit<Moto, 'id' | '_sync_status' | 'created_at'>>) => {
    setSaving(true);
    try {
      if (editingMoto) {
        const result = await editMoto(editingMoto.id, data);
        return result;
      } else {
        const result = await addMoto(data as Omit<Moto, 'id' | '_sync_status' | 'created_at'>);
        return result;
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maestro de Motos</h1>
          <p className="text-sm text-slate-500">Gestión del parque automotor y sus detalles</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={reload}
            className="flex items-center gap-2 px-3 py-2 border border-border text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            title="Recargar datos"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-border text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button 
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Moto
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <MotosFilter filters={filters} onChange={setFilters} />
      
      <MotosTable
        data={motos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExtracto={handleExtracto}
        onSync={handleSync}
        canEdit={isAdmin && canWrite()}
      />

      {isFormOpen && (
        <MotoForm 
          moto={editingMoto}
          onClose={handleCloseForm}
          onSave={handleSave}
          loading={saving}
        />
      )}

      <MotosExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        motos={motos} 
      />

      <ExtractoMotoDialog
        open={extractoMotoPlaca !== null}
        onClose={() => setExtractoMotoPlaca(null)}
        placa={extractoMotoPlaca}
      />
    </div>
  );
}