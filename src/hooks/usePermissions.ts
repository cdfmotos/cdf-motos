import { useAuthContext, type UserRole } from '../contexts/AuthContext';

const MODULE_ACCESS: Record<UserRole, string[]> = {
  Admin: ['/inicio', '/maestros', '/maestros/clientes', '/maestros/contratos', '/maestros/motos', '/maestros/gps', '/maestros/soat', '/control-diario', '/recaudo', '/mis-recaudos', '/gastos', '/indicadores', '/usuarios', '/configuracion', '/generar-reportes'],
  Cajero: ['/inicio', '/maestros', '/maestros/clientes', '/maestros/contratos', '/maestros/motos', '/maestros/gps', '/maestros/soat', '/control-diario', '/recaudo', '/mis-recaudos', '/gastos', '/indicadores', '/configuracion', '/generar-reportes'],
  Socio: ['/inicio', '/indicadores'],
};

export function usePermissions() {
  const { rol, isAdmin, isCajero, isSocio } = useAuthContext();

  const canAccess = (path: string): boolean => {
    if (!rol) return false;
    return MODULE_ACCESS[rol]?.some(p => path.startsWith(p)) ?? false;
  };

  const canEditMaestros = (): boolean => isAdmin;

  const canCreate = (): boolean => isAdmin || isCajero;

  const canDelete = (): boolean => isAdmin;

  const canManageUsers = (): boolean => isAdmin;

  const canGenerateReports = (): boolean => isAdmin || isCajero;

  const canAccessConfiguracion = (): boolean => isAdmin || isCajero;

  return {
    rol,
    isAdmin,
    isCajero,
    isSocio,
    canAccess,
    canEditMaestros,
    canCreate,
    canDelete,
    canManageUsers,
    canGenerateReports,
    canAccessConfiguracion,
  };
}