import  { useState } from 'react';
import { useClientes } from './hooks/useClientes';
import { ClientesFilter } from './components/ClientesFilter';
import { ClientesTable } from './components/ClientesTable';
import { ClienteForm } from './components/ClienteForm';
import { ClientesExportModal } from './components/ClientesExportModal';
import { Plus, RefreshCcw, FileSpreadsheet } from 'lucide-react';
import type { Cliente } from '../../../db/schema';

export function ClientesPage() {
  const { clientes, loading, error, filters, setFilters, addCliente, editCliente, reload } = useClientes();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpenNew = () => {
    setEditingCliente(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCliente(null);
  };

  const handleSave = async (data: Partial<Omit<Cliente, 'id' | '_sync_status' | 'created_at'>>) => {
    setSaving(true);
    try {
      if (editingCliente) {
        await editCliente(editingCliente.id, data);
      } else {
        await addCliente(data as Omit<Cliente, 'id' | '_sync_status' | 'created_at'>);
      }
      handleCloseForm();
    } catch (e) {
      console.error('Error al guardar cliente:', e);
      alert('Error al guardar el cliente. Verifique los datos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maestro de Clientes</h1>
          <p className="text-sm text-slate-500">Gestión de base de datos de clientes y propietarios</p>
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
            Nuevo Cliente
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <ClientesFilter filters={filters} onChange={setFilters} />
      
      <ClientesTable 
        data={clientes} 
        loading={loading} 
        onEdit={handleEdit} 
      />

      {isFormOpen && (
        <ClienteForm 
          cliente={editingCliente}
          onClose={handleCloseForm}
          onSave={handleSave}
          loading={saving}
        />
      )}

      <ClientesExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        clientes={clientes} 
      />
    </div>
  );
}
