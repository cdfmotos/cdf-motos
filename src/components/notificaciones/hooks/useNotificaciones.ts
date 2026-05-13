import { useState, useEffect, useCallback } from 'react';
import { getNotificacionesUsuario, marcarNotificacionLeida, type NotificacionConEstado } from '../services/notificacionesService';
import { useAuth } from '../../../modules/login/hooks/useAuth';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<NotificacionConEstado[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isOnline = useOnlineStatus();

  const loadNotificaciones = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getNotificacionesUsuario(user.id, isOnline);
      setNotificaciones(data);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isOnline]);

  useEffect(() => {
    loadNotificaciones();
  }, [loadNotificaciones]);

  const unreadCount = notificaciones.filter(n => n.estado_lectura !== 'leida').length;

  const markAsRead = async (id: number) => {
    // Optimistic UI update
    setNotificaciones(prev => prev.map(n => 
      n.usuario_notificacion_id === id ? { ...n, estado_lectura: 'leida' } : n
    ));
    await marcarNotificacionLeida(id, isOnline);
  };

  const markAllAsRead = async () => {
    const unread = notificaciones.filter(n => n.estado_lectura !== 'leida');
    // Optimistic
    setNotificaciones(prev => prev.map(n => ({ ...n, estado_lectura: 'leida' })));
    
    for (const noti of unread) {
      if (noti.usuario_notificacion_id) {
        await marcarNotificacionLeida(noti.usuario_notificacion_id, isOnline);
      }
    }
  };

  return {
    notificaciones,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    reload: loadNotificaciones
  };
}
