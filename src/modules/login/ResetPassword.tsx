import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'loading' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      // Give Supabase a moment to parse the URL hash and set the session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        if (isMounted) setStatus('valid');
      } else {
        // Subscribe to auth state changes to catch session setup
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isMounted) return;
          if (session && (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY')) {
            setStatus('valid');
          }
        });

        // Set a timeout to check if we still don't have a session
        const timeout = setTimeout(async () => {
          if (!isMounted) return;
          const { data: { session: finalSession } } = await supabase.auth.getSession();
          if (!finalSession) {
            setStatus('invalid');
            setMessage('El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.');
          }
        }, 2000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timeout);
        };
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setStatus('error');
      setMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      // 1. Update password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setStatus('error');
        setMessage(error.message || 'No se pudo actualizar la contraseña.');
        return;
      }

      // 2. Mark requests as used in database
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { error: dbError } = await supabase
          .from('password_reset_requests')
          .update({
            usado: true,
            fecha_uso: new Date().toISOString()
          })
          .eq('uid', session.user.id)
          .eq('usado', false);

        if (dbError) {
          console.error('Error al marcar la solicitud de contraseña como usada:', dbError);
        }
      }

      // 3. Sign out the user
      await supabase.auth.signOut();

      setStatus('success');
      
      // Auto redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (err) {
      console.error('Error in ResetPassword flow:', err);
      setStatus('error');
      setMessage('Ocurrió un error inesperado al restablecer la contraseña.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card shadow-lg rounded-2xl p-8 border border-border">
          <div className="flex flex-col items-center mb-6">
            <img 
              src="/logocdfmotos.webp" 
              alt="Logo CDF Motos" 
              className="h-28 w-auto mb-6 object-contain"
            />
            <h1 className="text-2xl font-bold text-slate-800 text-center">
              Restablecer Contraseña
            </h1>
            <p className="text-sm text-slate-500 text-center mt-2">
              Ingresa tu nueva contraseña para acceder a la gestión de CDF Motos
            </p>
          </div>

          {status === 'checking' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin text-primary text-3xl font-bold">⟳</div>
              <p className="text-sm text-slate-500">Verificando enlace de recuperación...</p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-medium text-sm">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Volver al Inicio de Sesión
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-semibold text-base">¡Contraseña restablecida!</p>
              <p className="text-slate-500 text-sm">
                Tu contraseña ha sido actualizada con éxito. Serás redirigido al inicio de sesión en unos momentos.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Ir al Inicio de Sesión
              </button>
            </div>
          )}

          {(status === 'valid' || status === 'loading' || status === 'error') && (
            <>
              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-slate-50 text-slate-900 text-sm outline-none transition-colors"
                      placeholder="Mínimo 8 caracteres"
                      required
                      disabled={status === 'loading'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors"
                      disabled={status === 'loading'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="confirmPassword">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-slate-50 text-slate-900 text-sm outline-none transition-colors"
                      placeholder="Repite la contraseña"
                      required
                      disabled={status === 'loading'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors"
                      disabled={status === 'loading'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {status === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⟳</span> Restableciendo...
                    </span>
                  ) : (
                    'Restablecer Contraseña'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} CDF Motos. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
