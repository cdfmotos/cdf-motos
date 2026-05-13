-- ============================================
-- FUNCIÓN: asignar_numero_recaudo
-- ============================================

CREATE OR REPLACE FUNCTION public.asignar_numero_recaudo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.numero_recaudo := nextval('recaudo_numero_seq')::text;
  RETURN NEW;
END;
$$;


-- ============================================
-- FUNCIÓN: fn_calc_saldos_recaudo
-- ============================================

CREATE OR REPLACE FUNCTION public.fn_calc_saldos_recaudo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  prev_saldo NUMERIC;
BEGIN
  -- Buscar recaudo anterior estrictamente al actual
  -- (fecha menor o mismo día pero ID menor)
  SELECT nuevo_saldo
  INTO prev_saldo
  FROM public.recaudo
  WHERE contrato_id = NEW.contrato_id
    AND (
      fecha_recaudo < NEW.fecha_recaudo
      OR (
        fecha_recaudo = NEW.fecha_recaudo
        AND id < NEW.id
      )
    )
  ORDER BY fecha_recaudo DESC, id DESC
  LIMIT 1;

  -- Si no encuentra recaudo anterior, usar valor del contrato
  IF NOT FOUND THEN
    SELECT valor_contrato
    INTO prev_saldo
    FROM public.contratos
    WHERE id = NEW.contrato_id;
  END IF;

  NEW.saldo_pendiente := prev_saldo;

  NEW.nuevo_saldo :=
    prev_saldo - NEW.monto_recaudado;

  NEW.dias_pagados :=
    FLOOR(
      NEW.monto_recaudado / NEW.cuota_diaria_pactada
    );

  NEW.abono :=
    GREATEST(
      NEW.monto_recaudado - (
        NEW.cuota_diaria_pactada * NEW.dias_pagados
      ),
      0
    );

  RETURN NEW;
END;
$$;


-- ============================================
-- FUNCIÓN: trg_recalcular_saldos
-- ============================================

CREATE OR REPLACE FUNCTION public.trg_recalcular_saldos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM recalcular_saldos(NEW.contrato_id);
  RETURN NEW;
END;
$$;