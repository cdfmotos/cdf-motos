export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string): string {
  // Asegurarnos de que las fechas 'YYYY-MM-DD' puras se parseen en hora local
  // agregando "T00:00:00" para evitar que JS lo tome como UTC puro
  const date = dateString.length === 10 ? new Date(`${dateString}T00:00:00`) : new Date(dateString);
  
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}