/** Importe en euros con formato español: 1234.5 → "1234,50 €" */
export function eur(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? parseFloat(value) : value ?? 0
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number.isFinite(n) ? n : 0)
}
