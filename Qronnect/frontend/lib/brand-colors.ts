/**
 * Convierte un color hex a formato RGB para usar en inline styles
 * @param hex - Color en formato hex (#RRGGBB)
 * @returns Color en formato "rgb(r, g, b)"
 */
export function hexToRgb(hex: string): string {
  const match = hex.match(/\w\w/g)
  if (!match) return 'rgb(0, 0, 0)'
  const [r, g, b] = match.map(x => parseInt(x, 16))
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Hook de utilidad para obtener estilos de marca para inline styles
 * Úsalo cuando necesites aplicar colores de marca con inline styles
 */
export function useBrandStyles() {
  // Este hook está pensado para ser usado desde componentes client
  // que ya tengan acceso al branding context
  return {
    primaryBg: (color: string) => ({ backgroundColor: hexToRgb(color) }),
    primaryText: (color: string) => ({ color: hexToRgb(color) }),
    accentText: (color: string) => ({ color: hexToRgb(color) }),
    primaryBorder: (color: string) => ({ borderColor: hexToRgb(color) }),
  }
}
