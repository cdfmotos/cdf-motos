import Dexie, { type EntityTable } from 'dexie';
import type {
  Cliente, Contrato, Recaudo, Gasto, Moto,
  GPS, Soat, EstadoSistema, Notificacion, UsuarioNotificacion, User, SyncQueueItem
} from './schema';

class GestionDB extends Dexie {
  clientes!:       EntityTable<Cliente,        'id'>;
  contratos!:      EntityTable<Contrato,       'id'>;
  recaudo!:        EntityTable<Recaudo,        'id'>;
  gastos!:         EntityTable<Gasto,          'id'>;
  motos!:          EntityTable<Moto,           'id'>;
  gps!:            EntityTable<GPS,            'id'>;
  soats!:          EntityTable<Soat,           'id'>;
  estado_sistema!: EntityTable<EstadoSistema,  'fecha'>;
  notificaciones!: EntityTable<Notificacion,   'id'>;
  usuario_notificaciones!: EntityTable<UsuarioNotificacion, 'id'>;
  users!:          EntityTable<User,           'id'>;
  sync_queue!:     EntityTable<SyncQueueItem,  'id'>;

  constructor() {
    super('GestionContratosDB');

    this.version(5).stores({
      clientes:       'id, cedula, _local_id',
      contratos:      'id, cliente_cedula, placa, estado, _local_id',
      recaudo:        'id, contrato_id, fecha_recaudo, created_at, _sync_status, _local_id',
      gastos:         'id, fecha, _sync_status, _local_id',
      motos:          'id, placa, _local_id',
      gps:            'id, moto_placa, _local_id',
      soats:          'id, moto_placa, no_soat, _local_id',
      estado_sistema: 'fecha',
      notificaciones: 'id, contrato_id',
      usuario_notificaciones: 'id, usuario_id, notificacion_id, estado',
      users:          'id, cedula',
      sync_queue:     '++id, tabla, estado, timestamp',
    });
  }
}

export const db = new GestionDB();