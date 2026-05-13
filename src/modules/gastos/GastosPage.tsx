import React, { useState } from 'react';
import { useGastos } from './hooks/useGastos';
import { GastosFilter } from './components/GastosFilter';
import { GastosTable } from './components/GastosTable';
import { GastoForm } from './components/GastoForm';
import { Plus, RefreshCcw } from 'lucide-react';
import type { Gasto } from '../../db/schema';

export function GastosPage() {
  const { gastos, loading, error, filters, setFilters, addGasto, editGasto, removeGasto, syncGasto, reload } = useGastos();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpenNew = () => {
    setEditingGasto(null);
    setIsFormOpen(true);
  };

  const handleEdit = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGasto(null);
  };

  const handleDelete = async (gasto: Gasto) => {
    if (window.confirm(`¿Estás seguro de eliminar el gasto por ${gasto.concepto}?`)) {
      await removeGasto(gasto.id);
    }
  };

  const handleSave = async (data: Partial<Omit<Gasto, 'id' | '_sync_status' | 'created_at'>>) => {
    setSaving(true);
    try {
      if (editingGasto) {
        await editGasto(editingGasto.id, data);
      } else {
        await addGasto(data as Omit<Gasto, 'id' | '_sync_status' | 'created_at'>);
      }
      handleCloseForm();
    } catch (e) {
      console.error('Error al guardar gasto:', e);
      alert('Error al guardar el gasto. Verifique los datos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maestro de Gastos</h1>
          <p className="text-sm text-slate-500">Gestión de gastos operativos</p>
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
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Gasto
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <GastosFilter filters={filters} onChange={setFilters} />
      
      <GastosTable 
        data={gastos} 
        loading={loading} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onSync={syncGasto}
      />

      {isFormOpen && (
        <GastoForm 
          gasto={editingGasto}
          onClose={handleCloseForm}
          onSave={handleSave}
          loading={saving}
        />
      )}
    </div>
  );
}
