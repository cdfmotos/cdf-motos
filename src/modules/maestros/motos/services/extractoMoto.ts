export async function getExtractoMoto(db: any, placa: string) {
  const contratos = await db.contratos
    .where('placa')
    .equalsIgnoreCase(placa)
    .toArray();
    
  return contratos.sort((a: any, b: any) => {
     return new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime();
  }).map((c: any) => ({
    numero_contrato: c.id,
    placa: c.placa,
    cedula: c.cliente_cedula,
    valor_contrato: c.valor_contrato,
    cuota_diaria: c.cuota_diaria,
    fecha_compra: c.fecha_inicio,
    tipo_contrato: c.tipo_contrato
  }));
}
