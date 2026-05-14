import { useState, useEffect } from 'react';
import { X, Save, UserCircle, Shield, Mail } from 'lucide-react';
import { useAuth } from '../../modules/login/hooks/useAuth';
import { updateUserProfile } from './services/perfilService';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface PerfilModalProps {
  open: boolean;
  onClose: () => void;
}

export function PerfilModal({ open, onClose }: PerfilModalProps) {
  const { user, updateUser } = useAuth();
  const { isOnline } = useOnlineStatus();

  const [formData, setFormData] = useState({
    nombre_completo: '',
    cedula: '',
  });

  const [errors, setErrors] = useState<{ nombre_completo?: string; cedula?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;

    setFormData({
      nombre_completo: user.nombre_completo || '',
      cedula: user.cedula || '',
    });

    setErrors({});
  }, [open, user]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = 'El nombre es obligatorio';
    }
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!isOnline) {
      alert('Esta función requiere conexión a internet');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateUserProfile(user!.id, formData, isOnline);
      updateUser(updatedUser);
      onClose();
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      alert('Ocurrió un error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <UserCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Mi Perfil</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="bg-white border border-border rounded-xl p-4 mb-4 space-y-3">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <div className="text-sm">
                <p className="text-xs text-slate-400">Correo Electrónico</p>
                <p className="font-medium">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Shield className="w-4 h-4 text-slate-400" />
              <div className="text-sm">
                <p className="text-xs text-slate-400">Rol del Sistema</p>
                <p className="font-medium capitalize">{user?.rol || 'Usuario'}</p>
              </div>
            </div>
          </div>

          <form id="perfil-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className={`w-full px-3 py-2 bg-white border rounded-lg outline-none transition-colors ${
                  errors.nombre_completo
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary focus:border-primary'
                }`}
              />
              {errors.nombre_completo && (
                <span className="text-xs text-red-500 mt-1 block">{errors.nombre_completo}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cédula</label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                placeholder="Ej: 123456789"
                className={`w-full px-3 py-2 bg-white border rounded-lg outline-none transition-colors ${
                  errors.cedula
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary focus:border-primary'
                }`}
              />
              {errors.cedula && (
                <span className="text-xs text-red-500 mt-1 block">{errors.cedula}</span>
              )}
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="perfil-form"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}