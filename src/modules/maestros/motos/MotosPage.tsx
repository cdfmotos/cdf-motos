import { useState } from 'react';
import { useMotos } from './hooks/useMotos';
import { MotosFilter } from './components/MotosFilter';
import { MotosTable } from './components/MotosTable';
import { MotoForm } from './components/MotoForm';
import { MotosExportModal } from './components/MotosExportModal';
import { ExtractoMotoDialog } from './components/ExtractoMotoDialog';
import { Plus, RefreshCcw, FileSpreadsheet } from 'lucide-react';
import type { Moto } from '../../../db/schema';

export function MotosPage() {
  const { motos, loading, error, filters, setFilters, addMoto, editMoto, removeMoto, syncMoto, reload } = useMotos();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingMoto, setEditingMoto] = useState<Moto | null>(null);
  const [saving, setSaving] = useState(false);
  const [extractoMotoPlaca, setExtractoMotoPlaca] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingMoto(null);
    setIsFormOpen(true);
  };

  const handleEdit = (moto: Moto) => {
    setEditingMoto(moto);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMoto(null);
  };

  const handleDelete = async (moto: Moto) => {
    if (window.confirm(`¿Estás seguro de eliminar la moto con placa ${moto.placa}?`)) {
      await removeMoto(moto.id);
    }
  };

  const handleExtracto = (moto: Moto) => {
    setExtractoMotoPlaca(moto.placa);
  };

  const handleSave = async (data: Partial<Omit<Moto, 'id' | '_sync_status' | 'created_at'>>) => {
    setSaving(true);
    try {
      if (editingMoto) {
        await editMoto(editingMoto.id, data);
      } else {
        await addMoto(data as Omit<Moto, 'id' | '_sync_status' | 'created_at'>);
      }
      handleCloseForm();
    } catch (e) {
      console.error('Error al guardar moto:', e);
      alert('Error al guardar la moto. Verifique los datos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maestro de Motos</h1>
          <p className="text-sm text-slate-500">Gestión del parque automotor y sus detalles</p>
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
        onSync={syncMoto}
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
