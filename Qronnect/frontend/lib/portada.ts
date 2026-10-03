import type { SectorIcon, SectorShowcase } from '@/lib/sectores'

/**
 * Contenido de la portada de qronnect.es (landing de producto).
 * Solo cuenta funciones que existen en el producto; si algo cambia, se cambia aquí.
 */

/** Paleta de la marca Qronnect, sacada del turquesa del logo */
export const PORTADA_PALETTE = {
  primary: '#0E7C86',
  primaryOn: '#FFFFFF',
  ink: '#0B1F22',
  dark: '#061619',
  soft: '#D3F1EF',
  softer: '#F4FAF9',
  accentOnDark: '#6FE0D6',
}

/** Datos del móvil de ejemplo y del "Cómo funciona", sin sector concreto */
export const PORTADA_SHOWCASE: SectorShowcase = {
  slug: '',
  palette: PORTADA_PALETTE,
  demoBusiness: { name: 'Tu Negocio', tagline: 'Gracias por volver' },
  phone: {
    points: 320,
    progressLabel: 'Te faltan 80 puntos para tu premio',
    progress: 0.8,
    items: [
      { icon: 'stamp', label: 'Mi tarjeta de sellos' },
      { icon: 'tag', label: 'Promociones para ti' },
      { icon: 'gift', label: 'Máquina de premios' },
      { icon: 'users', label: 'Invita a un amigo' },
    ],
    reward: { title: 'Tu próximo premio', photo: '/sectores/cafeterias/cafe.webp' },
  },
  howItWorks: {
    title: 'Así funciona Qronnect',
    intro:
      'Todo gira alrededor de un QR: tu cliente lo escanea una vez para unirse y, a partir de ahí, en cada visita tu equipo le suma puntos escaneando el QR de su móvil.',
    steps: [
      { who: 'Tú', visual: 'setup', title: 'Configuras tu programa', text: 'En el asistente de alta eliges tu logo y tus colores, cuántos puntos da cada euro, el regalo de bienvenida y el premio por traer a un amigo.' },
      { who: 'Tú', visual: 'qr', title: 'Pones tu QR a la vista', text: 'Descargas tu QR y lo colocas en el mostrador, la mesa, el escaparate o donde más lo vean.' },
      { who: 'Tu cliente', visual: 'signup', title: 'Lo escanea y se une', text: 'Con la cámara del móvil, deja su nombre y su email en 30 segundos. Sin descargar ninguna app.' },
      { who: 'Tu equipo', visual: 'scan', title: 'Suma en cada visita', text: 'Al cobrar, escanea el QR del móvil del cliente e introduce el importe para sumarle sus puntos o su sello.' },
      { who: 'Tu cliente', visual: 'reward', title: 'Consigue su premio', text: 'Al llegar a los puntos le llega su cupón, y lo canjea en su siguiente visita.' },
      { who: 'Tú', visual: 'results', title: 'Ves quién vuelve', text: 'Desde tu panel ves la frecuencia y el ticket medio de tus clientes, y les envías promociones por email o SMS.' },
    ],
  },
}

export interface PortadaFeature {
  icon: SectorIcon
  title: string
  text: string
}

export const PORTADA_FEATURES: PortadaFeature[] = [
  { icon: 'stamp', title: 'Puntos y tarjeta de sellos', text: 'Tú decides cuántos puntos da cada euro o cada visita. Sin cartones que se pierden.' },
  { icon: 'gift', title: 'Premios y cupones', text: 'Regalo de bienvenida, premios por puntos y cupones con código único que tu equipo valida al momento.' },
  { icon: 'sparkles', title: 'Máquina de premios', text: 'Tus clientes cambian puntos por una tirada con premios sorpresa. Un juego que da ganas de volver.' },
  { icon: 'share', title: 'Referidos', text: 'Cada cliente invita con su enlace: gana puntos por cada amigo que se une, y su amigo se lleva el regalo de bienvenida.' },
  { icon: 'megaphone', title: 'Campañas por email y SMS', text: 'Envía ofertas a quien toca: por ticket medio, puntos, cumpleaños o días sin venir. Ahora o programadas.' },
  { icon: 'chart', title: 'Informe mensual con IA', text: 'Cada mes, tus números comparados con el anterior y un plan de acción para el siguiente, en tu email.' },
  { icon: 'scan', title: 'Escáner para tu equipo', text: 'Tu equipo suma puntos y canjea premios escaneando el QR del cliente desde su propio móvil.' },
  { icon: 'palette', title: 'Con tu marca', text: 'Tu logo, tus colores y tu propia página para clientes. Ellos ven tu negocio, no el nuestro.' },
]

export interface PortadaPlan {
  nombre: string
  precio: number
  /** Texto que acompaña al precio */
  periodo: string
  descripcion: string
  limites: string[]
  destacado?: boolean
}

/**
 * Mismos planes y límites que la tabla `planes` de la base de datos
 * (backend/supabase/migrations/20241207_planes.sql). Si cambian allí, hay que cambiarlos aquí.
 */
export const PORTADA_PLANES: PortadaPlan[] = [
  { nombre: 'Demo', precio: 0, periodo: 'durante 2 meses', descripcion: 'Para probarlo en tu negocio', limites: ['1 establecimiento', 'Hasta 50 clientes'] },
  { nombre: 'Starter', precio: 29, periodo: '/mes', descripcion: 'Para un negocio con clientela fija', limites: ['1 establecimiento', 'Hasta 500 clientes', 'Estadísticas'] },
  { nombre: 'Business', precio: 79, periodo: '/mes', descripcion: 'Para negocios con varios locales', limites: ['Hasta 3 establecimientos', 'Hasta 2.000 clientes', 'Estadísticas'], destacado: true },
  { nombre: 'Enterprise', precio: 150, periodo: '/mes', descripcion: 'Para cadenas y franquicias', limites: ['Hasta 10 establecimientos', 'Hasta 10.000 clientes', 'Estadísticas'] },
]

export const PORTADA_FAQ: { q: string; a: string }[] = [
  { q: '¿Mis clientes tienen que descargar una app?', a: 'No. Escanean tu QR con la cámara del móvil y se unen desde el navegador. Pueden guardar su tarjeta en la pantalla de inicio si quieren.' },
  { q: '¿Qué necesito para empezar?', a: 'Un móvil para tu equipo y un sitio donde poner tu QR. En el asistente de alta eliges tu logo, tus colores, tus puntos y tus premios.' },
  { q: '¿Cómo suman puntos mis clientes?', a: 'Al cobrar, tu equipo escanea el QR del móvil del cliente e introduce el importe. Los puntos se suman al momento.' },
  { q: '¿Puedo enviar promociones?', a: 'Sí, por email y por SMS. Puedes elegir a quién: por ticket medio, puntos acumulados, cumpleaños o días desde su última visita, y enviarlas ahora o programarlas.' },
  { q: '¿Sirve para mi tipo de negocio?', a: 'Si tus clientes pueden volver, sí: cafeterías, restaurantes, salones de belleza, gimnasios, tiendas… Mira los ejemplos por sector más arriba.' },
  { q: '¿Qué pasa con los datos de mis clientes?', a: 'Son tuyos. Se tratan conforme al RGPD y cada cliente puede darse de baja de las comunicaciones cuando quiera.' },
]
