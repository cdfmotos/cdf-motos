import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NotificacionesModal } from '../notificaciones/NotificacionesModal';
import { PerfilModal } from '../perfil/PerfilModal';
import { useNotificaciones } from '../notificaciones/hooks/useNotificaciones';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
    Home,
    Database,
    Wallet,
    CreditCard,
    Receipt,
    LineChart,
    FileText,
    Users,
    Bell,
    Settings,
    LogOut,
    ChevronDown,
    Menu,
    X,
    MapPin,
    ShieldCheck,
    Bike,
    Activity,
    UserCircle
} from 'lucide-react';

interface NavItem {
    title: string;
    path?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    children?: {
        title: string;
        path?: string;
        icon: React.ReactNode;
        onClick?: () => void;
    }[];
}

interface SidebarProps {
    onOpenCambioEstado?: () => void;
    onOpenReporteRecaudos?: () => void;
}

export function Sidebar({ onOpenCambioEstado, onOpenReporteRecaudos }: SidebarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isNotificacionesOpen, setNotificacionesOpen] = useState(false);
    const [isPerfilOpen, setPerfilOpen] = useState(false);
    const isOnline = useOnlineStatus();
    const { unreadCount } = useNotificaciones();

    const toggleDropdown = (title: string) => {
        setOpenDropdown(openDropdown === title ? null : title);
    };

    const handleOpenPerfil = () => {
        if (!isOnline) {
            alert('Esta función requiere conexión a internet');
            return;
        }
        setPerfilOpen(true);
    };

    const NAV_ITEMS: NavItem[] = [
        { title: 'Inicio', path: '/inicio', icon: <Home className="w-5 h-5" /> },
        {
            title: 'Maestros',
            icon: <Database className="w-5 h-5" />,
            children: [
                { title: 'Maestro Motos', path: '/maestros/motos', icon: <Bike className="w-4 h-4" /> },
                { title: 'Maestro SOAT', path: '/maestros/soat', icon: <ShieldCheck className="w-4 h-4" /> },
                { title: 'Maestro GPS', path: '/maestros/gps', icon: <MapPin className="w-4 h-4" /> },
                { title: 'Maestro Clientes', path: '/maestros/clientes', icon: <Users className="w-4 h-4" /> },
                { title: 'Maestro Contratos', path: '/maestros/contratos', icon: <FileText className="w-4 h-4" /> },
            ]
        },
        { title: 'Control Diario', path: '/control-diario', icon: <Activity className="w-5 h-5" /> },
        { title: 'Recaudos', path: '/recaudo', icon: <Wallet className="w-5 h-5" /> },
        { title: 'Mis Recaudos', path: '/mis-recaudos', icon: <CreditCard className="w-5 h-5" /> },
        { title: 'Gastos', path: '/gastos', icon: <Receipt className="w-5 h-5" /> },
        { title: 'Indicadores', path: '/indicadores', icon: <LineChart className="w-5 h-5" /> },
        {
            title: 'Generar Reporte',
            icon: <FileText className="w-5 h-5" />,
            children: [
                { title: 'Reporte de Contrato', onClick: onOpenCambioEstado, icon: <FileText className="w-4 h-4" /> },
                { title: 'Reporte de Recaudos', onClick: onOpenReporteRecaudos, icon: <FileText className="w-4 h-4" /> },
            ]
        },
        { title: 'Gestión de Usuarios', path: '/usuarios', icon: <Users className="w-5 h-5" /> },
    ];

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="lg:hidden bg-primary text-white shadow-md flex items-center justify-between p-4 sticky top-0 z-50">
                <div className="flex items-center">
                    <img src="/logocdfmotos.webp" alt="CDF Motos" className="h-8 w-auto bg-white rounded p-1 mr-2 object-contain" />
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-md hover:bg-white/10 transition-colors"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar overlay for mobile */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-primary text-white shadow-xl flex flex-col h-screen
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

                {/* Logo Area */}
                <div className="p-6 hidden lg:flex flex-col items-center justify-center border-b border-white/10">
                    <img src="/logocdfmotos.webp" alt="CDF Motos" className="h-20 w-auto bg-white rounded-lg p-2 mb-3 shadow-sm object-contain" />
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
                    {NAV_ITEMS.map((item) => (
                        <div key={item.title}>
                            {item.children ? (
                                <>
                                    <button
                                        onClick={() => toggleDropdown(item.title)}
                                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${openDropdown === item.title ? 'bg-white/10' : 'hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center">
                                            {item.icon}
                                            <span className="ml-3">{item.title}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.title ? 'rotate-180' : ''}`} />
                                    </button>
                                    {/* Dropdown Items */}
                                    <div
                                        className={`overflow-hidden transition-all duration-200 ease-in-out ${openDropdown === item.title ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="pl-11 pr-2 py-1 space-y-1">
                                            {item.children.map(child => (
                                                child.onClick ? (
                                                    <button
                                                        key={child.title}
                                                        onClick={() => { child.onClick?.(); setMobileMenuOpen(false); }}
                                                        className="flex items-center w-full px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                                    >
                                                        {child.icon}
                                                        <span className="ml-2">{child.title}</span>
                                                    </button>
                                                ) : (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path!}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className={({ isActive }) =>
                                                            `flex items-center px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                                ? 'bg-white/20 font-medium text-white'
                                                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                                                            }`
                                                        }
                                                    >
                                                        {child.icon}
                                                        <span className="ml-2">{child.title}</span>
                                                    </NavLink>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <NavLink
                                    to={item.path!}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.title}</span>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Area (User & Settings) */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <button 
                            onClick={() => setNotificacionesOpen(true)}
                            className="p-2 rounded-full hover:bg-white/10 relative transition-colors" 
                            title="Notificaciones"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-primary"></span>
                            )}
                        </button>
                        <button 
                            onClick={handleOpenPerfil}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors" 
                            title="Mi Perfil"
                        >
                            <UserCircle className="w-5 h-5" />
                        </button>
                        <NavLink to="/configuracion" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Configuración">
                            <Settings className="w-5 h-5" />
                        </NavLink>
                    </div>

                    <button className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-red-500/20 text-red-200 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="ml-3">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
            {/* Notificaciones Modal */}
            <NotificacionesModal 
                open={isNotificacionesOpen} 
                onClose={() => setNotificacionesOpen(false)} 
            />
            <PerfilModal 
                open={isPerfilOpen} 
                onClose={() => setPerfilOpen(false)} 
            />
        </>
    );
}
