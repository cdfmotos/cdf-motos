export function limpiarPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const datos = { ...payload };
  delete datos._sync_status;
  delete datos._local_id;
  delete datos.id;
  return datos;
}