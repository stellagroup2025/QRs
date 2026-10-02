/**
 * Contenido de las landings de venta por sector (qronnect.es/para/<sector>)
 *
 * Cada sector define su paleta, sus textos y las fotos que usa. Las fotos viven en
 * /public/sectores/<slug>/ y, si no existen, la página muestra un panel de color.
 */

export type SectorIcon =
  | 'gift' | 'megaphone' | 'users' | 'chart' | 'gem' | 'tag' | 'share' | 'calendar'
  | 'mail' | 'phone' | 'stamp' | 'history' | 'heart' | 'star' | 'qr' | 'scan'
  | 'coffee' | 'sparkles' | 'clock' | 'palette'

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

/** Fila de texto + foto que alterna de lado */
export interface SectorStory {
  titleStart: string
  titleHighlight: string
  lead: string
  body: string
  photo: string
}

export interface SectorData {
  slug: string
  /** Nombre del sector para menús, breadcrumbs y SEO */
  nombre: string
  seo: { title: string; description: string; keywords: string[] }
  /**
   * Paleta: principal (botones y cabecera), tinta (titulares), fondos suaves y
   * dos acentos para iconos y cifras
   */
  palette: {
    primary: string
    primaryOn: string
    ink: string
    soft: string
    softer: string
    accents: [string, string]
  }
  /** Nombre ficticio del negocio que aparece en la tarjeta, el panel y el expositor */
  demoBusiness: { name: string; tagline: string }
  hero: {
    eyebrow: string
    titleStart: string
    titleHighlight: string
    subtitle: string
    /** Frase corta bajo el botón que quita fricción */
    reassurance: string
    photo: string
  }
  /** Tarjeta de sellos que se ve en el móvil del hero */
  stampCard: {
    icon: SectorIcon
    line1: string
    line2: string
    total: number
    filled: string[]
  }
  /** Cifras del panel del negocio que asoma detrás del móvil */
  dashboard: { redemptions: string; newMembers: string; members: string }
  proof: { text: string; stats: SectorStat[] }
  features: { eyebrow: string; title1: string; title2: string; items: SectorFeature[] }
  stories: SectorStory[]
  steps: SectorFeature[]
  promos: { titleStart: string; titleHighlight: string; items: SectorPromo[] }
  testimonial: { quote: string; author: string; role: string; photo: string }
  /** Resultados que se citan junto al testimonio (con nota al pie) */
  results: { stats: SectorStat[]; footnote: string }
  finalCta: { titleStart: string; titleHighlight: string; subtitle: string; qrCaption: string }
  faq: { q: string; a: string }[]
}

const commonSteps = (who: string, place: string): SectorFeature[] => [
  {
    icon: 'qr',
    title: 'Escanea y únete',
    text: `${who} escanea el QR de tu mostrador y se registra en 30 segundos, sin descargar ninguna app.`,
  },
  {
    icon: 'stamp',
    title: 'Suma sellos y puntos',
    text: 'En cada visita enseña su QR desde el móvil y tu equipo le suma el sello o los puntos al momento.',
  },
  {
    icon: 'gift',
    title: 'Disfruta su premio',
    text: `Al completar la tarjeta recibe su cupón y lo canjea en ${place}. Y vuelta a empezar.`,
  },
]

