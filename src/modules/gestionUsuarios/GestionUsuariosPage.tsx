import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, WifiOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { EditUserModal } from './components/EditUserModal';
import { DataTable } from '../../components/ui/DataTable';
import type { Database } from '../../types/database.types';
import type { Column } from '../../components/ui/DataTable/types/types';

type User = Database['public']['Tables']['users']['Row'];

export function GestionUsuariosPage() {
  const isOnline = useOnlineStatus();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEditando, setUserEditando] = useState<User | null>(null);

  useEffect(() => {
    if (!isOnline) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .order('nombre_completo', { ascending: true });

      setLoading(false);
      if (err) {
        setError(err.message);
      } else {
        setUsers(data || []);
      }
    };

    fetchUsers();
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <WifiOff className="w-12 h-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">Sin conexión</h3>
        <p className="text-sm text-slate-500 mt-1">
          Esta función requiere conexión a internet.
        </p>
      </div>
    );
  }

  const columns: Column<User>[] = [
    { header: 'Nombre Completo', accessorKey: 'nombre_completo' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Cédula', accessorKey: 'cedula' },
    { header: 'Rol', accessorKey: 'rol' },
    { 
      header: 'Estado', 
      accessorKey: 'estado',
      cell: (user) => user.estado ? (
        <span className="inline-flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          Activo
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-500">
          <XCircle className="w-4 h-4" />
          Inactivo
        </span>
      )
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      sortable: false,
      cell: (user) => (
        <button
          onClick={() => setUserEditando(user)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          Editar
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
        <p className="text-sm text-slate-500">Administrar usuarios del sistema</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12 text-slate-500">Cargando...</div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          searchable
          searchPlaceholder="Buscar usuarios..."
          pagination={false}
        />
      )}

      <EditUserModal
        user={userEditando}
        onClose={() => setUserEditando(null)}
        onUpdated={() => {
          setUserEditando(null);
          if (isOnline) {
            supabase.from('users').select('*').order('nombre_completo', { ascending: true })
              .then(({ data }) => setUsers(data || []));
          }
        }}
      />
    </div>
  );
}