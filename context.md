# Contexto del Sistema — CDF Motos

> Documento de referencia para agente IA local. Describe la arquitectura, base de datos, lógica de negocio y decisiones técnicas del proyecto.

---

## 1. Descripción General

Sistema web de gestión de contratos y recaudos para una empresa de financiamiento de motos. Permite registrar clientes, contratos, pagos diarios (recaudos), gastos, motos, GPS y SOATs.

**Características clave:**
- Funciona **offline-first**: todas las operaciones se guardan localmente y se sincronizan con la nube cuando hay conexión.
- El dueño supervisa desde Bogotá vía Supabase (nube).
- Los operadores trabajan en una oficina con conectividad intermitente.
- Máximo 10 usuarios concurrentes.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework UI | React 18 + TypeScript + Vite |
| Base de datos local | Dexie.js (IndexedDB) |
| Base de datos en la nube | Supabase (PostgreSQL) |
| Sincronización offline | Cola FIFO propia + `navigator.onLine` |
| Estilos | Tailwind CSS |
| Navegación | React Router v6 |
| Reportes Excel | SheetJS |
| Reportes PDF | jsPDF |

**Origen:** El sistema fue migrado de Flutter a React. El backend Supabase no cambió.

---

## 3. Estructura del Proyecto

```
src/
├── db/
│   ├── schema.ts               # Tipos TypeScript de todas las tablas
│   ├── db.ts                   # Instancia única de Dexie (singleton)
│   ├── business/
│   │   └── recaudoLogic.ts     # Lógica de cálculo de saldos (replica triggers SQL)
│   └── sync/
│       ├── syncQueue.ts        # Funciones para encolar/desencolar operaciones
│       └── syncEngine.ts       # Motor que vacía la cola contra Supabase
├── lib/
│   └── supabase.ts             # Cliente Supabase tipado con Database
├── types/
│   └── database.types.ts       # Tipos generados por Supabase CLI
├── hooks/
│   └── useOnlineStatus.ts      # Detecta conexión y dispara syncEngine
└── modules/
    ├── recaudo/
    ├── contratos/
    ├── clientes/
    ├── motos/
    ├── gps/
    ├── soats/
    ├── gastos/
    ├── usuarios/
    ├── indicadores/
    └── controlDiario/
```

---

## 4. Base de Datos — Supabase

### 4.1 Tablas

