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
  | 'coffee' | 'sparkles' | 'clock' | 'palette' | 'dumbbell' | 'bag'

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

/** Datos de la demo interactiva: lo que vive un cliente en el móvil */
export interface SectorDemo {
  /** Lo que hace el cliente en caja, en infinitivo: "Pedir un café" */
  accion: string
  /** Puntos que suma cada vez */
  puntos: number
  /** Sellos que hay que juntar para el premio */
  sellos: number
  /** Premios que pueden salir en la máquina de premios */
  maquina: string[]
  /** Promoción de ejemplo que manda el negocio */
  promo: { titulo: string; texto: string }
}

/** Ilustración en HTML de cada paso de "Cómo funciona" */
export type HowVisual = 'setup' | 'qr' | 'signup' | 'scan' | 'reward' | 'results'

export interface HowStep {
  who: string
  title: string
  text: string
  visual: HowVisual
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
  palette: {
    primary: string
    primaryOn: string
    ink: string
    dark: string
    soft: string
    softer: string
    /** Acento para texto sobre las secciones oscuras, si el principal no se lee bien ahí */
    accentOnDark?: string
  }
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
    /** Encuadre de la foto de fondo del hero (object-position) */
    photoPosition?: string
    /** Texto del botón principal de captación */
    ctaLabel: string
    photo: string
  }
  /** Demo interactiva del móvil */
  demo: SectorDemo
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
  /** Explicación paso a paso de cómo funciona, del lado del negocio y del cliente */
  howItWorks: { title: string; intro: string; steps: HowStep[] }
  ideas: { label: string; items: SectorIdea[]; ctaTitle: string; ctaText: string }
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

