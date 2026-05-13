import { db } from '../../../db/db';

export interface ActividadReciente {
  fecha: string;
  numero_contrato: number;
  placa: string | null;
  tipo_servicio: string;
  personaacargo: string | null;
  usuarioiddebug: string | null;
  cliente: string;
  estado_contrato: string | null;
}

export async function getActividadesRecientes(): Promise<ActividadReciente[]> {
  // Fecha límite: hace 7 días (equivalente a CURRENT_DATE - '7 days')
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  const fechaLimite = hace7Dias.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // Contratos creados en los últimos 7 días con estado no nulo
  // Dexie no tiene índice en created_at, así que filtramos en memoria
  const contratos = await db.contratos
    .filter(c =>
      c.estado !== null &&
      c.estado !== undefined &&
      c.created_at !== undefined &&
      c.created_at.slice(0, 10) >= fechaLimite
    )
    .toArray();

  if (contratos.length === 0) return [];

  // Obtener usuarios y clientes relacionados en paralelo
  const [users, clientes] = await Promise.all([
    db.users.toArray(),
    db.clientes.toArray(),
  ]);

  // Indexar para lookup O(1) en vez de find() anidado
  const usersMap   = new Map(users.map(u   => [u.id,     u]));
  const clienteMap = new Map(clientes.map(cl => [cl.cedula, cl]));

  // Construir resultado — equivalente al SELECT con LEFT JOINs
  const resultado: ActividadReciente[] = contratos.map(c => {
    const user    = c.usuario_id    ? usersMap.get(c.usuario_id)       : undefined;
    const cliente = c.cliente_cedula ? clienteMap.get(c.cliente_cedula) : undefined;

    return {
      fecha:           c.created_at?.slice(0, 10) ?? '',
      numero_contrato: c.id,
      placa:           c.placa ?? null,
      tipo_servicio:   c.tipo_contrato,
      personaacargo:   user?.nombre_completo ?? null,
      usuarioiddebug:  c.usuario_id ?? null,
      cliente:         cliente
                         ? `${cliente.nombres} ${cliente.apellidos}`
                         : 'Sin cliente',
      estado_contrato: c.estado ?? null,
    };
  });

  // ORDER BY created_at DESC
  return resultado.sort((a, b) => b.fecha.localeCompare(a.fecha));
}