#### `clientes`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
cedula              varchar NOT NULL UNIQUE
nombres             text NOT NULL
apellidos           text NOT NULL
celular             varchar
celular_alternativo varchar
direccion_residencia text
created_at          timestamptz DEFAULT now()
```

#### `contratos`
```sql
id              bigint PRIMARY KEY  -- secuencia
id_old          uuid DEFAULT gen_random_uuid()
placa           text REFERENCES motos(placa)
valor_contrato  numeric NOT NULL
cuota_diaria    numeric NOT NULL
fecha_inicio    date NOT NULL
tipo_contrato   text NOT NULL
cliente_cedula  varchar REFERENCES clientes(cedula)
estado          text
usuario_id      uuid REFERENCES users(id)
created_at      timestamptz DEFAULT now()
```

#### `recaudo`
```sql
id                   integer PRIMARY KEY  -- secuencia
numero_recaudo       text                 -- asignado por trigger; offline usa 'TMP-xxx'
monto_recaudado      numeric NOT NULL
cuota_diaria_pactada numeric NOT NULL
fecha_recaudo        date NOT NULL
saldo_pendiente      numeric              -- calculado por trigger
nuevo_saldo          numeric              -- calculado por trigger
tipo_contrato        text NOT NULL
abono                numeric              -- calculado por trigger
contrato_id          bigint NOT NULL REFERENCES contratos(id)
usuario_id           uuid REFERENCES users(id)
dias_pagados         integer              -- calculado por trigger
created_at           timestamptz DEFAULT now()
```

#### `gastos`
```sql
id        bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY
fecha     date NOT NULL
concepto  text NOT NULL
monto     numeric NOT NULL
created_at timestamptz DEFAULT now()
```

#### `motos`
```sql
id              integer PRIMARY KEY
placa           text NOT NULL UNIQUE
marca           text
modelo          text
color           text
motor           text UNIQUE
chasis_vin      text UNIQUE
factura_venta   text UNIQUE
propietario     text
anio            integer
factura_documentos text
fecha_compra    timestamptz
created_at      timestamptz DEFAULT now()
```

#### `gps`
```sql
id        integer PRIMARY KEY
moto_placa text NOT NULL REFERENCES motos(placa)
gps_imei   text NOT NULL UNIQUE
simcard    text UNIQUE
created_at timestamptz DEFAULT now()
```

#### `soats`
```sql
id               integer PRIMARY KEY
moto_placa       text NOT NULL REFERENCES motos(placa)
no_soat          text NOT NULL UNIQUE
fecha_vencimiento timestamptz
created_at       timestamptz DEFAULT now()
```

#### `estado_sistema`
```sql
fecha          date PRIMARY KEY DEFAULT CURRENT_DATE
abierto        boolean NOT NULL DEFAULT true
observacion    text
actualizado_por uuid REFERENCES users(id)
actualizado_en  timestamptz DEFAULT now()
```
> Controla si un día está hábil o no. Se usa para contar días abiertos en cálculos de mora.

#### `notificaciones`
```sql
id          bigint PRIMARY KEY
contrato_id bigint
tipo        text NOT NULL
mensaje     text NOT NULL
created_at  timestamptz NOT NULL DEFAULT now()
```

#### `usuario_notificaciones`
```sql
id              bigint PRIMARY KEY
notificacion_id bigint NOT NULL REFERENCES notificaciones(id)
usuario_id      uuid NOT NULL REFERENCES users(id)
estado          text NOT NULL DEFAULT 'no_leida'
leida_at        timestamptz
```

#### `users`
```sql
id             uuid PRIMARY KEY REFERENCES auth.users(id)
nombre_completo text
email          text
cedula         varchar NOT NULL UNIQUE
rol            text      -- valores: 'Admin', 'Cajero'
estado         boolean DEFAULT false
created_at     timestamptz DEFAULT now()
```

#### `auditoria_contratos`
```sql
id             bigint PRIMARY KEY
contrato_id    bigint
estado_anterior varchar
estado_nuevo    varchar
fecha_cambio   timestamp DEFAULT CURRENT_TIMESTAMP
usuario        varchar
```

#### `historico_estado_contratos`
```sql
fecha           date PRIMARY KEY
total_contratos integer NOT NULL
bodega          integer DEFAULT 0
fiscalia        integer DEFAULT 0
liquidado       integer DEFAULT 0
paradenuncio    integer DEFAULT 0
robada          integer DEFAULT 0
termino         integer DEFAULT 0
activo          integer DEFAULT 0
created_at      timestamp DEFAULT CURRENT_TIMESTAMP
```

---

### 4.2 Funciones y Triggers de Supabase

Estas funciones corren en el servidor. Las marcadas con ⚠️ deben tener su **equivalente en JavaScript** para modo offline.

#### ⚠️ `fn_calc_saldos_recaudo` — TRIGGER en INSERT de recaudo
Calcula los saldos respetando orden histórico (por `fecha_recaudo` y `id`).
```
saldo_pendiente = nuevo_saldo del recaudo anterior (o valor_contrato si es el primero)
nuevo_saldo     = saldo_pendiente - monto_recaudado
dias_pagados    = FLOOR(monto_recaudado / cuota_diaria_pactada)
abono           = GREATEST(monto_recaudado - (cuota_diaria * dias_pagados), 0)
```
**Equivalente JS:** `src/db/business/recaudoLogic.ts → calcularSaldosRecaudo()`

#### `fn_calcular_saldos` — versión anterior del trigger
Similar a la anterior pero NO respeta orden histórico. No usar para inserciones retroactivas.

#### ⚠️ `recalcular_saldos(contrato_id)` — función de corrección
Recorre todos los recaudos de un contrato en orden y recalcula todos los saldos desde cero. Se llama post-sync para corregir inconsistencias.

#### `asignar_numero_recaudo` — TRIGGER en INSERT de recaudo
Asigna número consecutivo global usando secuencia `recaudo_numero_seq`.
**Manejo offline:** el cliente asigna `numero_recaudo = 'TMP-' + Date.now()`. Al sincronizar, NO se envía este campo — Supabase lo genera con el trigger.

#### `capturar_estado_diario()` — snapshot diario
Inserta o actualiza `historico_estado_contratos` con el conteo de contratos por estado del día actual.

#### `fn_actualizar_estado_diario()` — init del día
Garantiza que exista un registro en `estado_sistema` para la fecha actual. Si no existe, lo crea con `abierto = false`.

#### `fn_contar_dias_abiertos(fecha_desde, fecha_hasta)` — función de utilidad
Cuenta los días donde `estado_sistema.abierto = true` en un rango. Si no hay registro para un día, se considera abierto.
**Equivalente JS necesario para offline.**

#### `fn_eliminar_notificaciones_viejas()` — limpieza
Elimina registros de `usuario_notificaciones` con `leida_at` hace más de 24 horas.

#### `fn_repartir_notificacion` — TRIGGER en INSERT de notificaciones
Al crear una notificación, la asigna automáticamente a todos los usuarios con rol `'Cajero'` o `'Admin'`.

#### `fn_set_numero_recaudo` — versión alternativa de numeración
Genera número de recaudo por contrato (no global). No usar si se usa `asignar_numero_recaudo`.

---

### 4.3 Vistas SQL

Las vistas corren en el servidor y **no están disponibles offline**. Deben replicarse como funciones JavaScript que consulten Dexie.

#### `view_extracto_contrato`
Vista principal del módulo de contratos. Combina `contratos`, `recaudo` y `clientes`.

Calcula por cada recaudo:
- `acumulado`: suma acumulada de `monto_recaudado` por contrato (window function `SUM OVER PARTITION BY contrato_id ORDER BY fecha_recaudo, id`)
- `saldo_a_la_fecha`: `valor_contrato - acumulado`
- `porcentaje_saldo_pendiente`: `100 * saldo_pendiente / valor_contrato`
- `porcentaje_recaudado`: `100 * acumulado / valor_contrato`
- `saldo_pendiente`: del recaudo, o calculado si es nulo
- `nuevo_saldo`: del recaudo, o calculado si es nulo

**Equivalente JS:** recorrer recaudos de Dexie ordenados por `fecha_recaudo, id` y aplicar `reduce` acumulativo.

> ⚠️ Hay otras vistas en uso por los módulos. Hacer inventario completo durante la Fase 1 del desarrollo.

---

## 5. Arquitectura Offline

### 5.1 Principio local-first

```
Operación del usuario
        ↓
