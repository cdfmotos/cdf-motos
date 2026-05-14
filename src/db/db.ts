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

    this.version(3).stores({
      clientes:       'id, cedula',
      contratos:      'id, cliente_cedula, placa, estado',
      recaudo:        'id, contrato_id, fecha_recaudo, created_at, _sync_status',
      gastos:         'id, fecha, _sync_status',
      motos:          'id, placa',
      gps:            'id, moto_placa',
      soats:          'id, moto_placa',
      estado_sistema: 'fecha',
      notificaciones: 'id, contrato_id',
      usuario_notificaciones: 'id, usuario_id, notificacion_id, estado',
      users:          'id, cedula',
      sync_queue:     '++id, tabla, estado, timestamp',
    });
  }
}

export const db = new GestionDB();