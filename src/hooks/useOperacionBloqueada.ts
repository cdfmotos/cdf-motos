import { useBlockedDay } from './useBlockedDay';
import { useToast } from '../components/ui/Toast/ToastContext';

export function useOperacionBloqueada() {
  const { canWrite, canWriteInConfiguracion } = useBlockedDay();
  const { addToast } = useToast();

  const checkBloqueo = (modulo: 'maestros' | 'operativo' | 'configuracion' = 'operativo'): boolean => {
    if (modulo === 'configuracion') {
      return canWriteInConfiguracion();
    }

    if (!canWrite()) {
      addToast('El día está cerrado. No se permiten cambios.', 'warning');
      return false;
    }

    return true;
  };

  return { checkBloqueo };
}