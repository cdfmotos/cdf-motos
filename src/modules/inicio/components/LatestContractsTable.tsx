import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { ActividadReciente } from '../services/actividadesService';
import { WrapperCard } from '../../../components/ui/WrapperCard';

interface LatestContractsTableProps {
  data: ActividadReciente[];
  loading?: boolean;
}

export function LatestContractsTable({ data, loading }: LatestContractsTableProps) {
  const columns: Column<ActividadReciente>[] = [
    {
      header: 'Fecha',
      accessorKey: 'fecha',
    },
    {
      header: 'N° Contrato',
      accessorKey: 'numero_contrato',
    },
    {
      header: 'Placa',
      accessorKey: 'placa',
      cell: (item) => item.placa || 'N/A'
    },
    {
      header: 'Tipo de Servicio',
      accessorKey: 'tipo_servicio',
    },
    {
      header: 'Persona a Cargo',
      accessorKey: 'personaacargo',
      cell: (item) => item.personaacargo || 'N/A'
    },
    {
      header: 'Cliente',
      accessorKey: 'cliente',
    },
    {
      header: 'Estado',
      accessorKey: 'estado_contrato',
      cell: (item) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          item.estado_contrato === 'Activo' 
            ? 'bg-green-100 text-green-800' 
            : item.estado_contrato === 'Inactivo' || item.estado_contrato === 'Cancelado'
            ? 'bg-red-100 text-red-800'
            : 'bg-slate-100 text-slate-800'
        }`}>
          {item.estado_contrato || 'Desconocido'}
        </span>
      )
    },
  ];

  return (
    <WrapperCard title="Últimos Contratos (7 días)">
      {loading ? (
        <div className="flex justify-center items-center h-32 text-slate-400">
          Cargando datos...
        </div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          searchPlaceholder="Buscar en contratos..." 
        />
      )}
    </WrapperCard>
  );
}