Calcular saldos localmente (recaudoLogic.ts)
        ↓
Guardar en Dexie con _sync_status = 'pending'
        ↓
Encolar en sync_queue (syncQueue.ts)
        ↓
[cuando navigator.onLine = true]
        ↓
syncEngine.procesarCola() — envía en orden FIFO
        ↓
Supabase ejecuta triggers y confirma
        ↓
_sync_status = 'synced', item eliminado de la cola
```

### 5.2 Tablas disponibles offline (CRUD completo)

| Tabla | Prioridad | Notas |
|-------|-----------|-------|
| `recaudo` | Crítica | Saldos calculados localmente |
| `contratos` | Alta | Base para cálculo de recaudos |
| `clientes` | Alta | Vinculado a contratos |
| `motos` | Alta | Vinculado a contratos |
| `gastos` | Alta | Operación diaria frecuente |
| `estado_sistema` | Alta | Necesario para cálculo de días |
| `gps` | Media | |
| `soats` | Media | |
| `notificaciones` | Media | Se envían al reconectar |
| `users` | Media | Solo lectura offline; creación requiere conexión |

### 5.3 Operaciones que requieren conexión

- Crear nuevos usuarios (Supabase Auth)
- Login (primera vez; sesión se mantiene localmente después)
- Limpiar notificaciones viejas

### 5.4 Números de recaudo temporales

- **Offline:** `numero_recaudo = 'TMP-' + Date.now()`
- **Al sincronizar:** el campo NO se envía a Supabase; el trigger `asignar_numero_recaudo` asigna el consecutivo real
- El campo es `text` en Supabase, por lo que no hay conflicto de tipo

### 5.5 IDs locales vs IDs de Supabase

- Registros creados offline no tienen ID de Supabase aún
- Se usa `_local_id` (campo extra en Dexie) como referencia temporal
- Al sincronizar, Supabase devuelve el ID definitivo y se actualiza en Dexie
- En `db.ts`, **ninguna tabla usa `++id`** excepto `sync_queue` que es exclusivamente local

---

## 6. Archivos Clave

### `src/db/schema.ts`
- Importa tipos de `database.types.ts` (generado por Supabase CLI)
- Extiende cada tipo con `_sync_status?: 'synced' | 'pending' | 'error'`
- `Recaudo` también tiene `_local_id?: string`
- Define `SyncQueueItem` para la cola de sincronización

### `src/db/db.ts`
- Clase `GestionDB extends Dexie`
- Versión 1 del schema
- Índices definidos por tabla (solo los campos necesarios para búsqueda)
- Exporta singleton `db`

### `src/db/sync/syncQueue.ts`
Funciones: `encolar()`, `contarPendientes()`, `marcarExitoso()`, `marcarError()`, `reintentarErrores()`, `verCola()`

### `src/db/sync/syncEngine.ts`
- Clase `SyncEngine` con método `procesarCola()`
- Procesa items en orden FIFO por `timestamp`
- Para si pierde conexión durante el proceso
- Limpia campos internos (`_sync_status`, `_local_id`) antes de enviar a Supabase
- Para `recaudo` INSERT: no envía `numero_recaudo` (lo genera el trigger)
- Exporta singleton `syncEngine`

### `src/db/business/recaudoLogic.ts`
Replica `fn_calc_saldos_recaudo`. Función `calcularSaldosRecaudo(contratoId, monto, cuota, fecha)`.
Busca el recaudo anterior en Dexie ordenado por `fecha_recaudo`. Si no hay, usa `valor_contrato` del contrato.

### `src/hooks/useOnlineStatus.ts`
- Escucha eventos `online`/`offline` del navegador
- Al detectar `online`: llama `syncEngine.procesarCola()`
- Retorna `boolean` para mostrar indicador visual en la UI

### `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### `src/types/database.types.ts`
Generado con:
```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```
Regenerar cada vez que cambie el schema de Supabase.

