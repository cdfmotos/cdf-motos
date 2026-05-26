create or replace view public.vista_asistencia_historica_v3_detalle
with (security_invoker = on) as

with
-- =====================================================
-- CONTRATOS ACTIVOS
-- =====================================================
contratos_activos as (
    select
        c.id,
        c.placa,
        c.cliente_cedula,
        c.tipo_contrato,
        c.fecha_inicio::date as fecha_inicio,
        c.estado,
        c.valor_contrato,
        c.cuota_diaria
    from contratos c
    where c.estado = 'Activo'
),

-- =====================================================
-- DÍAS OPERATIVOS
-- =====================================================
dias_operativos as (
    select distinct
        es.fecha::date as fecha
    from estado_sistema es
    where es.abierto = true
),

-- =====================================================
-- RECAUDOS AGRUPADOS POR DÍA
-- =====================================================
recaudos_diarios as (
    select
        r.contrato_id,
        r.fecha_recaudo::date as fecha,

        coalesce(sum(r.monto_recaudado), 0::numeric) as monto_recaudado_dia,

        coalesce(sum(r.abono), 0::numeric) as abono_dia,

        coalesce(sum(r.monto_recaudado), 0::numeric)
        + coalesce(sum(r.abono), 0::numeric) as total_recaudado_dia

    from recaudo r
    group by
        r.contrato_id,
        r.fecha_recaudo::date
),

-- =====================================================
-- TODAS LAS FECHAS RELEVANTES
-- =====================================================
fechas_relevantes as (
    select fecha from dias_operativos

    union

    select fecha from recaudos_diarios
),

-- =====================================================
-- SALDO PREVIO A FECHA INICIO
-- =====================================================
saldo_previo as (
    select
        c.id as contrato_id,

        coalesce(sum(rd.total_recaudado_dia), 0::numeric) as saldo_previo

    from contratos_activos c

    left join recaudos_diarios rd
        on rd.contrato_id = c.id
       and rd.fecha < c.fecha_inicio

    group by c.id
),

-- =====================================================
-- BASE
-- =====================================================
base as (
    select
        c.id as contrato_id,
        c.placa,
        c.cliente_cedula,
        c.tipo_contrato,
        c.fecha_inicio,
        c.estado,
        c.valor_contrato,
        c.cuota_diaria,

        f.fecha,

        exists (
            select 1
            from dias_operativos d
            where d.fecha = f.fecha
        ) as sistema_abierto,

        coalesce(rd.monto_recaudado_dia, 0::numeric) as monto_recaudado_dia,

        coalesce(rd.abono_dia, 0::numeric) as abono_dia,

        coalesce(rd.total_recaudado_dia, 0::numeric) as total_recaudado_dia,

        coalesce(sp.saldo_previo, 0::numeric) as saldo_previo

    from contratos_activos c

    join fechas_relevantes f
        on f.fecha >= c.fecha_inicio

    left join recaudos_diarios rd
        on rd.contrato_id = c.id
       and rd.fecha = f.fecha

    left join saldo_previo sp
        on sp.contrato_id = c.id
),

-- =====================================================
-- ACUMULADOS
-- =====================================================
acumulado as (
    select
        b.*,

        -- TOTAL RECAUDADO HISTÓRICO
        b.saldo_previo
        + sum(b.total_recaudado_dia) over (
            partition by b.contrato_id
            order by b.fecha
            rows between unbounded preceding and current row
        ) as total_recaudado_acumulado,

        -- CUÁNTO DEBERÍA HABER PAGADO HASTA ESA FECHA
        sum(
            case
                when b.sistema_abierto
                then b.cuota_diaria
                else 0::numeric
            end
        ) over (
            partition by b.contrato_id
            order by b.fecha
            rows between unbounded preceding and current row
        ) as recaudo_esperado_acumulado

    from base b
)

