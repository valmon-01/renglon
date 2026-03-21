/**
 * Devuelve la fecha local del dispositivo en formato YYYY-MM-DD.
 * Evita el bug de UTC donde usuarios en Argentina (UTC-3) obtienen
 * la fecha de ayer si escriben antes de las 21:00.
 */
export function getFechaLocal(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}
