export function validateMotoForm(data: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.placa?.trim()) errors.placa = 'La placa es obligatoria';
  if (!data.fecha_compra?.trim()) errors.fecha_compra = 'La fecha de compra es obligatoria';
  if (!data.marca?.trim()) errors.marca = 'La marca es obligatoria';
  if (!data.modelo?.trim()) errors.modelo = 'El modelo es obligatorio';
  if (!String(data.anio)?.trim()) errors.anio = 'El año es obligatorio';
  if (!data.color?.trim()) errors.color = 'El color es obligatorio';
  if (!data.motor?.trim()) errors.motor = 'El motor es obligatorio';
  if (!data.chasis_vin?.trim()) errors.chasis_vin = 'El chasis / VIN es obligatorio';
  if (!data.propietario?.trim()) errors.propietario = 'El propietario es obligatorio';

  return errors;
}
