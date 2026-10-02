/**
 * Contenido de las landings de venta por sector (qronnect.es/para/<sector>)
 *
 * Cada sector define su paleta, sus textos y las fotos que usa. Las fotos viven en
 * /public/sectores/<slug>/ y, si no existen, la página muestra un panel de color.
 */

export type SectorIcon =
  | 'gift' | 'megaphone' | 'users' | 'chart' | 'gem' | 'tag' | 'share'
  | 'calendar' | 'mail' | 'phone' | 'stamp' | 'history' | 'heart' | 'star'

export interface SectorFeature {
  icon: SectorIcon
  title: string
  text?: string
}

export interface SectorStat {
  value: string
  label: string
}

export interface SectorPromo {
  title: string
  text: string
  photo: string
  icon: SectorIcon
}

export interface SectorData {
  slug: string
  /** Nombre del sector para menús, breadcrumbs y SEO */
  nombre: string
  seo: { title: string; description: string; keywords: string[] }
  /** Paleta del sector: principal (botones), tinta (titulares) y fondo suave */
  palette: { primary: string; primaryOn: string; ink: string; soft: string; softer: string }
  /** Nombre ficticio del negocio que aparece en el móvil y en el expositor */
  demoBusiness: { name: string; tagline: string }
  hero: {
    titleStart: string
    titleHighlight: string
    subtitle: string
    features: SectorFeature[]
    photo: string
  }
  /** Lo que ve la clienta en el móvil */
  phone: {
    points: number
    progressLabel: string
    progress: number
    items: { icon: SectorIcon; label: string }[]
    reward: { title: string; photo: string }
  }
  rewardBanner: { title: string; text: string; cta: string; photo: string }
  valueProps: SectorFeature[]
  stats: SectorStat[]
  services: { title: string; items: string[]; photo: string }
  promos: { titleStart: string; titleHighlight: string; items: SectorPromo[] }
  qrStand: { caption: string; photo: string }
  testimonial: { quote: string; author: string; role: string; photo: string }
  platform: SectorFeature[]
  finalCta: {
    titleStart: string
    titleHighlight: string
    titleEnd: string
    subtitle: string
    photo: string
    notifications: { icon: SectorIcon; title: string; text: string }[]
  }
  faq: { q: string; a: string }[]
}

