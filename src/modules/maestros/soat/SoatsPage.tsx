import { useState } from 'react';
import { useSoats } from './hooks/useSoats';
import { SoatsFilter } from './components/SoatsFilter';
import { SoatsTable } from './components/SoatsTable';
import { SoatForm } from './components/SoatForm';
import { SoatsExportModal } from './components/SoatsExportModal';
import { Plus, RefreshCcw, FileSpreadsheet } from 'lucide-react';
import type { Soat } from '../../../db/schema';

export function SoatsPage() {
  const { soats, loading, error, filters, setFilters, addSoat, editSoat, reload } = useSoats();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingSoat, setEditingSoat] = useState<Soat | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpenNew = () => {
    setEditingSoat(null);
    setIsFormOpen(true);
  };

  const handleEdit = (soat: Soat) => {
    setEditingSoat(soat);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSoat(null);
  };

  const handleSave = async (data: Partial<Omit<Soat, 'id' | '_sync_status' | 'created_at'>>) => {
    setSaving(true);
    try {
      if (editingSoat) {
        await editSoat(editingSoat.id, data);
      } else {
        await addSoat(data as Omit<Soat, 'id' | '_sync_status' | 'created_at'>);
      }
      handleCloseForm();
    } catch (e) {
      console.error('Error al guardar SOAT:', e);
      alert('Error al guardar el SOAT. Verifique los datos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maestro de SOATs</h1>
          <p className="text-sm text-slate-500">Gestión y control de vencimientos de SOAT por motocicleta</p>
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
            Nuevo SOAT
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <SoatsFilter filters={filters} onChange={setFilters} />
      
      <SoatsTable 
        data={soats} 
        loading={loading} 
        onEdit={handleEdit} 
      />

      {isFormOpen && (
        <SoatForm 
          soat={editingSoat}
          onClose={handleCloseForm}
          onSave={handleSave}
          loading={saving}
        />
      )}

      <SoatsExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        soats={soats} 
      />
    </div>
  );
}
