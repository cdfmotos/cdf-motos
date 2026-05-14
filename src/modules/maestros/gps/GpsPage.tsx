import { useState } from 'react';
import { useGps } from './hooks/useGps';
import { GpsFilter } from './components/GpsFilter';
import { GpsTable } from './components/GpsTable';
import { GpsForm } from './components/GpsForm';
import { GpsExportModal } from './components/GpsExportModal';
import { Plus, RefreshCcw, FileSpreadsheet } from 'lucide-react';
import type { GPS } from '../../../db/schema';

export function GpsPage() {
  const { gpsList, loading, error, filters, setFilters, addGps, editGps, reload } = useGps();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingGps, setEditingGps] = useState<GPS | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpenNew = () => {
    setEditingGps(null);
    setIsFormOpen(true);
  };

  const handleEdit = (gps: GPS) => {
    setEditingGps(gps);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGps(null);
  };

  const handleSave = async (data: Partial<Omit<GPS, 'id' | '_sync_status' | 'created_at'>>) => {
    setSaving(true);
    try {
      if (editingGps) {
        await editGps(editingGps.id, data);
      } else {
        await addGps(data as Omit<GPS, 'id' | '_sync_status' | 'created_at'>);
      }
      handleCloseForm();
    } catch (e) {
      console.error('Error al guardar GPS:', e);
      alert('Error al guardar el GPS. Verifique los datos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maestro de GPS</h1>
          <p className="text-sm text-slate-500">Gestión de dispositivos de rastreo asociados a motocicletas</p>
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
            Nuevo GPS
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <GpsFilter filters={filters} onChange={setFilters} />
      
      <GpsTable 
        data={gpsList} 
        loading={loading} 
        onEdit={handleEdit} 
      />

      {isFormOpen && (
        <GpsForm 
          gps={editingGps}
          onClose={handleCloseForm}
          onSave={handleSave}
          loading={saving}
        />
      )}

      <GpsExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        gpsList={gpsList} 
      />
    </div>
  );
}
