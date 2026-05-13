import type { Database } from '../types/database.types';

type Tables = Database['public']['Tables'];

// Los tipos de Dexie extienden los de Supabase
export type Cliente      = Tables['clientes']['Row']      & { _sync_status?: SyncStatus };
export type Contrato     = Tables['contratos']['Row']     & { _sync_status?: SyncStatus };
export type Recaudo      = Tables['recaudo']['Row']       & { _sync_status?: SyncStatus; _local_id?: string };
export type Gasto        = Tables['gastos']['Row']        & { _sync_status?: SyncStatus };
export type Moto         = Tables['motos']['Row']         & { _sync_status?: SyncStatus };
export type GPS          = Tables['gps']['Row']           & { _sync_status?: SyncStatus };
export type Soat         = Tables['soats']['Row']         & { _sync_status?: SyncStatus };
export type EstadoSistema = Tables['estado_sistema']['Row'] & { _sync_status?: SyncStatus };
export type Notificacion = Tables['notificaciones']['Row'] & { _sync_status?: SyncStatus };
export type UsuarioNotificacion = Tables['usuario_notificaciones']['Row'] & { _sync_status?: SyncStatus };
export type User         = Tables['users']['Row'];

type SyncStatus = 'synced' | 'pending' | 'error';



// ── Cola de sincronización ─────────────────────────────────────

export interface SyncQueueItem {
  id?: number;           // autoincrement local
  tabla: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: object;
  pk_value: string | number;  // valor de la PK del registro
  timestamp: number;     // Date.now() — define el orden FIFO
  intentos: number;
  estado: 'pending' | 'processing' | 'error';
  error_msg?: string;
}