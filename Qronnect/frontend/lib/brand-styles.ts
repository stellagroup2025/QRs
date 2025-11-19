/**
 * Utilidades para aplicar estilos de marca usando CSS variables
 * Compatible con Tailwind CSS v4
 */

export const brandStyles = {
  // Backgrounds
  bgPrimary: { backgroundColor: 'rgb(var(--brand-primary))' } as React.CSSProperties,
  bgSecondary: { backgroundColor: 'rgb(var(--brand-secondary))' } as React.CSSProperties,
  bgAccent: { backgroundColor: 'rgb(var(--brand-accent))' } as React.CSSProperties,

  // Text colors
  textPrimary: { color: 'rgb(var(--brand-primary))' } as React.CSSProperties,
  textSecondary: { color: 'rgb(var(--brand-secondary))' } as React.CSSProperties,
  textAccent: { color: 'rgb(var(--brand-accent))' } as React.CSSProperties,

  // Borders
  borderPrimary: { borderColor: 'rgb(var(--brand-primary))' } as React.CSSProperties,
  borderSecondary: { borderColor: 'rgb(var(--brand-secondary))' } as React.CSSProperties,
  borderAccent: { borderColor: 'rgb(var(--brand-accent))' } as React.CSSProperties,
}

/**
 * Genera className string con opacidad para colores de marca
 * Usa esto cuando necesites opacidad con Tailwind
 */
export function brandClass(color: 'primary' | 'secondary' | 'accent', type: 'bg' | 'text' | 'border', opacity?: number): string {
  const base = `${type}-[rgb(var(--brand-${color})${opacity ? `/${opacity}` : ''}))]`
  return base
}
