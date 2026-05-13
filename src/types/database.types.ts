export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      auditoria_contratos: {
        Row: {
          contrato_id: number | null
          estado_anterior: string | null
          estado_nuevo: string | null
          fecha_cambio: string | null
          id: number
          usuario: string | null
        }
        Insert: {
          contrato_id?: number | null
          estado_anterior?: string | null
          estado_nuevo?: string | null
          fecha_cambio?: string | null
          id?: number
          usuario?: string | null
        }
        Update: {
          contrato_id?: number | null
          estado_anterior?: string | null
          estado_nuevo?: string | null
          fecha_cambio?: string | null
          id?: number
          usuario?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          apellidos: string
          cedula: string
          celular: string | null
          celular_alternativo: string | null
          created_at: string | null
          direccion_residencia: string | null
          id: string
          nombres: string
        }
        Insert: {
          apellidos: string
          cedula: string
          celular?: string | null
          celular_alternativo?: string | null
          created_at?: string | null
          direccion_residencia?: string | null
          id?: string
          nombres: string
        }
        Update: {
          apellidos?: string
          cedula?: string
          celular?: string | null
          celular_alternativo?: string | null
          created_at?: string | null
          direccion_residencia?: string | null
          id?: string
          nombres?: string
        }
        Relationships: []
      }
      contratos: {
        Row: {
          cliente_cedula: string | null
          created_at: string | null
          cuota_diaria: number
          estado: string | null
          fecha_inicio: string
          id: number
          id_old: string
          placa: string | null
          tipo_contrato: string
          usuario_id: string | null
          valor_contrato: number
        }
        Insert: {
          cliente_cedula?: string | null
          created_at?: string | null
          cuota_diaria: number
          estado?: string | null
          fecha_inicio: string
          id?: number
          id_old?: string
          placa?: string | null
          tipo_contrato: string
          usuario_id?: string | null
          valor_contrato: number
        }
        Update: {
          cliente_cedula?: string | null
          created_at?: string | null
          cuota_diaria?: number
          estado?: string | null
          fecha_inicio?: string
          id?: number
          id_old?: string
          placa?: string | null
          tipo_contrato?: string
          usuario_id?: string | null
          valor_contrato?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_cedula_fkey"
            columns: ["cliente_cedula"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["cedula"]
          },
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
          {
            foreignKeyName: "fk_contrato_usuario"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contrato_usuario"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vista_mis_recaudos"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      estado_sistema: {
        Row: {
          abierto: boolean
          actualizado_en: string | null
          actualizado_por: string | null
          fecha: string
          observacion: string | null
        }
        Insert: {
          abierto?: boolean
          actualizado_en?: string | null
          actualizado_por?: string | null
          fecha?: string
          observacion?: string | null
        }
        Update: {
          abierto?: boolean
          actualizado_en?: string | null
          actualizado_por?: string | null
          fecha?: string
          observacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estado_sistema_actualizado_por_fkey"
            columns: ["actualizado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estado_sistema_actualizado_por_fkey"
            columns: ["actualizado_por"]
            isOneToOne: false
            referencedRelation: "vista_mis_recaudos"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      gastos: {
        Row: {
          concepto: string
          created_at: string | null
          fecha: string
          id: number
          monto: number
        }
        Insert: {
          concepto: string
          created_at?: string | null
          fecha: string
          id?: never
          monto: number
        }
        Update: {
          concepto?: string
          created_at?: string | null
          fecha?: string
          id?: never
          monto?: number
        }
        Relationships: []
      }
      gps: {
        Row: {
          created_at: string | null
          gps_imei: string
          id: number
          moto_placa: string
          simcard: string | null
        }
        Insert: {
          created_at?: string | null
          gps_imei: string
          id?: number
          moto_placa: string
          simcard?: string | null
        }
        Update: {
          created_at?: string | null
          gps_imei?: string
          id?: number
          moto_placa?: string
          simcard?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_gps_moto_placa"
            columns: ["moto_placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
        ]
      }
      historico_estado_contratos: {
        Row: {
          activo: number | null
          bodega: number | null
          created_at: string | null
          fecha: string
          fiscalia: number | null
          liquidado: number | null
          paradenuncio: number | null
          robada: number | null
          termino: number | null
          total_contratos: number
        }
        Insert: {
          activo?: number | null
          bodega?: number | null
          created_at?: string | null
          fecha: string
          fiscalia?: number | null
          liquidado?: number | null
          paradenuncio?: number | null
          robada?: number | null
          termino?: number | null
          total_contratos: number
        }
        Update: {
          activo?: number | null
          bodega?: number | null
          created_at?: string | null
          fecha?: string
          fiscalia?: number | null
          liquidado?: number | null
          paradenuncio?: number | null
          robada?: number | null
          termino?: number | null
          total_contratos?: number
        }
        Relationships: []
      }
      motos: {
        Row: {
          anio: number | null
          chasis_vin: string | null
          color: string | null
          created_at: string | null
          factura_documentos: string | null
          factura_venta: string | null
          fecha_compra: string | null
          id: number
          marca: string | null
          modelo: string | null
          motor: string | null
          placa: string
          propietario: string | null
        }
        Insert: {
          anio?: number | null
          chasis_vin?: string | null
          color?: string | null
          created_at?: string | null
          factura_documentos?: string | null
          factura_venta?: string | null
          fecha_compra?: string | null
          id?: number
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          placa: string
          propietario?: string | null
        }
        Update: {
          anio?: number | null
          chasis_vin?: string | null
          color?: string | null
          created_at?: string | null
          factura_documentos?: string | null
          factura_venta?: string | null
          fecha_compra?: string | null
          id?: number
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          placa?: string
          propietario?: string | null
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          contrato_id: number | null
          created_at: string
          id: number
          mensaje: string
          tipo: string
        }
        Insert: {
          contrato_id?: number | null
          created_at?: string
          id?: number
          mensaje: string
          tipo: string
        }
        Update: {
          contrato_id?: number | null
          created_at?: string
          id?: number
          mensaje?: string
          tipo?: string
        }
        Relationships: []
      }
      recaudo: {
        Row: {
          abono: number | null
          contrato_id: number
          created_at: string | null
          cuota_diaria_pactada: number
          dias_pagados: number | null
          fecha_recaudo: string
          id: number
          monto_recaudado: number
          nuevo_saldo: number | null
          numero_recaudo: string | null
          saldo_pendiente: number | null
          tipo_contrato: string
          usuario_id: string | null
        }
        Insert: {
          abono?: number | null
          contrato_id: number
          created_at?: string | null
          cuota_diaria_pactada: number
          dias_pagados?: number | null
          fecha_recaudo: string
          id?: number
          monto_recaudado: number
          nuevo_saldo?: number | null
          numero_recaudo?: string | null
          saldo_pendiente?: number | null
          tipo_contrato: string
          usuario_id?: string | null
        }
        Update: {
          abono?: number | null
          contrato_id?: number
          created_at?: string | null
          cuota_diaria_pactada?: number
          dias_pagados?: number | null
          fecha_recaudo?: string
          id?: number
          monto_recaudado?: number
          nuevo_saldo?: number | null
          numero_recaudo?: string | null
          saldo_pendiente?: number | null
          tipo_contrato?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_recaudo_usuario"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recaudo_usuario"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vista_mis_recaudos"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "extracto_placa"
            referencedColumns: ["numero_contrato"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "view_extracto_contrato"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "view_recaudos_contratos"
            referencedColumns: ["contrato_numero"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vista_actividades_recientes"
            referencedColumns: ["numero_contrato"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vista_contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vista_control_diario"
            referencedColumns: ["numero_contrato"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vista_reporte_pendientes"
            referencedColumns: ["contrato_numero"]
          },
        ]
      }
      soats: {
        Row: {
          created_at: string | null
          fecha_vencimiento: string | null
          id: number
          moto_placa: string
          no_soat: string
        }
        Insert: {
          created_at?: string | null
          fecha_vencimiento?: string | null
          id?: number
          moto_placa: string
          no_soat: string
        }
        Update: {
          created_at?: string | null
          fecha_vencimiento?: string | null
          id?: number
          moto_placa?: string
          no_soat?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_soats_moto_placa"
            columns: ["moto_placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
        ]
      }
      users: {
        Row: {
          cedula: string
          created_at: string | null
          email: string | null
          estado: boolean | null
          id: string
          nombre_completo: string | null
          rol: string | null
        }
        Insert: {
          cedula: string
          created_at?: string | null
          email?: string | null
          estado?: boolean | null
          id: string
          nombre_completo?: string | null
          rol?: string | null
        }
        Update: {
          cedula?: string
          created_at?: string | null
          email?: string | null
          estado?: boolean | null
          id?: string
          nombre_completo?: string | null
          rol?: string | null
        }
        Relationships: []
      }
      usuario_notificaciones: {
        Row: {
          estado: string
          id: number
          leida_at: string | null
          notificacion_id: number
          usuario_id: string
        }
        Insert: {
          estado?: string
          id?: number
          leida_at?: string | null
          notificacion_id: number
          usuario_id: string
        }
        Update: {
          estado?: string
          id?: number
          leida_at?: string | null
          notificacion_id?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_notificaciones_notificacion_id_fkey"
            columns: ["notificacion_id"]
            isOneToOne: false
            referencedRelation: "notificaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_notificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_notificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vista_mis_recaudos"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
    }
    Views: {
      extracto_placa: {
        Row: {
          cedula: string | null
          cuota_diaria: number | null
          fecha_compra: string | null
          numero_contrato: number | null
          placa: string | null
          tipo_contrato: string | null
          valor_contrato: number | null
        }
        Insert: {
          cedula?: string | null
          cuota_diaria?: number | null
          fecha_compra?: string | null
          numero_contrato?: number | null
          placa?: string | null
          tipo_contrato?: string | null
          valor_contrato?: number | null
        }
        Update: {
          cedula?: string | null
          cuota_diaria?: number | null
          fecha_compra?: string | null
          numero_contrato?: number | null
          placa?: string | null
          tipo_contrato?: string | null
          valor_contrato?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_cedula_fkey"
            columns: ["cedula"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["cedula"]
          },
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
        ]
      }
      view_extracto_contrato: {
        Row: {
          abono: number | null
          apellidos: string | null
          cliente_cedula: string | null
          contrato_id: number | null
          cuota_diaria_pactada: number | null
          dias_pagados: number | null
          fecha_recaudo: string | null
          id_recaudo: number | null
          monto_recaudado: number | null
          nombres: string | null
          nuevo_saldo: number | null
          numero_recaudo: string | null
          placa: string | null
          porcentaje_recaudado: number | null
          porcentaje_saldo_pendiente: number | null
          recaudo_acumulado: number | null
          saldo_a_la_fecha: number | null
          saldo_pendiente: number | null
          valor_contrato: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_cedula_fkey"
            columns: ["cliente_cedula"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["cedula"]
          },
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
        ]
      }
      view_indicadores_mensuales: {
        Row: {
          abono_acumulado: number | null
          abono_dia: number | null
          esperado_hasta_el_dia: number | null
          fecha: string | null
          porcentaje_alcanzado: number | null
          porcentaje_sobre_esa_expectativa: number | null
          recaudo_acumulado: number | null
          recaudo_dia: number | null
          recaudo_esperado_acumulado: number | null
          recaudo_esperado_diario: number | null
          total_acumulado: number | null
        }
        Relationships: []
      }
      view_recaudos_contratos: {
        Row: {
          contrato_numero: number | null
          cuota_diaria_pactada: number | null
          fecha_recaudo: string | null
          monto_recaudado: number | null
          placa: string | null
          porcentaje_recaudado: number | null
          recaudo_acumulado: number | null
          recaudo_numero: string | null
          saldo_pendiente: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
        ]
      }
      view_ultimos_recaudos: {
        Row: {
          cuota_diaria_pactada: number | null
          fecha_recaudo: string | null
          monto_recaudado: number | null
          numero_contrato: number | null
          numero_recaudo: number | null
          placa: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["numero_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["numero_contrato"]
            isOneToOne: false
            referencedRelation: "extracto_placa"
            referencedColumns: ["numero_contrato"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["numero_contrato"]
            isOneToOne: false
            referencedRelation: "view_extracto_contrato"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["numero_contrato"]
            isOneToOne: false
            referencedRelation: "view_recaudos_contratos"
            referencedColumns: ["contrato_numero"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["numero_contrato"]
            isOneToOne: false
            referencedRelation: "vista_actividades_recientes"
            referencedColumns: ["numero_contrato"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["numero_contrato"]
            isOneToOne: false
            referencedRelation: "vista_contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["numero_contrato"]
            isOneToOne: false
            referencedRelation: "vista_control_diario"
            referencedColumns: ["numero_contrato"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["numero_contrato"]
            isOneToOne: false
            referencedRelation: "vista_reporte_pendientes"
            referencedColumns: ["contrato_numero"]
          },
        ]
      }
      vista_actividades_recientes: {
        Row: {
          cliente: string | null
          estado_contrato: string | null
          fecha: string | null
          numero_contrato: number | null
          personaacargo: string | null
          placa: string | null
          tipo_servicio: string | null
          usuarioiddebug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
          {
            foreignKeyName: "fk_contrato_usuario"
            columns: ["usuarioiddebug"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contrato_usuario"
            columns: ["usuarioiddebug"]
            isOneToOne: false
            referencedRelation: "vista_mis_recaudos"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      vista_asistencia_historica: {
        Row: {
          asistencia_contratos: number | null
          asistencia_motos: number | null
          asistencia_prestamos: number | null
          fecha: string | null
          motos_activas: number | null
          pct_motos: number | null
          pct_prestamos: number | null
          pct_total: number | null
          prestamos_activos: number | null
          total_contratos: number | null
        }
        Relationships: []
      }
      vista_asistencia_historica_v2: {
        Row: {
          asistencia_contratos: number | null
          asistencia_motos: number | null
          asistencia_prestamos: number | null
          fecha: string | null
          motos_esperadas: number | null
          pct_motos: number | null
          pct_prestamos: number | null
          pct_total: number | null
          prestamos_esperados: number | null
          total_esperados: number | null
        }
        Relationships: []
      }
      vista_asistencia_resumen: {
        Row: {
          asistencia_contratos: number | null
          asistencia_motos: number | null
          asistencia_prestamos: number | null
          contratos_sin_asistencia: number | null
          fecha: string | null
          motos_activas: number | null
          motos_sin_asistencia: number | null
          pct_motos: number | null
          pct_prestamos: number | null
          pct_total: number | null
          prestamos_activos: number | null
          prestamos_sin_asistencia: number | null
          total_contratos: number | null
        }
        Relationships: []
      }
      vista_asistencia_resumen_v2: {
        Row: {
          asistencia_contratos: number | null
          asistencia_motos: number | null
          asistencia_prestamos: number | null
          contratos_sin_asistencia: number | null
          fecha: string | null
          motos_esperadas: number | null
          motos_sin_asistencia: number | null
          pct_motos: number | null
          pct_prestamos: number | null
          pct_total: number | null
          prestamos_esperados: number | null
          prestamos_sin_asistencia: number | null
          total_esperados: number | null
        }
        Relationships: []
      }
      vista_contratos: {
        Row: {
          apellidos: string | null
          cliente_cedula: string | null
          cuota_diaria: number | null
          estado: string | null
          fecha_inicio: string | null
          id: number | null
          nombres: string | null
          nuevo_saldo: number | null
          placa: string | null
          porcentaje_recaudado: number | null
          porcentaje_saldo_pendiente: number | null
          recaudo_acumulado: number | null
          saldo_pendiente: number | null
          tipo_contrato: string | null
          valor_contrato: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_cedula_fkey"
            columns: ["cliente_cedula"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["cedula"]
          },
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
        ]
      }
      vista_control_diario: {
        Row: {
          cuota_diaria: number | null
          estado: string | null
          fecha_ultimo_recaudo: string | null
          numero_contrato: number | null
          placa: string | null
          tipo_contrato: string | null
          total_contrato: number | null
          total_recaudado: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
        ]
      }
      vista_control_efectivo: {
        Row: {
          fecha: string | null
          flujo_diario: number | null
          gastos_acumulados_mes: number | null
          gastos_diario: number | null
          num_gastos: number | null
          num_recaudos: number | null
          porcentaje_recaudo: number | null
          recaudo_alcanzado: number | null
          recaudo_esperado: number | null
          saldo_acumulado: number | null
        }
        Relationships: []
      }
      vista_estado_resumen: {
        Row: {
          estado: string | null
          total_contratos: number | null
        }
        Relationships: []
      }
      vista_indicadores_home: {
        Row: {
          contratos_recaudados: number | null
          contratos_sin_recaudar: number | null
          dinero_recaudado_hoy: number | null
          dinero_sin_recaudar: number | null
          numero_contratos_activos: number | null
          porcentaje_recaudo: number | null
        }
        Relationships: []
      }
      vista_mis_recaudos: {
        Row: {
          abono: number | null
          contrato_id: number | null
          created_at: string | null
          cuota_diaria_pactada: number | null
          estado_contrato: string | null
          fecha_recaudo: string | null
          monto_recaudado: number | null
          nuevo_saldo: number | null
          numero_recaudo: string | null
          placa: string | null
          recaudo_id: number | null
          saldo_pendiente: number | null
          tipo_contrato: string | null
          total_contrato: number | null
          total_recaudado_general: number | null
          total_recaudado_por_usuario: number | null
          usuario_email: string | null
          usuario_id: string | null
          usuario_nombre: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "extracto_placa"
            referencedColumns: ["numero_contrato"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "view_extracto_contrato"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "view_recaudos_contratos"
            referencedColumns: ["contrato_numero"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vista_actividades_recientes"
            referencedColumns: ["numero_contrato"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vista_contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vista_control_diario"
            referencedColumns: ["numero_contrato"]
          },
          {
            foreignKeyName: "recaudo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vista_reporte_pendientes"
            referencedColumns: ["contrato_numero"]
          },
        ]
      }
      vista_reporte_pendientes: {
        Row: {
          cliente: string | null
          contrato_numero: number | null
          cuota_diaria: number | null
          dias_pagados_hoy: number | null
          fecha_último_recaudo: string | null
          placa: string | null
          recaudado_hoy: number | null
          saldo_pendiente: number | null
          tipo_contrato: string | null
          valor_contrato: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_placa_fkey"
            columns: ["placa"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["placa"]
          },
        ]
      }
    }
    Functions: {
      capturar_estado_diario: { Args: never; Returns: undefined }
      fn_actualizar_estado_diario: { Args: never; Returns: undefined }
      fn_contar_dias_abiertos: {
        Args: { fecha_desde: string; fecha_hasta: string }
        Returns: number
      }
      recalcular_saldos: { Args: { contrato: number }; Returns: undefined }
      recalcular_saldos_contrato_old: {
        Args: { p_contrato_id: number }
        Returns: undefined
      }
      upsert_estado_sistema: {
        Args: {
          p_abierto: boolean
          p_observacion: string
          p_usuario_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
