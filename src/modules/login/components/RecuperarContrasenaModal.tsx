import { useState } from 'react';
import { X, Mail, ArrowRight, UserPlus } from 'lucide-react';
import { recuperarContrasena } from '../services/authService';

interface RecuperarContrasenaModalProps {
  open: boolean;
  onClose: () => void;
  onOpenRegistro: () => void;
}

export function RecuperarContrasenaModal({ open, onClose, onOpenRegistro }: RecuperarContrasenaModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const result = await recuperarContrasena(email);

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  };

  const handleClose = () => {
    setEmail('');
    setStatus('idle');
    setMessage('');
    onClose();
  };

  const handleOpenRegistro = () => {
    handleClose();
    onOpenRegistro();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Recuperar Contraseña</h2>
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
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <p className="text-slate-700 font-medium mb-2">{message}</p>
              <p className="text-sm text-slate-500">Revisa tu bandeja de entrada y sigue las instrucciones.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-slate-50 text-sm outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg font-medium text-sm transition-colors ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                >
                  {status === 'loading' ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Enviar enlace de recuperación
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleOpenRegistro}
                  className="flex items-center gap-1.5 mx-auto text-sm text-slate-500 hover:text-primary transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  ¿No tienes cuenta? Regístrate
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