import React, { useState, useEffect } from 'react';
import { X, Search, Wifi, WifiOff } from 'lucide-react';
import type { Contrato, Cliente, Moto } from '../../../../db/schema';
import { db } from '../../../../db/db';
import { StatusModal } from './StatusModal';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';
import { useToast } from '../../../../components/ui/Toast/ToastContext';

interface ContratoFormProps {
  contrato: Contrato | null;
  onClose: () => void;
  onSave: (data: Partial<Contrato> & { id?: number }) => Promise<void>;
  loading: boolean;
  checkContratoActivoMoto: (placa: string) => Promise<boolean>;
}

export function ContratoForm({ contrato, onClose, onSave, loading, checkContratoActivoMoto }: ContratoFormProps) {
  const { isOnline } = useOnlineStatus();
  const { addToast } = useToast();
  const [formData, setFormData] = useState<Partial<Contrato>>({
    tipo_contrato: 'Prestamo',
    cliente_cedula: '',
    valor_contrato: 0,
    cuota_diaria: 0,
    fecha_inicio: new Date().toISOString().split('T')[0],
    estado: 'Activo',
    placa: '',
    ...contrato
  });

  const [clienteBusqueda, setClienteBusqueda] = useState(contrato?.cliente_cedula || '');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clientesLoading, setClientesLoading] = useState(false);

  const [motoBusqueda, setMotoBusqueda] = useState(contrato?.placa || '');
  const [motoSeleccionada, setMotoSeleccionada] = useState<Moto | null>(null);
  const [motosLoading, setMotosLoading] = useState(false);

  const [modalStatus, setModalStatus] = useState<{isOpen: boolean; type: 'success'|'error'; title: string; message: string}>({
    isOpen: false, type: 'error', title: '', message: ''
  });

  useEffect(() => {
    if (contrato?.cliente_cedula) buscarCliente(contrato.cliente_cedula);
    if (contrato?.placa) buscarMoto(contrato.placa);
  }, [contrato]);

  const buscarCliente = async (cedula: string) => {
    if (!cedula) return;
    setClientesLoading(true);
    try {
      const cliente = await db.clientes.where('cedula').equalsIgnoreCase(cedula).first();
      setClienteSeleccionado(cliente || null);
      if (cliente) {
        setFormData(prev => ({ ...prev, cliente_cedula: cliente.cedula }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClientesLoading(false);
    }
  };

  const buscarMoto = async (placa: string) => {
    if (!placa) return;
    setMotosLoading(true);
    try {
      const moto = await db.motos.where('placa').equalsIgnoreCase(placa).first();
      setMotoSeleccionada(moto || null);
      if (moto) {
        setFormData(prev => ({ ...prev, placa: moto.placa }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMotosLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      addToast('Sin conexión - el contrato se guardará localmente', 'warning');
    }

    if (formData.tipo_contrato === 'Moto' && formData.placa) {
      // Validate active contract
      const isActivo = await checkContratoActivoMoto(formData.placa);
      // If it's a new contract or editing but changing placa and it's active
      if (isActivo && (!contrato || contrato.placa !== formData.placa)) {
        setModalStatus({
          isOpen: true,
          type: 'error',
          title: 'Error de validación',
          message: 'Ya existe un contrato activo para esta placa.'
        });
        return;
      }
    }

    if (!formData.cliente_cedula) {
      setModalStatus({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Debe seleccionar un cliente válido.'
      });
      return;
    }

    await onSave(formData);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-800">
                {contrato ? 'Editar Contrato' : 'Nuevo Contrato'}
              </h2>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <form id="contrato-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Información Básica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contrato && (
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      N° Contrato (ID)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.id || ''}
                      onChange={e => setFormData({ ...formData, id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Contrato
                  </label>
                  <select
                    required
                    value={formData.tipo_contrato}
                    onChange={e => setFormData({ ...formData, tipo_contrato: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                  >
                    <option value="Prestamo">Prestamo</option>
                    <option value="Moto">Moto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    required
                    value={formData.estado || ''}
                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Bodega">Bodega</option>
                    <option value="Fiscalia">Fiscalia</option>
                    <option value="Liquidado">Liquidado</option>
                    <option value="ParaDenuncio">ParaDenuncio</option>
                    <option value="Robada">Robada</option>
                    <option value="Termino">Termino</option>
                  </select>
                </div>
              </div>

              {/* Búsqueda Cliente */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">Información del Cliente</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Cédula del cliente..."
                      value={clienteBusqueda}
                      onChange={e => setClienteBusqueda(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => buscarCliente(clienteBusqueda)}
                    disabled={clientesLoading}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Buscar
                  </button>
                </div>

                {clienteSeleccionado && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <span className="text-slate-500 block">Nombres y Apellidos</span>
                      <span className="font-medium text-slate-800">{clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Celular</span>
                      <span className="font-medium text-slate-800">{clienteSeleccionado.celular || '-'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Dirección</span>
                      <span className="font-medium text-slate-800">{clienteSeleccionado.direccion_residencia || '-'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Información Financiera */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Valor Contrato
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.valor_contrato || ''}
                    onChange={e => setFormData({ ...formData, valor_contrato: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cuota Diaria
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.cuota_diaria || ''}
                    onChange={e => setFormData({ ...formData, cuota_diaria: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio || ''}
                    onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Búsqueda Moto (solo si es tipo Moto) */}
              {formData.tipo_contrato === 'Moto' && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200 mt-6">
                  <h3 className="text-sm font-semibold text-slate-800">Información de la Moto</h3>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Placa de la moto..."
                        value={motoBusqueda}
                        onChange={e => setMotoBusqueda(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => buscarMoto(motoBusqueda)}
                      disabled={motosLoading}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Buscar
                    </button>
                  </div>

                  {motoSeleccionada && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <span className="text-slate-500 block">Motor</span>
                        <span className="font-medium text-slate-800">{motoSeleccionada.motor || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Chasis / VIN</span>
                        <span className="font-medium text-slate-800">{motoSeleccionada.chasis_vin || '-'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="contrato-form"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (contrato ? 'Actualizar' : 'Crear Contrato')}
            </button>
          </div>
        </div>
      </div>
      
      <StatusModal 
        isOpen={modalStatus.isOpen}
        type={modalStatus.type}
        title={modalStatus.title}
        message={modalStatus.message}
        onClose={() => setModalStatus(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
