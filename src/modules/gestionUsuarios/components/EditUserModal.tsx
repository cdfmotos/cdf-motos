import { useState, useEffect } from 'react';
import { X, Save, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type User = Database['public']['Tables']['users']['Row'];

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditUserModal({ user, onClose, onUpdated }: EditUserModalProps) {
  const [estado, setEstado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEstado(user.estado ?? false);
    }
  }, [user]);

  if (!user) return null;

  const handleGuardar = async () => {
    setLoading(true);
    setError(null);

    const { error: err } = await supabase
      .from('users')
      .update({ estado })
      .eq('id', user.id);

    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      onUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-slate-800">Editar Usuario</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Nombre</p>
              <p className="font-medium text-slate-800">{user.nombre_completo || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Email</p>
              <p className="font-medium text-slate-800">{user.email || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Cédula</p>
              <p className="font-medium text-slate-800">{user.cedula || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Rol</p>
              <p className="font-medium text-slate-800">{user.rol || '-'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estado del usuario
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estado}
                  onChange={(e) => setEstado(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className={`flex items-center gap-1 text-sm ${estado ? 'text-green-600' : 'text-red-500'}`}>
                  {estado ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Inactivo
                    </>
                  )}
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}