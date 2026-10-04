/** Puntos del programa de referidos de la tienda (los devuelve /api/referidos/mi-codigo) */
export interface PremiosReferido {
  registro_tu: number
  registro_amigo: number
  primera_compra_tu: number
  primera_compra_amigo: number
}

const pts = (n: number) => `${n.toLocaleString('es-ES')} puntos`

/** Frase corta con lo que gana quien invita, para subtítulos */
export function resumenPremioReferido(premios?: PremiosReferido | null): string {
  if (!premios) return 'Comparte tu código con tus amigos.'
  const tu = premios.registro_tu + premios.primera_compra_tu
  const amigo = premios.registro_amigo + premios.primera_compra_amigo
  if (tu > 0 && amigo > 0) return `Tú ganas puntos por cada amigo que se une, y tu amigo también.`
  if (tu > 0) return 'Ganas puntos por cada amigo que se une con tu código.'
  if (amigo > 0) return 'Tu amigo se lleva puntos de regalo al unirse con tu código.'
  return 'Comparte tu código con tus amigos.'
}

/** Mensaje que se comparte por WhatsApp, email, etc. */
export function mensajeInvitacion(tienda: string, codigo: string, url: string, premios?: PremiosReferido | null) {
  const regalo = premios && premios.registro_amigo > 0 ? ` y llévate ${pts(premios.registro_amigo)} de regalo` : ''
  return `¡Únete a ${tienda}! Regístrate con mi código ${codigo}${regalo}: ${url}`
}

/** Filas "cuándo / tú / tu amigo" con los premios que no son cero */
export function filasPremioReferido(premios?: PremiosReferido | null) {
  if (!premios) return []
  return [
    { cuando: 'Cuando se une con tu código', tu: premios.registro_tu, amigo: premios.registro_amigo },
    { cuando: 'En su primera compra', tu: premios.primera_compra_tu, amigo: premios.primera_compra_amigo },
  ].filter((f) => f.tu > 0 || f.amigo > 0)
}