const estetica: SectorData = {
  slug: 'estetica',
  nombre: 'Estética y belleza',
  seo: {
    title: 'Programa de fidelización para centros de estética y salones de uñas',
    description:
      'Convierte cada visita en una clienta fiel: tarjeta de sellos digital, puntos, promociones y referidos para tu salón de estética, uñas o peluquería. Sin apps.',
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
    ink: '#3B0A26',
    soft: '#FCE4EC',
    softer: '#FFF4F7',
    accents: ['#8B5CF6', '#F59E0B'],
  },
  demoBusiness: { name: 'Tu Salón', tagline: 'Estética & Uñas' },
  hero: {
    eyebrow: 'Fidelización para centros de estética',
    titleStart: 'Belleza que siempre',
    titleHighlight: 'vuelve',
    subtitle:
      'Qronnect convierte la tarjeta de cartón en un programa de fidelización digital para tu salón: sellos, puntos, promociones y clientas que vuelven.',
    reassurance: 'Tus clientas no descargan ninguna app.',
    photo: '/sectores/estetica/hero.webp',
  },
  stampCard: {
    icon: 'sparkles',
    line1: '5 MANICURAS',
    line2: 'LA 6ª GRATIS',
    total: 6,
    filled: ['02/09', '16/09', '30/09', '14/10'],
  },
  dashboard: { redemptions: '312', newMembers: '1.240', members: '1.618' },
  proof: {
    text: 'Una tarjeta de sellos con la imagen de tu salón, siempre en el móvil de tus clientas.',
    stats: [
      { value: '30 s', label: 'para que una clienta se registre' },
      { value: '0', label: 'apps que descargar' },
      { value: '100 %', label: 'con tu logo y tus colores' },
    ],
  },
  features: {
    eyebrow: 'Todo lo que necesitas para fidelizar',
    title1: 'Más que una tarjeta de sellos.',
    title2: 'Una experiencia que hace volver.',
    items: [
      { icon: 'stamp', title: 'Sellos y puntos digitales', text: 'Premia cada visita, tratamiento o compra.' },
      { icon: 'megaphone', title: 'Promociones automáticas', text: 'Llena los huecos de la agenda en los días flojos.' },
      { icon: 'users', title: 'Referidos', text: 'Tus clientas invitan a sus amigas y ganáis las dos.' },
      { icon: 'mail', title: 'Campañas por email y SMS', text: 'Avisa de novedades y ofertas en un par de clics.' },
      { icon: 'gift', title: 'Regalo de bienvenida y cumpleaños', text: 'Un detalle que se recuerda y hace reservar.' },
      { icon: 'chart', title: 'Informes de tu salón', text: 'Quién vuelve, cuánto gasta y qué funciona.' },
    ],
  },
  stories: [
    {
      titleStart: 'Gana la',
      titleHighlight: 'segunda visita',
      lead: 'Una clienta nueva es solo el principio.',
      body: 'Con un regalo de bienvenida y su tarjeta de sellos desde el primer día, tiene un motivo para volver a reservar contigo y no con el salón de al lado.',
      photo: '/sectores/estetica/hero.webp',
    },
    {
      titleStart: 'Llena la agenda en los',
      titleHighlight: 'días flojos',
      lead: 'Los martes por la mañana también pueden ir llenos.',
      body: 'Lanza una promoción para los días con huecos y avisa a tus clientas por email o SMS. Ellas reciben la oferta en el móvil y tú, las reservas.',
      photo: '/sectores/estetica/manicura.webp',
    },
    {
      titleStart: 'Tus clientas, tus mejores',
      titleHighlight: 'embajadoras',
      lead: 'La recomendación de una amiga vale más que cualquier anuncio.',
      body: 'Cada clienta tiene su código para invitar a otras. Cuando la amiga se registra, las dos reciben su premio y tú, una clienta nueva.',
      photo: '/sectores/estetica/amigas.webp',
    },
  ],
  steps: commonSteps('Tu clienta', 'tu salón'),
  promos: {
    titleStart: 'Promociones que',
    titleHighlight: 'encantan',
    items: [
      { title: 'Por tu cumpleaños', text: 'Regalo especial', photo: '/sectores/estetica/cumpleanos.webp', icon: 'gift' },
      { title: 'Trae a una amiga', text: 'Y ganad puntos', photo: '/sectores/estetica/amigas.webp', icon: 'users' },
      { title: 'Días especiales', text: 'Promociones exclusivas', photo: '/sectores/estetica/facial.webp', icon: 'tag' },
    ],
  },
  testimonial: {
    quote:
      'Desde que tenemos Qronnect nuestras clientas vuelven mucho más y además reservan más tratamientos.',
    author: 'Laura M.',
    role: 'Propietaria de salón de uñas',
    photo: '/sectores/estetica/testimonio.webp',
  },
  results: {
    stats: [
      { value: '+40%*', label: 'clientas recurrentes' },
      { value: '+25%*', label: 'ticket medio' },
      { value: '-60%*', label: 'tiempo de gestión manual' },
    ],
    footnote: '*Resultados orientativos de salones que usan Qronnect. Dependen de cada negocio.',
  },
  finalCta: {
    titleStart: 'Convierte cada visita en una',
    titleHighlight: 'historia que continúa',
    subtitle: 'Empieza hoy a fidelizar a tus clientas con Qronnect.',
    qrCaption: 'Escanea y empieza a acumular puntos',
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

const cafeterias: SectorData = {
  slug: 'cafeterias',
  nombre: 'Cafeterías',
  seo: {
    title: 'Programa de fidelización para cafeterías: tarjeta de sellos y puntos digitales',
    description:
      'Convierte cada café en un cliente fiel: tarjeta de sellos digital, puntos, promociones para tus horas valle y referidos para tu cafetería. Sin apps ni tarjetas de cartón.',
    keywords: [
      'fidelización cafetería',
      'tarjeta de sellos digital café',
      'programa de puntos cafetería',
      'café gratis cada 10',
      'marketing para cafeterías',
    ],
  },
  palette: {
    primary: '#E8641B',
    primaryOn: '#FFFFFF',
    ink: '#2B1A10',
    soft: '#FBE7D6',
    softer: '#FFF8F1',
    accents: ['#0F9488', '#D97706'],
  },
  demoBusiness: { name: 'Tu Cafetería', tagline: 'Buenos cafés, mejores momentos' },
  hero: {
    eyebrow: 'Fidelización para cafeterías',
    titleStart: 'Convierte cada café en un',
    titleHighlight: 'cliente fiel',
    subtitle:
      'Qronnect cambia la tarjeta de sellos de cartón por una digital con la imagen de tu cafetería. Más visitas, más ticket y clientes que siempre vuelven.',
    reassurance: 'Tus clientes no descargan ninguna app.',
    photo: '/sectores/cafeterias/hero.webp',
  },
  stampCard: {
    icon: 'coffee',
    line1: 'COMPRA 6 CAFÉS',
    line2: 'EL 7º GRATIS',
    total: 6,
    filled: ['02/01', '05/01', '15/01', '19/01', '22/01'],
  },
  dashboard: { redemptions: '1.031', newMembers: '1.560', members: '1.722' },
  proof: {
    text: 'La tarjeta de "10 cafés, 1 gratis" de siempre, pero digital, con tu marca y sin cartones que se pierden.',
    stats: [
      { value: '30 s', label: 'para que un cliente se registre' },
      { value: '0', label: 'apps que descargar' },
      { value: '100 %', label: 'con tu logo y tus colores' },
    ],
  },
  features: {
    eyebrow: 'Todo lo que necesitas para fidelizar',
    title1: 'Más que una tarjeta de sellos.',
    title2: 'Un motivo para volver cada día.',
    items: [
      { icon: 'stamp', title: 'Sellos y puntos digitales', text: 'Premia cada café, desayuno o compra.' },
      { icon: 'clock', title: 'Promociones en horas valle', text: 'Llena las horas flojas con ofertas para socios.' },
      { icon: 'users', title: 'Referidos', text: 'Tus clientes traen a sus amigos y ganáis todos.' },
      { icon: 'mail', title: 'Campañas por email y SMS', text: 'Programa los envíos para el día y la hora que quieras.' },
      { icon: 'gift', title: 'Regalo de bienvenida y cumpleaños', text: 'Un café o un dulce que se recuerda.' },
      { icon: 'chart', title: 'Informes de tu cafetería', text: 'Visitas, ticket medio y qué promociones funcionan.' },
    ],
  },
  stories: [
    {
      titleStart: 'Gana la',
      titleHighlight: 'segunda visita',
      lead: 'El primer café es solo el principio.',
      body: 'Con su tarjeta de sellos desde el primer día y un regalo de bienvenida, tu cliente tiene un motivo para elegir tu cafetería una y otra vez.',
      photo: '/sectores/cafeterias/hero.webp',
    },
    {
      titleStart: 'Llena tus',
      titleHighlight: 'horas valle',
      lead: 'Las cuatro de la tarde también pueden tener cola.',
      body: 'Crea un 2x1 o un café gratis para las horas flojas y avisa a tus socios por email o SMS justo cuando más lo necesitas.',
      photo: '/sectores/cafeterias/helado.webp',
    },
    {
      titleStart: 'Más que un café,',
      titleHighlight: 'una comunidad',
      lead: 'Los clientes habituales son los que hacen barrio.',
      body: 'Premia a los que vienen cada día, celebra sus cumpleaños y deja que traigan a sus amigos con su código de invitación.',
      photo: '/sectores/cafeterias/latte.webp',
    },
  ],
  steps: commonSteps('Tu cliente', 'tu cafetería'),
  promos: {
    titleStart: 'Recompensas que',
    titleHighlight: 'encantan',
    items: [
      { title: 'Acumula 10 cafés', text: '1 café gratis', photo: '/sectores/cafeterias/croissant.webp', icon: 'coffee' },
      { title: 'Cumpleaños', text: 'Postre gratis', photo: '/sectores/cafeterias/tarta.webp', icon: 'gift' },
      { title: 'Ofertas exclusivas', text: 'Solo para socios', photo: '/sectores/cafeterias/batidos.webp', icon: 'tag' },
    ],
  },
  testimonial: {
    quote:
      'Desde que tenemos Qronnect, nuestros clientes vuelven mucho más y el ticket medio ha aumentado notablemente.',
    author: 'Carlos R.',
    role: 'Propietario de cafetería',
    photo: '/sectores/cafeterias/testimonio.webp',
  },
  results: {
    stats: [
      { value: '+40%*', label: 'clientes recurrentes' },
      { value: '+25%*', label: 'ticket medio' },
      { value: '-60%*', label: 'tiempo de gestión manual' },
    ],
    footnote: '*Resultados orientativos de cafeterías que usan Qronnect. Dependen de cada negocio.',
  },
  finalCta: {
    titleStart: 'Tu próximo cliente fiel',
    titleHighlight: 'está a un café',
    subtitle: 'Fideliza, sorprende y haz que vuelvan. Empieza hoy con Qronnect.',
    qrCaption: 'Escanea y empieza a acumular puntos',
  },
  faq: [
    {
      q: '¿Mis clientes tienen que descargar una app?',
      a: 'No. Se registran en 30 segundos desde el móvil escaneando tu QR y su tarjeta funciona en el navegador.',
    },
    {
      q: '¿Puedo hacer la típica tarjeta de "10 cafés, 1 gratis"?',
      a: 'Sí. Creas una tarjeta de sellos digital con el número de sellos y el premio que quieras, y tu equipo pone el sello al escanear el QR del cliente.',
    },
    {
      q: '¿Sirve para llenar las horas flojas?',
      a: 'Puedes lanzar promociones y programar campañas por email o SMS para los días y horas que más lo necesites.',
    },
    {
      q: '¿Qué pasa con los datos de mis clientes?',
      a: 'Son tuyos. Se tratan conforme al RGPD y cada cliente puede darse de baja de las comunicaciones cuando quiera.',
    },
  ],
}

export const SECTORES: Record<string, SectorData> = {
  [estetica.slug]: estetica,
  [cafeterias.slug]: cafeterias,
}

export function getSector(slug: string): SectorData | undefined {
  return SECTORES[slug]
}
