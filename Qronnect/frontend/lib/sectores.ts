/**
 * Contenido de las landings de venta por sector (qronnect.es/para/<sector>)
 *
 * La página cuenta una historia en bloques: problema, método, ideas, cómo funciona,
 * para quién es, testimonio y cierre. Cada sector define sus textos, su paleta y sus fotos.
 * Las fotos viven en /public/sectores/<slug>/ y, si no existen, se muestra un panel de color.
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

export interface SectorPillar {
  icon: SectorIcon
  title: string
  subtitle: string
  text: string
}

export interface SectorIdea {
  label: string
  title: string
  text: string
  photo: string
}

export interface SectorData {
  slug: string
  /** Nombre del sector para menús, breadcrumbs y SEO */
  nombre: string
  seo: { title: string; description: string; keywords: string[] }
  /**
   * Paleta: principal (botones y palabra destacada), tinta (texto en claro),
   * oscuro (secciones oscuras) y fondos suaves
   */
  palette: { primary: string; primaryOn: string; ink: string; dark: string; soft: string; softer: string }
  /** Nombre ficticio del negocio que aparece en el móvil */
  demoBusiness: { name: string; tagline: string }
  hero: {
    eyebrow: string
    titleStart: string
    /** Palabra o final del titular, en cursiva y color */
    titleAccent: string
    subtitleLead: string
    subtitleStrong: string
    intro: string
    /** Línea pequeña bajo el botón */
    reassurance: string
    /** Texto del botón principal de captación */
    ctaLabel: string
    photo: string
  }
  /** Lo que ve el cliente en el móvil */
  phone: {
    points: number
    progressLabel: string
    progress: number
    items: { icon: SectorIcon; label: string }[]
    reward: { title: string; photo: string }
  }
  problem: {
    eyebrow: string
    title1: string
    title2: string
    body: string
    contrast1: string
    contrast2: string
    tail1: string
    tail2: string
  }
  method: {
    eyebrow: string
    title: string
    subtitle: string
    equation: [string, string, string]
    result: string
    pillars: SectorPillar[]
  }
  ideas: { label: string; items: SectorIdea[]; ctaTitle: string; ctaText: string }
  steps: SectorFeature[]
  included: { title: string; items: SectorFeature[] }
  fit: { forWho: string[]; notFor: string[] }
  stats: SectorStat[]
  statsFootnote: string
  testimonial: { quote: string; author: string; role: string; photo: string }
  closing: {
    title1: string
    title2: string
    rhythm: string[]
    line1: string
    line2: string
    pre: string
    highlight: string
  }
  faq: { q: string; a: string }[]
}

