import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import { Login } from './modules/login/Login';
import { Dashboard } from './modules/inicio/Dashboard';
import { MotosPage } from './modules/maestros/motos/MotosPage';
import { SoatsPage } from './modules/maestros/soat/SoatsPage';
import { GpsPage } from './modules/maestros/gps/GpsPage';
import { ClientesPage } from './modules/maestros/clientes/ClientesPage';
import { ContratosPage } from './modules/maestros/contratos/ContratosPage';
import { RecaudosPage } from './modules/recaudo/RecaudosPage';
import { GastosPage } from './modules/gastos/GastosPage';
import { ControlDiarioPage } from './modules/controlDiario/ControlDiarioPage';
import { IndicadoresPage } from './modules/indicadores/IndicadoresPage';
import { GestionUsuariosPage } from './modules/gestionUsuarios/GestionUsuariosPage';
import { ConfiguracionPage } from './modules/configuracion/ConfiguracionPage';
import { MisRecaudosPage } from './modules/misRecaudos/MisRecaudosPage';

import { Sidebar } from './components/layout/Sidebar';
import { CambioEstadoContratoModal } from './components/CambioEstadoContratoModal';
import { ReporteRecaudosModal } from './components/ReporteRecaudosModal';
import { HydrateProvider } from './context/hydrate.provider';
import { SyncStatusBar } from './components/SyncStatusBar';
import { ToastProvider, ToastContainer } from './components/ui/Toast';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { BlockedDayAlert } from './components/auth/BlockedDayAlert';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function ProtectedLayout() {
  const { isAuthenticated } = useAuthContext();
  const isOnline = useOnlineStatus();
  const [openCambioEstado, setOpenCambioEstado] = useState(false);
  const [openReporteRecaudos, setOpenReporteRecaudos] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleOpenCambioEstado = () => {
    if (!isOnline) {
      alert('Esta función requiere conexión a internet');
      return;
    }
    setOpenCambioEstado(true);
  };

  const handleOpenReporteRecaudos = () => {
    if (!isOnline) {
      alert('Esta función requiere conexión a internet');
      return;
    }
    setOpenReporteRecaudos(true);
  };

  return (
    <div className="h-screen bg-background lg:flex overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar 
        onOpenCambioEstado={handleOpenCambioEstado} 
        onOpenReporteRecaudos={handleOpenReporteRecaudos}
      />

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {/* TOP BAR */}
        <div className="shrink-0">
          <SyncStatusBar />
          <BlockedDayAlert />
        </div>

        {/* CONTENIDO SCROLL */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>

      {/* MODALS */}
      <CambioEstadoContratoModal
        open={openCambioEstado}
        onClose={() => setOpenCambioEstado(false)}
      />
      <ReporteRecaudosModal
        open={openReporteRecaudos}
        onClose={() => setOpenReporteRecaudos(false)}
      />
    </div>
  );
}

function PublicLayout() {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HydrateProvider>
          <BrowserRouter>
          <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* RUTAS PROTEGIDAS */}
          <Route element={<ProtectedLayout />}>
            <Route path="/inicio" element={<Dashboard />} />
            <Route path="/maestros/motos" element={<MotosPage />} />
            <Route path="/maestros/soat" element={<SoatsPage />} />
            <Route path="/maestros/gps" element={<GpsPage />} />
            <Route path="/maestros/clientes" element={<ClientesPage />} />
            <Route path="/maestros/contratos" element={<ContratosPage />} />
            <Route path="/indicadores" element={<IndicadoresPage />} />
            <Route path="/usuarios" element={<GestionUsuariosPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            <Route path="/control-diario" element={<ControlDiarioPage />} />
            <Route path="/gastos" element={<GastosPage />} />
            <Route path="/recaudo" element={<RecaudosPage />} />
            <Route path="/mis-recaudos" element={<MisRecaudosPage />} />
          </Route>

          {/* RUTAS POR DEFECTO Y FALLBACK */}
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
        <ToastContainer />
          </BrowserRouter>
        </HydrateProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;