-- =====================================================
-- RESULTADO FINAL
-- =====================================================
select

    a.fecha,

    a.contrato_id,
    a.placa,
    a.cliente_cedula,
    a.tipo_contrato,

    a.fecha_inicio,
    a.estado,

    a.valor_contrato,
    a.cuota_diaria,

    a.sistema_abierto,

    -- =========================
    -- RECAUDO DEL DÍA
    -- =========================
    a.monto_recaudado_dia,
    a.abono_dia,
    a.total_recaudado_dia,

    -- =========================
    -- TOTAL HISTÓRICO RECAUDADO
    -- =========================
    a.total_recaudado_acumulado,

    -- =========================
    -- CUÁNTO DEBÍA HABER PAGADO
    -- =========================
    a.recaudo_esperado_acumulado,

    -- =========================
    -- SALDO A FAVOR O EN CONTRA
    -- =========================
    (
        a.total_recaudado_acumulado
        - a.recaudo_esperado_acumulado
    ) as saldo_acumulado,

    -- =========================
    -- CUÁNTOS DÍAS FUTUROS CUBRE
    -- =========================
    floor(
        greatest(
            (
                a.total_recaudado_acumulado
                - a.recaudo_esperado_acumulado
            ),
            0
        ) / nullif(a.cuota_diaria, 0::numeric)
    ) as dias_cubiertos,

    -- =========================
    -- ASISTENCIA
    -- =========================
    case
        when a.sistema_abierto
         and a.total_recaudado_acumulado >= a.recaudo_esperado_acumulado
        then true
        else false
    end as asistio,

    -- =========================
    -- ESTADO DEL DÍA
    -- =========================
    case

        when not a.sistema_abierto
        then 'SISTEMA_CERRADO'

        when a.total_recaudado_dia > 0
         and a.total_recaudado_acumulado >= a.recaudo_esperado_acumulado
        then 'PAGO_DEL_DIA'

        when a.total_recaudado_dia = 0
         and a.total_recaudado_acumulado >= a.recaudo_esperado_acumulado
        then 'CUBIERTO_POR_ABONO'

        else 'NO_CUBIERTO'

    end as estado_dia

from acumulado a

order by
    a.fecha,
    a.contrato_id;

    create or replace view public.vista_asistencia_historica_v3
with (security_invoker = on) as
select
    d.fecha,
    count(*) filter (where d.sistema_abierto) as total_esperados,
    count(*) filter (where d.sistema_abierto and d.asistio) as asistencia_contratos,
    round(
        count(*) filter (where d.sistema_abierto and d.asistio)::numeric
        / nullif(count(*) filter (where d.sistema_abierto), 0)::numeric * 100::numeric,
        2
    ) as pct_total,

    count(*) filter (where d.sistema_abierto and d.tipo_contrato = 'Moto') as motos_esperadas,
    count(*) filter (where d.sistema_abierto and d.tipo_contrato = 'Moto' and d.asistio) as asistencia_motos,
    round(
        count(*) filter (where d.sistema_abierto and d.tipo_contrato = 'Moto' and d.asistio)::numeric
        / nullif(count(*) filter (where d.sistema_abierto and d.tipo_contrato = 'Moto'), 0)::numeric * 100::numeric,
        2
    ) as pct_motos,

    count(*) filter (where d.sistema_abierto and d.tipo_contrato = 'Prestamo') as prestamos_esperados,
    count(*) filter (where d.sistema_abierto and d.tipo_contrato = 'Prestamo' and d.asistio) as asistencia_prestamos,
    round(
        count(*) filter (where d.sistema_abierto and d.tipo_contrato = 'Prestamo' and d.asistio)::numeric
        / nullif(count(*) filter (where d.sistema_abierto and d.tipo_contrato = 'Prestamo'), 0)::numeric * 100::numeric,
        2
    ) as pct_prestamos
from public.vista_asistencia_historica_v3_detalle d
where d.sistema_abierto = true
group by d.fecha
order by d.fecha;

-- =========================================================
create or replace view public.vista_asistencia_historica_v3_global
with (security_invoker = on) as
select
    count(*) as dias_operativos,
    sum(v.total_esperados) as total_esperados,
    sum(v.asistencia_contratos) as asistencia_contratos,
    round(
        sum(v.asistencia_contratos)::numeric
        / nullif(sum(v.total_esperados), 0)::numeric * 100::numeric,
        2
    ) as pct_total_global,

    sum(v.motos_esperadas) as motos_esperadas,
    sum(v.asistencia_motos) as asistencia_motos,
    round(
        sum(v.asistencia_motos)::numeric
        / nullif(sum(v.motos_esperadas), 0)::numeric * 100::numeric,
        2
    ) as pct_motos_global,

    sum(v.prestamos_esperados) as prestamos_esperados,
    sum(v.asistencia_prestamos) as asistencia_prestamos,
    round(
        sum(v.asistencia_prestamos)::numeric
        / nullif(sum(v.prestamos_esperados), 0)::numeric * 100::numeric,
        2
    ) as pct_prestamos_global
from public.vista_asistencia_historica_v3 v;