const estetica: SectorData = {
  slug: 'estetica',
  nombre: 'Estética y belleza',
  seo: {
    title: 'Programa de fidelización para centros de estética y salones de uñas',
    description:
      'Haz que tus clientas vuelvan: tarjeta de sellos digital, puntos, promociones y referidos con la imagen de tu salón de estética, uñas o peluquería. Sin apps.',
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
    ink: '#2A0A1C',
    dark: '#1F0716',
    soft: '#FCE4EC',
    softer: '#FFF6F8',
  },
  demoBusiness: { name: 'Tu Salón', tagline: 'Estética & Uñas' },
  hero: {
    eyebrow: 'Para salones de estética y uñas',
    titleStart: 'Belleza que siempre',
    titleAccent: 'vuelve',
    subtitleLead: 'Si no sabes por qué una clienta no repite,',
    subtitleStrong: 'tu agenda depende de la suerte.',
    intro:
      'Has construido un salón con buenas manos y buenas clientas. Qronnect hace que vuelvan: tarjeta de sellos, puntos y promociones con la imagen de tu salón, en el móvil de cada clienta.',
    reassurance: 'Sin apps para tus clientas · Con tu logo y tus colores',
    ctaLabel: 'Quiero que mis clientas vuelvan',
    photo: '/sectores/estetica/hero.webp',
  },
  phone: {
    points: 320,
    progressLabel: 'A 1 visita de tu recompensa',
    progress: 0.82,
    items: [
      { icon: 'stamp', label: 'Mi tarjeta de sellos' },
      { icon: 'tag', label: 'Promociones exclusivas' },
      { icon: 'history', label: 'Tu historial' },
      { icon: 'users', label: 'Invita a una amiga' },
    ],
    reward: { title: 'Tu próxima manicura gratis', photo: '/sectores/estetica/manicura.webp' },
  },
  problem: {
    eyebrow: 'Captar no es fidelizar',
    title1: 'Tu agenda puede estar llena',
    title2: 'y aun así perder clientas.',
    body: 'Cada mes entran clientas nuevas. La pregunta es cuántas vuelven a reservar y qué haces para que lo hagan.',
    contrast1: 'Captar es caro.',
    contrast2: 'Que vuelvan es rentable.',
    tail1: 'Probablemente ya das un gran servicio. Lo que falta es un motivo para volver.',
    tail2: 'Y sin ese motivo, tu clienta de hoy es la del salón de enfrente mañana.',
  },
  method: {
    eyebrow: 'El método Qronnect',
    title: 'No te damos una tarjeta. Te damos clientas que vuelven.',
    subtitle: 'Tres piezas trabajando juntas en tu salón, cada una en lo que mejor hace.',
    equation: ['Sellos y puntos', 'Promociones', 'Referidos'],
    result: 'clientas fieles',
    pillars: [
      {
        icon: 'stamp',
        title: 'Sellos y puntos',
        subtitle: 'Premia cada visita.',
        text: 'Cada tratamiento suma. Tu clienta ve su progreso en el móvil y sabe cuánto le falta para su premio.',
      },
      {
        icon: 'megaphone',
        title: 'Promociones',
        subtitle: 'Llena los huecos de la agenda.',
        text: 'Lanza una oferta para los días flojos y avisa a tus clientas por email o SMS en un par de clics.',
      },
      {
        icon: 'users',
        title: 'Referidos',
        subtitle: 'Tus clientas traen a sus amigas.',
        text: 'Cada clienta tiene su código. Cuando invita a una amiga, las dos ganan y tú sumas una clienta nueva.',
      },
    ],
  },
  ideas: {
    label: 'Ideas que funcionan en salones',
    items: [
      { label: 'Tarjeta de sellos', title: '6ª manicura gratis', text: 'El clásico, sin cartón y siempre a mano.', photo: '/sectores/estetica/manicura.webp' },
      { label: 'Cumpleaños', title: 'Un detalle en su mes', text: 'Un regalo que se recuerda y hace reservar.', photo: '/sectores/estetica/cumpleanos.webp' },
      { label: 'Referidos', title: 'Trae a una amiga', text: 'Y ganad puntos las dos.', photo: '/sectores/estetica/amigas.webp' },
      { label: 'Días flojos', title: 'Martes de facial', text: 'Una oferta para llenar la agenda.', photo: '/sectores/estetica/facial.webp' },
    ],
    ctaTitle: '¿Qué programa encaja en tu salón?',
    ctaText: 'Cuéntanos cómo trabajas y te proponemos la tarjeta, las promociones y los premios que mejor encajan contigo.',
  },
  steps: [
    { icon: 'qr', title: 'Escanea y se une', text: 'Tu clienta escanea el QR del mostrador y se registra en 30 segundos.' },
    { icon: 'stamp', title: 'Suma en cada visita', text: 'Enseña su QR en el móvil y tu equipo le suma el sello o los puntos.' },
    { icon: 'gift', title: 'Disfruta su premio', text: 'Al completar la tarjeta recibe su cupón y lo canjea en tu salón.' },
  ],
  included: {
    title: 'Lo que tienes desde el primer día',
    items: [
      { icon: 'palette', title: 'Tu marca', text: 'Tu logo y tus colores en la tarjeta, las promociones y los emails.' },
      { icon: 'gift', title: 'Regalos de bienvenida y cumpleaños', text: 'Detalles automáticos que hacen volver.' },
      { icon: 'mail', title: 'Campañas por email y SMS', text: 'Para avisar de novedades y huecos libres.' },
      { icon: 'chart', title: 'Informes de tu salón', text: 'Quién vuelve, cuánto gasta y qué funciona.' },
    ],
  },
  fit: {
    forWho: [
      'Salones de estética, uñas, pestañas, cejas y peluquerías.',
      'Negocios que quieren que sus clientas repitan, no solo que vengan una vez.',
      'Quien quiere dejar las tarjetas de cartón y los cuadernos.',
    ],
    notFor: [
      'Quien busca una agenda de reservas: Qronnect fideliza, no gestiona citas.',
      'Negocios sin clientas habituales.',
      'Quien no quiere comunicarse con sus clientas.',
    ],
  },
  stats: [
    { value: '+40%*', label: 'clientas recurrentes' },
    { value: '+25%*', label: 'ticket medio' },
    { value: '-60%*', label: 'tiempo de gestión manual' },
  ],
  statsFootnote: '*Resultados orientativos de salones que usan Qronnect. Dependen de cada negocio.',
  testimonial: {
    quote: 'Desde que tenemos Qronnect nuestras clientas vuelven mucho más y además reservan más tratamientos.',
    author: 'Laura M.',
    role: 'Propietaria de salón de uñas',
    photo: '/sectores/estetica/testimonio.webp',
  },
  closing: {
    title1: 'Las clientas no se van de golpe.',
    title2: 'Se van un poco en cada visita.',
    rhythm: ['Una cita sin repetir.', 'Un cumpleaños olvidado.', 'Una oferta que no llegó.', 'Una amiga a la que nadie invitó.'],
    line1: 'Nada parece lo bastante grave como para preocuparse.',
    line2: 'Hasta que la agenda tiene huecos.',
    pre: 'No esperes a notarlo en la caja.',
    highlight: 'Dale a cada clienta un motivo para volver.',
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
      'Haz que tus clientes vuelvan cada día: tarjeta de sellos digital, puntos, promociones para tus horas valle y referidos para tu cafetería. Sin apps ni tarjetas de cartón.',
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
    ink: '#24160D',
    dark: '#1C120B',
    soft: '#FBE7D6',
    softer: '#FFF8F1',
  },
  demoBusiness: { name: 'Tu Cafetería', tagline: 'Buenos cafés, mejores momentos' },
  hero: {
    eyebrow: 'Para cafeterías',
    titleStart: 'Convierte cada café en un',
    titleAccent: 'cliente fiel',
    subtitleLead: 'Si no sabes quién vuelve mañana,',
    subtitleStrong: 'vendes cafés, pero no fidelizas.',
    intro:
      'Tienes buen café y una barra con vida. Qronnect hace que quien entra hoy vuelva mañana: tarjeta de sellos digital, puntos y promociones con la imagen de tu cafetería.',
    reassurance: 'Sin apps para tus clientes · Con tu logo y tus colores',
    ctaLabel: 'Quiero que mis clientes vuelvan',
    photo: '/sectores/cafeterias/hero.webp',
  },
  phone: {
    points: 120,
    progressLabel: 'A 1 café de tu café gratis',
    progress: 0.9,
    items: [
      { icon: 'stamp', label: 'Mi tarjeta de sellos' },
      { icon: 'tag', label: 'Promociones exclusivas' },
      { icon: 'history', label: 'Tu historial' },
      { icon: 'users', label: 'Invita a un amigo' },
    ],
    reward: { title: 'Tu próximo café gratis', photo: '/sectores/cafeterias/cafe.webp' },
  },
  problem: {
    eyebrow: 'Vender no es fidelizar',
    title1: 'Tu barra puede estar llena',
    title2: 'y aun así no tener clientes fieles.',
    body: 'Por tu cafetería pasan cientos de personas cada semana. La pregunta es cuántas vuelven y qué haces para que lo hagan.',
    contrast1: 'Un cliente nuevo cuesta.',
    contrast2: 'Uno que vuelve suma cada día.',
    tail1: 'La tarjeta de cartón se pierde, se moja y no te dice nada.',
    tail2: 'Una tarjeta digital vive en el móvil de tu cliente y te dice quién vuelve.',
  },
  method: {
    eyebrow: 'El método Qronnect',
    title: 'No te damos una tarjeta. Te damos clientes que vuelven.',
    subtitle: 'Tres piezas trabajando juntas en tu cafetería, cada una en lo que mejor hace.',
    equation: ['Sellos y puntos', 'Promociones', 'Referidos'],
    result: 'clientes fieles',
    pillars: [
      {
        icon: 'stamp',
        title: 'Sellos y puntos',
        subtitle: 'Premia cada café.',
        text: 'Cada consumición suma. Tu cliente ve su tarjeta en el móvil y sabe cuánto le falta para su café gratis.',
      },
      {
        icon: 'clock',
        title: 'Promociones',
        subtitle: 'Llena tus horas valle.',
        text: 'Crea un 2x1 para las tardes flojas y programa el aviso por email o SMS para el día y la hora que quieras.',
      },
      {
        icon: 'users',
        title: 'Referidos',
        subtitle: 'Tus clientes traen a sus amigos.',
        text: 'Cada cliente tiene su código. Cuando invita a un amigo, los dos ganan y tú sumas un cliente nuevo.',
      },
    ],
  },
  ideas: {
    label: 'Ideas que funcionan en cafeterías',
    items: [
      { label: 'Tarjeta de sellos', title: '10 cafés, 1 gratis', text: 'El de siempre, sin cartón y sin perderse.', photo: '/sectores/cafeterias/cafe.webp' },
      { label: 'Cumpleaños', title: 'Postre gratis', text: 'Un dulce en su día que se recuerda.', photo: '/sectores/cafeterias/tarta.webp' },
      { label: 'Horas valle', title: '2x1 por la tarde', text: 'Para llenar las horas más tranquilas.', photo: '/sectores/cafeterias/helado.webp' },
      { label: 'Solo socios', title: 'Ofertas exclusivas', text: 'Novedades primero para los de casa.', photo: '/sectores/cafeterias/batidos.webp' },
    ],
    ctaTitle: '¿Qué programa encaja en tu cafetería?',
    ctaText: 'Cuéntanos cómo trabajas y te proponemos la tarjeta, las promociones y los premios que mejor encajan contigo.',
  },
  steps: [
    { icon: 'qr', title: 'Escanea y se une', text: 'Tu cliente escanea el QR de la barra y se registra en 30 segundos.' },
    { icon: 'coffee', title: 'Suma en cada café', text: 'Enseña su QR en el móvil y tu equipo le suma el sello o los puntos.' },
    { icon: 'gift', title: 'Disfruta su premio', text: 'Al completar la tarjeta recibe su cupón y lo canjea en tu cafetería.' },
  ],
  included: {
    title: 'Lo que tienes desde el primer día',
    items: [
      { icon: 'palette', title: 'Tu marca', text: 'Tu logo y tus colores en la tarjeta, las promociones y los emails.' },
      { icon: 'gift', title: 'Regalos de bienvenida y cumpleaños', text: 'Un café o un dulce que hace volver.' },
      { icon: 'mail', title: 'Campañas programadas', text: 'Email y SMS para el día y la hora que elijas.' },
      { icon: 'chart', title: 'Informes de tu cafetería', text: 'Visitas, ticket medio y qué promociones funcionan.' },
    ],
  },
  fit: {
    forWho: [
      'Cafeterías, panaderías, obradores y heladerías.',
      'Negocios con clientes habituales que quieren que vengan más a menudo.',
      'Quien quiere olvidarse de las tarjetas de cartón.',
    ],
    notFor: [
      'Quien busca un TPV o un sistema de pedidos: Qronnect fideliza, no cobra.',
      'Negocios de paso sin clientes que repitan.',
      'Quien no quiere comunicarse con sus clientes.',
    ],
  },
  stats: [
    { value: '+40%*', label: 'clientes recurrentes' },
    { value: '+25%*', label: 'ticket medio' },
    { value: '-60%*', label: 'tiempo de gestión manual' },
  ],
  statsFootnote: '*Resultados orientativos de cafeterías que usan Qronnect. Dependen de cada negocio.',
  testimonial: {
    quote: 'Desde que tenemos Qronnect, nuestros clientes vuelven mucho más y el ticket medio ha aumentado notablemente.',
    author: 'Carlos R.',
    role: 'Propietario de cafetería',
    photo: '/sectores/cafeterias/testimonio.webp',
  },
  closing: {
    title1: 'Los clientes no se van de golpe.',
    title2: 'Se van un café cada vez.',
    rhythm: ['Una tarjeta perdida.', 'Un cumpleaños sin felicitar.', 'Una tarde vacía.', 'Una cafetería nueva en la esquina.'],
    line1: 'Nada parece lo bastante grave como para preocuparse.',
    line2: 'Hasta que la barra está vacía.',
    pre: 'No esperes a notarlo en la caja.',
    highlight: 'Dale a cada cliente un motivo para volver mañana.',
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