const estetica: SectorData = {
  slug: 'estetica',
  nombre: 'Estética y belleza',
  seo: {
    title: 'Programa de fidelización para centros de estética y salones de uñas',
    description:
      'Convierte cada visita en una clienta fiel: puntos y sellos digitales, promociones automáticas y referidos para tu salón de estética, uñas o peluquería. Sin apps.',
    keywords: [
      'fidelización centro de estética',
      'programa de puntos salón de uñas',
      'tarjeta de sellos digital estética',
      'fidelizar clientas peluquería',
      'marketing salón de belleza',
    ],
  },
  palette: {
    primary: '#E0115F',
    primaryOn: '#FFFFFF',
    ink: '#4A0D2E',
    soft: '#FCE4EC',
    softer: '#FFF5F8',
  },
  demoBusiness: { name: 'Tu Salón', tagline: 'Estética & Uñas' },
  hero: {
    titleStart: 'Belleza que siempre',
    titleHighlight: 'vuelve',
    subtitle:
      'Convierte cada visita en una clienta fiel con un programa de puntos, promociones y experiencias diseñadas para tu salón de estética y uñas.',
    features: [
      { icon: 'gift', title: 'Puntos y sellos digitales', text: 'Premia cada visita, tratamiento o compra.' },
      { icon: 'megaphone', title: 'Promociones automáticas', text: 'Atrae más reservas en los días que necesitas.' },
      { icon: 'users', title: 'Más clientas fieles', text: 'Programa de referidos y recomendaciones.' },
      { icon: 'chart', title: 'Todo en una plataforma', text: 'Campañas, historial y métricas de tu salón.' },
    ],
    photo: '/sectores/estetica/hero.webp',
  },
  phone: {
    points: 320,
    progressLabel: 'A 1 visita de tu recompensa',
    progress: 0.82,
    items: [
      { icon: 'tag', label: 'Promociones exclusivas' },
      { icon: 'stamp', label: 'Mi tarjeta de sellos' },
      { icon: 'history', label: 'Tu historial' },
      { icon: 'users', label: 'Invita a una amiga' },
    ],
    reward: { title: 'Tu próxima manicura gratis', photo: '/sectores/estetica/manicura.webp' },
  },
  rewardBanner: {
    title: 'Tu próxima manicura gratis',
    text: 'Acumula puntos en cada visita y disfruta de recompensas exclusivas.',
    cta: 'Descubre los premios',
    photo: '/sectores/estetica/manicura.webp',
  },
  valueProps: [
    { icon: 'gem', title: 'Premia a tus clientas', text: 'Puntos por cada visita, tratamiento o compra.' },
    { icon: 'megaphone', title: 'Lanza promociones al instante', text: 'Atrae más reservas en los días que necesites.' },
    { icon: 'users', title: 'Convierte clientas en embajadoras', text: 'Programa de referidos y recompensas.' },
  ],
  stats: [
    { value: '+40%', label: 'clientas recurrentes' },
    { value: '+25%', label: 'aumento del ticket medio' },
    { value: '-60%', label: 'tiempo en gestión manual' },
  ],
  services: {
    title: 'Tratamientos que premian tu confianza',
    items: ['Faciales', 'Manicura y pedicura', 'Depilación', 'Pestañas y cejas', 'Y mucho más'],
    photo: '/sectores/estetica/pestanas.webp',
  },
  promos: {
    titleStart: 'Promociones que',
    titleHighlight: 'encantan',
    items: [
      { title: 'Por tu cumpleaños', text: 'Regalo especial', photo: '/sectores/estetica/cumpleanos.webp', icon: 'gift' },
      { title: 'Trae a una amiga', text: 'Y ganad puntos', photo: '/sectores/estetica/amigas.webp', icon: 'users' },
      { title: 'Días especiales', text: 'Promociones exclusivas', photo: '/sectores/estetica/facial.webp', icon: 'tag' },
    ],
  },
  qrStand: { caption: 'Escanea y empieza a acumular puntos', photo: '/sectores/estetica/expositor.webp' },
  testimonial: {
    quote:
      'Desde que tenemos Qronnect nuestras clientas vuelven mucho más y además reservan más tratamientos.',
    author: 'Laura M.',
    role: 'Propietaria de salón de uñas',
    photo: '/sectores/estetica/testimonio.webp',
  },
  platform: [
    { icon: 'gift', title: 'Puntos y sellos' },
    { icon: 'tag', title: 'Promociones personalizadas' },
    { icon: 'share', title: 'Referidos' },
    { icon: 'mail', title: 'Campañas email/SMS' },
    { icon: 'chart', title: 'Informes y KPIs' },
    { icon: 'phone', title: 'Todo en el móvil de tus clientas' },
  ],
  finalCta: {
    titleStart: 'Convierte cada visita',
    titleHighlight: 'historia',
    titleEnd: 'que continúa',
    subtitle: 'Empieza hoy a fidelizar con Qronnect.',
    photo: '/sectores/estetica/esmalte.webp',
    notifications: [
      { icon: 'users', title: 'Nueva clienta', text: '+100 puntos de bienvenida' },
      { icon: 'calendar', title: 'Visita registrada', text: 'Manicura semipermanente' },
      { icon: 'gift', title: '¡Recompensa desbloqueada!', text: 'Tu próxima manicura gratis' },
    ],
  },
  faq: [
    {
      q: '¿Mis clientas tienen que descargar una app?',
      a: 'No. Se registran en 30 segundos desde el móvil escaneando tu QR y su tarjeta funciona en el navegador.',
    },
    {
      q: '¿Puedo premiar tratamientos distintos de forma diferente?',
      a: 'Sí. Puedes dar puntos por importe, crear tarjetas de sellos por tratamiento (por ejemplo, la sexta manicura gratis) y lanzar promociones para servicios concretos.',
    },
    {
      q: '¿La tarjeta lleva la imagen de mi salón?',
      a: 'Sí. Tus clientas ven tu logo y tus colores en su tarjeta, en las promociones y en los emails que les envías.',
    },
    {
      q: '¿Qué pasa con los datos de mis clientas?',
      a: 'Son tuyos. Se tratan conforme al RGPD y cada clienta puede darse de baja de las comunicaciones cuando quiera.',
    },
  ],
}

export const SECTORES: Record<string, SectorData> = {
  [estetica.slug]: estetica,
}

export function getSector(slug: string): SectorData | undefined {
  return SECTORES[slug]
}