/** Lo mínimo para pintar el móvil de ejemplo y el "Cómo funciona" (también lo usa la portada) */
export type SectorShowcase = Pick<SectorData, 'slug' | 'palette' | 'demoBusiness' | 'phone' | 'howItWorks' | 'demo'>

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
    // Foto: Unsplash (licencia Unsplash). Encuadre a la derecha para ver las manos trabajando
    photo: '/sectores/estetica/hero.webp',
    photoPosition: '100% 50%',
  },
  demo: {
    accion: 'Pagar tu manicura',
    puntos: 25,
    sellos: 6,
    maquina: ['Esmaltado gratis', '10 % en tu próxima cita', 'Mascarilla de regalo', 'Doble de puntos'],
    promo: { titulo: 'Martes de mimos', texto: '20 % en tratamientos faciales esta semana' },
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
        text: 'Cada clienta tiene su código. Cuando invita a una amiga, las dos ganan puntos (tú decides cuántos, también en su primera visita) y tú sumas una clienta nueva.',
      },
    ],
  },
  howItWorks: {
    title: 'Así funciona en tu salón',
    intro:
      'Todo gira alrededor de un QR: tu clienta lo escanea una vez para unirse y, desde ahí, en cada visita tu equipo le suma sellos o puntos escaneando el QR de su móvil.',
    steps: [
      { who: 'Tú', visual: 'setup', title: 'Configuras tu programa', text: 'En el asistente de alta eliges tu logo y colores, cuántos puntos da cada euro, el regalo de bienvenida y el premio por invitar a una amiga.' },
      { who: 'Tú', visual: 'qr', title: 'Pones tu QR en el salón', text: 'Descargas tu QR y lo colocas en el mostrador, el espejo o la tarjeta de cita.' },
      { who: 'Tu clienta', visual: 'signup', title: 'Lo escanea y se une', text: 'Con la cámara del móvil, deja su nombre y su email en 30 segundos. Sin descargar ninguna app.' },
      { who: 'Tu equipo', visual: 'scan', title: 'Suma en cada visita', text: 'Al cobrar, escanea el QR de su móvil y le suma el sello o los puntos de ese tratamiento.' },
      { who: 'Tu clienta', visual: 'reward', title: 'Recibe su premio', text: 'Al completar la tarjeta le llega su cupón, por ejemplo la sexta manicura gratis, y lo canjea en tu salón.' },
      { who: 'Tú', visual: 'results', title: 'Ves quién vuelve', text: 'Desde tu panel ves visitas, clientas y premios, y lanzas promociones por email o SMS cuando quieras.' },
    ],
  },
  ideas: {
    label: 'Ideas que funcionan en salones',
    items: [
      { label: 'Tarjeta de sellos', title: '6ª manicura gratis', text: 'El clásico, sin cartón y siempre a mano.', photo: '/sectores/estetica/manicura.webp' },
      { label: 'Cumpleaños', title: 'Un detalle en su mes', text: 'Un regalo que se recuerda y hace reservar.', photo: '/sectores/estetica/cumpleanos.webp' },
      { label: 'Referidos', title: 'Trae a una amiga', text: 'Puntos para las dos al unirse y en su primera visita.', photo: '/sectores/estetica/amigas.webp' },
      { label: 'Días flojos', title: 'Martes de facial', text: 'Una oferta para llenar la agenda.', photo: '/sectores/estetica/facial.webp' },
    ],
    ctaTitle: '¿Qué programa encaja en tu salón?',
    ctaText: 'Cuéntanos cómo trabajas y te proponemos la tarjeta, las promociones y los premios que mejor encajan contigo.',
  },
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
  demo: {
    accion: 'Pedir un café',
    puntos: 10,
    sellos: 10,
    maquina: ['Croissant gratis', 'Café doble por uno', 'Galleta de regalo', 'Doble de puntos'],
    promo: { titulo: '2x1 esta tarde', texto: 'En cafés de 16:00 a 18:00, solo para socios' },
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
        text: 'Cada cliente tiene su código. Cuando invita a un amigo, los dos ganan puntos (tú decides cuántos, también en su primera compra) y tú sumas un cliente nuevo.',
      },
    ],
  },
  howItWorks: {
    title: 'Así funciona en tu cafetería',
    intro:
      'Todo gira alrededor de un QR: tu cliente lo escanea una vez para unirse y, desde ahí, en cada café tu equipo le suma el sello o los puntos escaneando el QR de su móvil.',
    steps: [
      { who: 'Tú', visual: 'setup', title: 'Configuras tu programa', text: 'En el asistente de alta eliges tu logo y colores, cuántos puntos da cada euro, el regalo de bienvenida y el premio por traer a un amigo.' },
      { who: 'Tú', visual: 'qr', title: 'Pones tu QR en la barra', text: 'Descargas tu QR y lo colocas en la barra, las mesas o junto a la caja.' },
      { who: 'Tu cliente', visual: 'signup', title: 'Lo escanea y se une', text: 'Con la cámara del móvil, deja su nombre y su email en 30 segundos. Sin descargar ninguna app.' },
      { who: 'Tu equipo', visual: 'scan', title: 'Suma en cada café', text: 'Al cobrar, escanea el QR de su móvil y le suma el sello o los puntos de su consumición.' },
      { who: 'Tu cliente', visual: 'reward', title: 'Recibe su premio', text: 'Al completar la tarjeta le llega su cupón, por ejemplo su café gratis, y lo canjea en la barra.' },
      { who: 'Tú', visual: 'results', title: 'Ves quién vuelve', text: 'Desde tu panel ves visitas, clientes y premios, y programas promociones por email o SMS para tus horas valle.' },
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

const deporte: SectorData = {
  slug: 'deporte',
  nombre: 'Deporte y salud',
  seo: {
    title: 'Programa de fidelización para gimnasios, estudios de yoga y pilates y centros de fisioterapia',
    description:
      'Premia la constancia de tus clientes: sellos por clase o sesión, puntos, promociones y referidos con la imagen de tu gimnasio, estudio o centro de salud. Sin apps.',
    keywords: [
      'fidelización gimnasio',
      'programa de puntos gimnasio',
      'tarjeta de sellos clases yoga pilates',
      'retención de socios gimnasio',
      'fidelizar pacientes fisioterapia',
    ],
  },
  palette: {
    primary: '#15803D',
    primaryOn: '#FFFFFF',
    ink: '#0F1A14',
    dark: '#0B140F',
    soft: '#DCFCE7',
    softer: '#F4FBF6',
    accentOnDark: '#4ADE80',
  },
  demoBusiness: { name: 'Tu Centro', tagline: 'Entrena · Cuídate' },
  hero: {
    eyebrow: 'Para gimnasios, estudios y centros de salud',
    titleStart: 'Que entrenar contigo se convierta en',
    titleAccent: 'costumbre',
    subtitleLead: 'Si no sabes por qué un socio deja de venir,',
    subtitleStrong: 'te enteras cuando ya se ha dado de baja.',
    intro:
      'Tienes buenas clases y buenos profesionales. Qronnect premia la constancia: sellos por cada clase o sesión, puntos y promociones con la imagen de tu centro, en el móvil de cada cliente.',
    reassurance: 'Sin apps para tus clientes · Con tu logo y tus colores',
    // Fotos de este sector: Unsplash (licencia Unsplash), a la espera de fotos propias
    photo: '/sectores/deporte/hero.webp',
    photoPosition: '50% 30%',
    ctaLabel: 'Quiero que mis clientes sigan viniendo',
  },
  demo: {
    accion: 'Ir a clase',
    puntos: 20,
    sellos: 8,
    maquina: ['Batido de proteínas', 'Clase para un amigo', 'Toalla de regalo', 'Doble de puntos'],
    promo: { titulo: 'Reto de octubre', texto: 'Ven 12 veces este mes y llévate una sesión extra' },
  },
  phone: {
    points: 450,
    progressLabel: 'A 2 clases de tu clase gratis',
    progress: 0.8,
    items: [
      { icon: 'stamp', label: 'Mi tarjeta de sellos' },
      { icon: 'tag', label: 'Promociones exclusivas' },
      { icon: 'history', label: 'Tu historial' },
      { icon: 'users', label: 'Invita a un amigo' },
    ],
    reward: { title: 'Tu próxima clase gratis', photo: '/sectores/deporte/clase.webp' },
  },
  howItWorks: {
    title: 'Así funciona en tu centro',
    intro:
      'Todo gira alrededor de un QR: tu cliente lo escanea una vez para unirse y, desde ahí, en cada clase o sesión tu equipo le suma el sello o los puntos escaneando el QR de su móvil.',
    steps: [
      { who: 'Tú', visual: 'setup', title: 'Configuras tu programa', text: 'En el asistente de alta eliges tu logo y colores, cuántos puntos da cada euro, el regalo de bienvenida y el premio por traer a un amigo.' },
      { who: 'Tú', visual: 'qr', title: 'Pones tu QR en recepción', text: 'Descargas tu QR y lo colocas en recepción, en la sala o en los vestuarios.' },
      { who: 'Tu cliente', visual: 'signup', title: 'Lo escanea y se une', text: 'Con la cámara del móvil, deja su nombre y su email en 30 segundos. Sin descargar ninguna app.' },
      { who: 'Tu equipo', visual: 'scan', title: 'Suma en cada clase', text: 'Al llegar, tu equipo escanea el QR de su móvil y le suma el sello o los puntos de esa clase o sesión.' },
      { who: 'Tu cliente', visual: 'reward', title: 'Recibe su premio', text: 'Al completar la tarjeta le llega su cupón, por ejemplo una clase o una sesión gratis, y lo canjea en recepción.' },
      { who: 'Tú', visual: 'results', title: 'Ves quién se desengancha', text: 'Desde tu panel ves quién lleva días sin venir y le envías una promoción por email o SMS para que vuelva.' },
    ],
  },
  problem: {
    eyebrow: 'Captar no es retener',
    title1: 'Tus clases pueden estar llenas en enero',
    title2: 'y medio vacías en marzo.',
    body: 'Cada temporada entran clientes nuevos. La pregunta es cuántos siguen viniendo a los tres meses y qué haces para que lo hagan.',
    contrast1: 'Un socio nuevo cuesta.',
    contrast2: 'Uno constante sostiene tu centro.',
    tail1: 'La motivación del primer día no dura sola. Necesita un motivo para volver la semana siguiente.',
    tail2: 'Y sin ese motivo, la cuota de hoy es la baja de mañana.',
  },
  method: {
    eyebrow: 'El método Qronnect',
    title: 'No te damos una tarjeta. Te damos clientes constantes.',
    subtitle: 'Tres piezas trabajando juntas en tu centro, cada una en lo que mejor hace.',
    equation: ['Sellos y puntos', 'Promociones', 'Referidos'],
    result: 'clientes constantes',
    pillars: [
      {
        icon: 'stamp',
        title: 'Sellos y puntos',
        subtitle: 'Premia la constancia.',
        text: 'Cada clase o sesión suma. Tu cliente ve su progreso en el móvil y sabe cuánto le falta para su premio.',
      },
      {
        icon: 'megaphone',
        title: 'Promociones',
        subtitle: 'Recupera a quien se desengancha.',
        text: 'Envía una oferta por email o SMS a quien lleva días sin venir, o llena las horas flojas del mediodía.',
      },
      {
        icon: 'users',
        title: 'Referidos',
        subtitle: 'Entrenar acompañado engancha.',
        text: 'Cada cliente tiene su código. Cuando trae a un amigo, los dos ganan puntos (tú decides cuántos, también en su primera compra) y tú sumas un socio nuevo.',
      },
    ],
  },
  ideas: {
    label: 'Ideas que funcionan en centros deportivos',
    items: [
      { label: 'Tarjeta de sellos', title: '10ª clase gratis', text: 'Premia a quien no falla ni una semana.', photo: '/sectores/deporte/pilates.webp' },
      { label: 'Cumpleaños', title: 'Una sesión de regalo', text: 'Un detalle en su mes que se recuerda.', photo: '/sectores/deporte/cumple.webp' },
      { label: 'Referidos', title: 'Trae a un amigo', text: 'Puntos para los dos al unirse y en su primera compra.', photo: '/sectores/deporte/amigo.webp' },
      { label: 'Horas flojas', title: 'Mediodías con premio', text: 'Una oferta para llenar la sala a mediodía.', photo: '/sectores/deporte/sala.webp' },
    ],
    ctaTitle: '¿Qué programa encaja en tu centro?',
    ctaText: 'Cuéntanos cómo trabajas y te proponemos la tarjeta, las promociones y los premios que mejor encajan contigo.',
  },
  included: {
    title: 'Lo que tienes desde el primer día',
    items: [
      { icon: 'palette', title: 'Tu marca', text: 'Tu logo y tus colores en la tarjeta, las promociones y los emails.' },
      { icon: 'gift', title: 'Regalos de bienvenida y cumpleaños', text: 'Detalles automáticos que refuerzan el hábito.' },
      { icon: 'mail', title: 'Campañas por email y SMS', text: 'Para animar a volver a quien lleva tiempo sin venir.' },
      { icon: 'chart', title: 'Informes de tu centro', text: 'Quién viene, con qué frecuencia y qué funciona.' },
    ],
  },
  fit: {
    forWho: [
      'Gimnasios, boxes, estudios de yoga, pilates y centros de entrenamiento.',
      'Centros de fisioterapia y salud con pacientes que repiten sesiones.',
      'Negocios que quieren clientes constantes, no solo nuevas altas.',
    ],
    notFor: [
      'Quien busca reservas o control de accesos: Qronnect fideliza, no gestiona la agenda ni los tornos.',
      'Quien busca cobrar las cuotas: Qronnect no gestiona pagos.',
      'Quien no quiere comunicarse con sus clientes.',
    ],
  },
  stats: [
    { value: '+40%*', label: 'clientes recurrentes' },
    { value: '+25%*', label: 'ticket medio' },
    { value: '-60%*', label: 'tiempo de gestión manual' },
  ],
  statsFootnote: '*Resultados orientativos de negocios que usan Qronnect. Dependen de cada centro.',
  // TODO: sustituir por un testimonio real de un centro deportivo antes de publicar
  testimonial: {
    quote: 'Desde que premiamos la constancia, nuestros clientes encadenan más semanas seguidas y nos recomiendan a sus amigos.',
    author: 'Javier P.',
    role: 'Propietario de centro de entrenamiento',
    photo: '/sectores/deporte/testimonio.webp',
  },
  closing: {
    title1: 'Los clientes no se dan de baja de golpe.',
    title2: 'Dejan de venir un poco cada semana.',
    rhythm: ['Una clase que se salta.', 'Una semana sin venir.', 'Un cumpleaños sin felicitar.', 'Un amigo al que nadie invitó.'],
    line1: 'Nada parece lo bastante grave como para preocuparse.',
    line2: 'Hasta que llega la baja.',
    pre: 'No esperes a notarlo en las cuotas.',
    highlight: 'Dale a cada cliente un motivo para volver la semana que viene.',
  },
  faq: [
    {
      q: '¿Mis clientes tienen que descargar una app?',
      a: 'No. Se registran en 30 segundos desde el móvil escaneando tu QR y su tarjeta funciona en el navegador.',
    },
    {
      q: '¿Puedo dar sellos por clase y puntos por compras?',
      a: 'Sí. Puedes combinar tarjetas de sellos por clase o sesión con puntos por importe, por ejemplo en bebidas, suplementos o material.',
    },
    {
      q: '¿Sirve para centros de fisioterapia?',
      a: 'Sí. Puedes premiar los bonos de sesiones, los tratamientos de seguimiento o las recomendaciones de nuevos pacientes.',
    },
    {
      q: '¿Qué pasa con los datos de mis clientes?',
      a: 'Son tuyos. Se tratan conforme al RGPD y cada cliente puede darse de baja de las comunicaciones cuando quiera.',
    },
  ],
}

const tiendas: SectorData = {
  slug: 'tiendas',
  nombre: 'Comercio minorista',
  seo: {
    title: 'Programa de fidelización para tiendas: puntos, cupones y promociones para el comercio local',
    description:
      'Haz que tus clientes repitan: puntos por cada compra, cupones, promociones y referidos con la imagen de tu tienda de ropa, perfumería, librería o floristería. Sin apps.',
    keywords: [
      'fidelización comercio local',
      'programa de puntos tienda de ropa',
      'tarjeta de fidelización digital tienda',
      'fidelizar clientes perfumería',
      'marketing para pequeño comercio',
    ],
  },
  palette: {
    primary: '#4F46E5',
    primaryOn: '#FFFFFF',
    ink: '#14132B',
    dark: '#0E0D1F',
    soft: '#E0E7FF',
    softer: '#F6F7FF',
    accentOnDark: '#A5B4FC',
  },
  demoBusiness: { name: 'Tu Tienda', tagline: 'Moda · Regalos · Hogar' },
  hero: {
    eyebrow: 'Para tiendas y comercio de barrio',
    titleStart: 'Que cada compra traiga',
    titleAccent: 'la siguiente',
    subtitleLead: 'Si no sabes quién compra en tu tienda,',
    subtitleStrong: 'no puedes hacer que vuelva.',
    intro:
      'Tienes buen producto y un trato que no da ninguna gran superficie. Qronnect hace que tus clientes vuelvan: puntos por cada compra, cupones y promociones con la imagen de tu tienda, en su móvil.',
    reassurance: 'Sin apps para tus clientes · Con tu logo y tus colores',
    // Fotos de este sector: Unsplash (licencia Unsplash), a la espera de fotos propias
    photo: '/sectores/tiendas/hero.webp',
    photoPosition: '30% 50%',
    ctaLabel: 'Quiero que mis clientes repitan',
  },
  demo: {
    accion: 'Hacer una compra',
    puntos: 30,
    sellos: 5,
    maquina: ['5 € de descuento', 'Envoltorio de regalo', 'Bolsa de tela', 'Doble de puntos'],
    promo: { titulo: 'Preventa para socios', texto: 'Entra antes que nadie: 30 % el jueves' },
  },
  phone: {
    points: 860,
    progressLabel: 'A 140 puntos de tu cupón de 10 €',
    progress: 0.86,
    items: [
      { icon: 'stamp', label: 'Mis puntos y sellos' },
      { icon: 'tag', label: 'Promociones exclusivas' },
      { icon: 'history', label: 'Tus compras' },
      { icon: 'users', label: 'Invita a un amigo' },
    ],
    reward: { title: 'Tu cupón de 10 € de descuento', photo: '/sectores/tiendas/bolsa.webp' },
  },
  howItWorks: {
    title: 'Así funciona en tu tienda',
    intro:
      'Todo gira alrededor de un QR: tu cliente lo escanea una vez para unirse y, desde ahí, en cada compra tu equipo le suma los puntos escaneando el QR de su móvil.',
    steps: [
      { who: 'Tú', visual: 'setup', title: 'Configuras tu programa', text: 'En el asistente de alta eliges tu logo y colores, cuántos puntos da cada euro, el regalo de bienvenida y el premio por traer a un amigo.' },
      { who: 'Tú', visual: 'qr', title: 'Pones tu QR en la caja', text: 'Descargas tu QR y lo colocas en la caja, el escaparate o los probadores.' },
      { who: 'Tu cliente', visual: 'signup', title: 'Lo escanea y se une', text: 'Con la cámara del móvil, deja su nombre y su email en 30 segundos. Sin descargar ninguna app.' },
      { who: 'Tu equipo', visual: 'scan', title: 'Suma en cada compra', text: 'Al cobrar, escanea el QR de su móvil e introduce el importe para sumarle los puntos de esa compra.' },
      { who: 'Tu cliente', visual: 'reward', title: 'Recibe su premio', text: 'Al llegar a los puntos le llega su cupón, por ejemplo 10 € de descuento, y lo canjea en su próxima compra.' },
      { who: 'Tú', visual: 'results', title: 'Ves quién compra y cuánto', text: 'Desde tu panel ves la frecuencia y el ticket medio de tus clientes, y les avisas de novedades y rebajas por email o SMS.' },
    ],
  },
  problem: {
    eyebrow: 'Vender no es fidelizar',
    title1: 'Tu tienda puede vender mucho',
    title2: 'y aun así no conocer a sus clientes.',
    body: 'Cada día entra gente que compra y se va. La pregunta es quién vuelve, cada cuánto y qué haces para que lo haga.',
    contrast1: 'Competir en precio con internet es imposible.',
    contrast2: 'Competir en trato, no.',
    tail1: 'Tus clientes te eligen por el trato y el consejo. Lo que falta es un motivo para volver antes que a otra tienda.',
    tail2: 'Y sin ese motivo, la próxima compra se hace con un clic en otra parte.',
  },
  method: {
    eyebrow: 'El método Qronnect',
    title: 'No te damos una tarjeta. Te damos clientes que repiten.',
    subtitle: 'Tres piezas trabajando juntas en tu tienda, cada una en lo que mejor hace.',
    equation: ['Puntos y sellos', 'Promociones', 'Referidos'],
    result: 'clientes que repiten',
    pillars: [
      {
        icon: 'stamp',
        title: 'Puntos y sellos',
        subtitle: 'Premia cada compra.',
        text: 'Cada euro suma. Tu cliente ve sus puntos en el móvil y sabe cuánto le falta para su cupón.',
      },
      {
        icon: 'megaphone',
        title: 'Promociones',
        subtitle: 'Avisa de novedades y rebajas.',
        text: 'Envía las novedades de temporada o una oferta solo para socios por email o SMS, a todos o solo a tus mejores clientes.',
      },
      {
        icon: 'users',
        title: 'Referidos',
        subtitle: 'El boca a boca, con premio.',
        text: 'Cada cliente tiene su código. Cuando trae a un amigo, los dos ganan puntos (tú decides cuántos, también en su primera compra) y tú sumas un cliente nuevo.',
      },
    ],
  },
  ideas: {
    label: 'Ideas que funcionan en tiendas',
    items: [
      { label: 'Puntos', title: 'Cupón de 10 €', text: 'Al llegar a los puntos que tú decidas.', photo: '/sectores/tiendas/boutique.webp' },
      { label: 'Cumpleaños', title: 'Un regalo en su mes', text: 'Un detalle que trae una visita.', photo: '/sectores/tiendas/flores.webp' },
      { label: 'Referidos', title: 'Trae a un amigo', text: 'Puntos para los dos al unirse y en su primera compra.', photo: '/sectores/tiendas/ropa.webp' },
      { label: 'Solo socios', title: 'Novedades primero', text: 'Avisa antes a los de casa.', photo: '/sectores/tiendas/cosmetica.webp' },
    ],
    ctaTitle: '¿Qué programa encaja en tu tienda?',
    ctaText: 'Cuéntanos cómo trabajas y te proponemos los puntos, las promociones y los premios que mejor encajan contigo.',
  },
  included: {
    title: 'Lo que tienes desde el primer día',
    items: [
      { icon: 'palette', title: 'Tu marca', text: 'Tu logo y tus colores en la tarjeta, las promociones y los emails.' },
      { icon: 'gift', title: 'Regalos de bienvenida y cumpleaños', text: 'Detalles automáticos que traen visitas.' },
      { icon: 'mail', title: 'Campañas por email y SMS', text: 'Para avisar de novedades, rebajas y eventos en tienda.' },
      { icon: 'chart', title: 'Informes de tu tienda', text: 'Frecuencia de compra, ticket medio y qué funciona.' },
    ],
  },
  fit: {
    forWho: [
      'Tiendas de ropa y calzado, perfumerías, librerías, floristerías, tiendas de mascotas y de regalo.',
      'Comercios con clientes habituales que quieren que compren más a menudo.',
      'Quien quiere conocer a sus clientes sin depender de una gran plataforma.',
    ],
    notFor: [
      'Quien busca un TPV o una tienda online: Qronnect fideliza, no cobra ni vende por internet.',
      'Negocios de paso sin clientes que repitan.',
      'Quien no quiere comunicarse con sus clientes.',
    ],
  },
  stats: [
    { value: '+40%*', label: 'clientes recurrentes' },
    { value: '+25%*', label: 'ticket medio' },
    { value: '-60%*', label: 'tiempo de gestión manual' },
  ],
  statsFootnote: '*Resultados orientativos de negocios que usan Qronnect. Dependen de cada tienda.',
  // TODO: sustituir por un testimonio real de una tienda antes de publicar
  testimonial: {
    quote: 'Antes no sabíamos quién era cliente habitual. Ahora les avisamos de las novedades y vuelven en cuanto llega la temporada.',
    author: 'Marta G.',
    role: 'Propietaria de boutique',
    photo: '/sectores/tiendas/testimonio.webp',
  },
  closing: {
    title1: 'Los clientes no se pierden de golpe.',
    title2: 'Se van una compra cada vez.',
    rhythm: ['Una novedad que no vieron.', 'Unas rebajas que no les llegaron.', 'Un cumpleaños sin felicitar.', 'Un clic en otra tienda.'],
    line1: 'Nada parece lo bastante grave como para preocuparse.',
    line2: 'Hasta que dejan de entrar.',
    pre: 'No esperes a notarlo en la caja.',
    highlight: 'Dale a cada cliente un motivo para volver a tu tienda.',
  },
  faq: [
    {
      q: '¿Mis clientes tienen que descargar una app?',
      a: 'No. Se registran en 30 segundos desde el móvil escaneando tu QR y su tarjeta funciona en el navegador.',
    },
    {
      q: '¿Puedo dar puntos según lo que gasta cada cliente?',
      a: 'Sí. Configuras cuántos puntos da cada euro y tu equipo introduce el importe al escanear el QR del cliente.',
    },
    {
      q: '¿Puedo avisar de las rebajas solo a mis mejores clientes?',
      a: 'Sí. Puedes segmentar las campañas por ticket medio, por puntos acumulados o por días desde la última visita.',
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
  [deporte.slug]: deporte,
  [tiendas.slug]: tiendas,
}

export function getSector(slug: string): SectorData | undefined {
  return SECTORES[slug]
}