---

## 7. Módulos del Sistema

| Módulo | Ruta | Offline | Exporta |
|--------|------|---------|---------|
| Control Diario | `/control-diario` | ✓ | Excel, PDF |
| Recaudo | `/recaudo` | ✓ | Excel, PDF |
| Mis Recaudos | `/mis-recaudos` | ✓ | Excel |
| Maestro Clientes | `/clientes` | ✓ | Excel |
| Maestro Contratos | `/contratos` | ✓ | Excel, PDF |
| Maestro Motos | `/motos` | ✓ | Excel |
| Maestro GPS | `/gps` | ✓ | Excel |
| Maestro SOAT | `/soat` | ✓ | Excel |
| Gastos | `/gastos` | ✓ | Excel |
| Indicadores | `/indicadores` | ✓ | PDF |
| Gestión Usuarios | `/usuarios` | ⚠ parcial | — |
| Login | `/login` | ✗ | — |
| Restablecer contraseña | `/reset-password` | ✗ | — |

---

## 8. Roles y Permisos

| Rol | Acceso |
|-----|--------|
| `Admin` | Acceso total. Ve todos los recaudos, usuarios y configuración. |
| `Cajero` | Acceso operativo. Registra recaudos, clientes y contratos. |

Los roles se verifican contra el campo `users.rol` en Dexie (sincronizado desde Supabase).
Las notificaciones nuevas se distribuyen automáticamente a todos los usuarios con rol `Admin` o `Cajero` (trigger `fn_repartir_notificacion`).

---

## 9. Generación de Reportes

Los reportes se generan **localmente** leyendo de Dexie, sin necesidad de conexión.

- **Excel:** SheetJS — misma lógica que la función Flutter `exportarReportePendientesExcel()` migrada a JS
- **PDF:** jsPDF
- Campos monetarios en formato colombiano: `NumberFormat.currency(locale: 'es_CO', symbol: '$')`

---

## 10. Variables de Entorno

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 11. Convenciones de Código

- Campos internos de Dexie (no existen en Supabase) van prefijados con `_`: `_sync_status`, `_local_id`
- Antes de enviar a Supabase, siempre limpiar estos campos con `limpiarPayload()` en `syncEngine.ts`
- Los tipos de Dexie **extienden** los tipos generados por Supabase, nunca los redefinen desde cero
- `db` y `syncEngine` son singletons — importar la instancia, no la clase
- Un módulo nunca llama a Supabase directamente — siempre escribe en Dexie primero y encola en `sync_queue`

---

## 12. Pendientes y Decisiones Abiertas

- [ ] Inventario completo de vistas SQL y su equivalente JS (Fase 1)
- [ ] Implementar `fn_contar_dias_abiertos` en JS para cálculos de mora offline
- [ ] Definir estrategia para registros creados offline que fallan al sincronizar (conflictos)
- [ ] UI del indicador de sincronización (contador de pendientes, barra de estado)
- [ ] Manejo de sesión expirada mientras se está offline