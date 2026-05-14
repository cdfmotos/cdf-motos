import { useState } from 'react';
import { Bell, X, Check, FileText, AlertCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNotificaciones } from './hooks/useNotificaciones';
import { formatDate } from '../../utils/formatters';

interface NotificacionesModalProps {
  open: boolean;
  onClose: () => void;
}

export function NotificacionesModal({ open, onClose }: NotificacionesModalProps) {
  const { notificaciones, loading, markAsRead, markAllAsRead, unreadCount } = useNotificaciones();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!open) return null;

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'contrato': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'alerta': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const totalPages = Math.ceil(notificaciones.length / itemsPerPage);
  const currentNotificaciones = notificaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-end">
      {/* Backdrop para cerrar clickeando afuera */}
      <div className="absolute inset-0 z-[-1]" onClick={onClose} />
      
      {/* Panel lateral */}
      <div className="relative w-full max-w-sm h-full bg-card shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Notificaciones</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones Rápidas */}
        {unreadCount > 0 && (
          <div className="px-5 py-3 border-b border-border bg-white flex justify-end">
            <button 
              onClick={markAllAsRead}
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Lista de Notificaciones */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-2 space-y-2">
          {loading && notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Cargando...</p>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <Bell className="w-12 h-12 opacity-20" />
              <p className="text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            currentNotificaciones.map((noti) => (
              <div 
                key={noti.usuario_notificacion_id}
                onClick={() => {
                  if (noti.estado_lectura !== 'leida' && noti.usuario_notificacion_id) {
                    markAsRead(noti.usuario_notificacion_id);
                  }
                }}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                  noti.estado_lectura === 'leida' 
                    ? 'bg-white border-border opacity-70 hover:opacity-100' 
                    : 'bg-blue-50/50 border-blue-100 shadow-sm'
                }`}
              >
                {noti.estado_lectura !== 'leida' && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
                )}
                
                <div className="flex gap-3">
                  <div className="shrink-0 mt-1">
                    {getIcon(noti.tipo)}
                  </div>
                  <div className="flex-1 pr-4">
                    <p className={`text-sm ${noti.estado_lectura !== 'leida' ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                      {noti.mensaje}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-slate-400 capitalize">
                        {noti.tipo}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">
                        {formatDate(noti.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        {!loading && notificaciones.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-slate-50">
            <span className="text-xs text-slate-500 font-medium">
              Pág {currentPage} de {totalPages || 1}
            </span>
            <div className="flex gap-1">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-border bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
