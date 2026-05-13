import React, { useState, useMemo } from 'react';
import { useContratos } from './hooks/useContratos';
import { ContratosFilter } from './components/ContratosFilter';
import { ContratosTable } from './components/ContratosTable';
import { ContratoForm } from './components/ContratoForm';
import { ContratosExportModal } from './components/ContratosExportModal';
import { ExtractoContratoDialog } from './components/ExtractoContratoDialog';
import { Plus, RefreshCcw, FileSpreadsheet } from 'lucide-react';
import type { Contrato } from '../../../db/schema';
import { StatusModal } from './components/StatusModal';

export function ContratosPage() {
  const { contratos, loading, error, refresh, addContrato, updateContrato, checkContratoActivoMoto } = useContratos();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [saving, setSaving] = useState(false);
  const [extractoContratoId, setExtractoContratoId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    busqueda: '',
    estado: '',
    tipo_contrato: ''
  });

  const [modalStatus, setModalStatus] = useState<{isOpen: boolean; type: 'success'|'error'; title: string; message: string}>({
    isOpen: false, type: 'success', title: '', message: ''
  });

  const handleOpenNew = () => {
    setEditingContrato(null);
    setIsFormOpen(true);
  };

  const handleEdit = (contrato: Contrato) => {
    setEditingContrato(contrato);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContrato(null);
  };

  const handleExtracto = (contrato: Contrato) => {
    setExtractoContratoId(contrato.id);
  };

  const handleSave = async (data: Partial<Omit<Contrato, '_sync_status' | 'created_at'>> & { id?: number }) => {
    setSaving(true);
    try {
      if (editingContrato) {
        const res = await updateContrato(editingContrato.id, data);
        if (!res.success) throw new Error(res.error);
        setModalStatus({
          isOpen: true,
          type: 'success',
          title: 'Éxito',
          message: 'Contrato actualizado correctamente.'
        });
      } else {
        const res = await addContrato(data as Omit<Contrato, 'id' | '_sync_status' | 'created_at'> & { id?: number });
        if (!res.success) throw new Error(res.error);
        setModalStatus({
          isOpen: true,
          type: 'success',
          title: 'Éxito',
          message: 'Contrato creado correctamente.'
        });
      }
      handleCloseForm();
    } catch (e: any) {
      console.error('Error al guardar contrato:', e);
      setModalStatus({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: e.message || 'Error al guardar el contrato. Verifique los datos.'
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredContratos = useMemo(() => {
    return contratos.filter(c => {
      const matchBusqueda = filters.busqueda === '' || 
        c.id.toString().includes(filters.busqueda) ||
        (c.placa && c.placa.toLowerCase().includes(filters.busqueda.toLowerCase())) ||
        (c.cliente_cedula && c.cliente_cedula.includes(filters.busqueda));
      
      const matchEstado = filters.estado === '' || c.estado === filters.estado;
      const matchTipo = filters.tipo_contrato === '' || c.tipo_contrato === filters.tipo_contrato;

      return matchBusqueda && matchEstado && matchTipo;
    });
  }, [contratos, filters]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maestro de Contratos</h1>
          <p className="text-sm text-slate-500">Gestión de contratos de préstamo y motos</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={refresh}
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
            Nuevo Contrato
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <ContratosFilter filters={filters} onChange={setFilters} />
      
      <ContratosTable 
        data={filteredContratos} 
        loading={loading} 
        onEdit={handleEdit} 
        onExtracto={handleExtracto}
      />

      {isFormOpen && (
        <ContratoForm 
          contrato={editingContrato}
          onClose={handleCloseForm}
          onSave={handleSave}
          loading={saving}
          checkContratoActivoMoto={checkContratoActivoMoto}
        />
      )}

      <StatusModal 
        isOpen={modalStatus.isOpen}
        type={modalStatus.type}
        title={modalStatus.title}
        message={modalStatus.message}
        onClose={() => setModalStatus(prev => ({ ...prev, isOpen: false }))}
      />

      <ContratosExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        contratos={contratos} 
      />

      <ExtractoContratoDialog
        open={extractoContratoId !== null}
        onClose={() => setExtractoContratoId(null)}
        contratoId={extractoContratoId}
      />
    </div>
  );
}
