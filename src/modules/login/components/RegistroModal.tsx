import { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, CreditCard, ArrowRight, LogIn } from 'lucide-react';
import { registrarUsuario } from '../services/authService';

interface RegistroModalProps {
  open: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export function RegistroModal({ open, onClose, onOpenLogin }: RegistroModalProps) {
  const [form, setForm] = useState({ nombre_completo: '', cedula: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nombre_completo.trim()) newErrors.nombre_completo = 'El nombre es obligatorio';
    if (!/^[0-9]{6,12}$/.test(form.cedula.trim())) newErrors.cedula = 'La cédula debe tener entre 6 y 12 dígitos numéricos';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = 'Correo electrónico inválido';
    if (form.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    return newErrors;
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('loading');
    setMessage('');

    const result = await registrarUsuario({
      nombre_completo: form.nombre_completo.trim(),
      cedula: form.cedula.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  };

  const handleClose = () => {
    setForm({ nombre_completo: '', cedula: '', email: '', password: '', confirmPassword: '' });
    setStatus('idle');
    setMessage('');
    setErrors({});
    onClose();
  };

  const handleOpenLogin = () => {
    handleClose();
    onOpenLogin();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Crear Cuenta</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <User className="w-8 h-8" />
              </div>
              <p className="text-slate-700 font-semibold text-lg mb-2">{message}</p>
              <p className="text-sm text-slate-500">Tu cuenta será activada una vez el administrador revise tu solicitud.</p>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={form.nombre_completo}
                      onChange={(e) => handleChange('nombre_completo', e.target.value)}
                      placeholder="Juan Pérez"
                      required
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50 text-sm outline-none transition-colors ${errors.nombre_completo ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'}`}
                    />
                  </div>
                  {errors.nombre_completo && <span className="text-xs text-red-500 mt-1 block">{errors.nombre_completo}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cédula</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={form.cedula}
                      onChange={(e) => handleChange('cedula', e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="12345678"
                      required
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50 text-sm outline-none transition-colors ${errors.cedula ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'}`}
                    />
                  </div>
                  {errors.cedula && <span className="text-xs text-red-500 mt-1 block">{errors.cedula}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="tu@correo.com"
                      required
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50 text-sm outline-none transition-colors ${errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'}`}
                    />
                  </div>
                  {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-slate-50 text-sm outline-none transition-colors ${errors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Repite tu contraseña"
                      required
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50 text-sm outline-none transition-colors ${errors.confirmPassword ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'}`}
                    />
                  </div>
                  {errors.confirmPassword && <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword}</span>}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg font-medium text-sm transition-colors ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                >
                  {status === 'loading' ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Crear Cuenta
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleOpenLogin}
                  className="flex items-center gap-1.5 mx-auto text-sm text-slate-500 hover:text-primary transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end">
          {status === 'success' ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Cerrar
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-border text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}