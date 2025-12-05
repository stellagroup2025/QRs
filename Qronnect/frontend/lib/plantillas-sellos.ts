/**
 * Plantillas de programas de sellos predefinidas por sector
 *
 * Estas plantillas sirven como punto de partida para que las tiendas
 * puedan crear rápidamente programas de fidelización adaptados a su sector.
 */

import { TipoPremioSello } from '@/types/sellos';

export interface PlantillaSello {
  id: string;
  sector: string;
  icono_emoji: string; // Emoji que representa el sector
  nombre: string;
  descripcion: string;
  icono?: string; // Icono lucide-react
  color?: string;
  sellos_requeridos: number;
  tipo_premio: TipoPremioSello;
  premio_detalles: any;
  instrucciones_canje?: string;
  dias_validez_cupon?: number;
  sellos_por_dia_max?: number;
  activo?: boolean;
  visible_cliente?: boolean;
}

export const PLANTILLAS_SELLOS: PlantillaSello[] = [
  // PELUQUERÍAS Y ESTÉTICA
  {
    id: 'peluqueria-corte',
    sector: 'Peluquerías',
    icono_emoji: '💇',
    nombre: 'Corte Gratis',
    descripcion: 'Programa de fidelización para peluquerías - 8 cortes = 1 gratis',
    icono: 'scissors',
    color: '#EC4899',
    sellos_requeridos: 8,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Corte de pelo gratis',
      descripcion: 'Un corte de pelo completamente gratis',
    },
    instrucciones_canje: 'Presenta tu cupón en recepción para canjear tu corte gratis',
    dias_validez_cupon: 60,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'peluqueria-descuento',
    sector: 'Peluquerías',
    icono_emoji: '💇',
    nombre: 'Descuento 20%',
    descripcion: '6 servicios = 20% de descuento en tu próxima visita',
    icono: 'scissors',
    color: '#EC4899',
    sellos_requeridos: 6,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 20,
      max_descuento: 30,
    },
    instrucciones_canje: 'Muestra este cupón antes de pagar para aplicar tu descuento',
    dias_validez_cupon: 45,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // FLORISTERÍAS
  {
    id: 'floristeria-ramo',
    sector: 'Floristerías',
    icono_emoji: '💐',
    nombre: 'Ramo Gratis',
    descripcion: 'Compra 6 ramos y el 7º te lo regalamos',
    icono: 'flower',
    color: '#F472B6',
    sellos_requeridos: 6,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Ramo de flores gratis',
      descripcion: 'Un ramo de flores fresco (hasta 25€)',
    },
    instrucciones_canje: 'Elige tu ramo favorito y presenta este cupón',
    dias_validez_cupon: 30,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // RESTAURANTES
  {
    id: 'restaurante-menu',
    sector: 'Restaurantes',
    icono_emoji: '🍽️',
    nombre: 'Menú Gratis',
    descripcion: 'Come 10 veces y la 11ª comida corre por nuestra cuenta',
    icono: 'utensils',
    color: '#F59E0B',
    sellos_requeridos: 10,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Menú del día gratis',
      descripcion: 'Un menú completo del día (hasta 15€)',
    },
    instrucciones_canje: 'Presenta tu cupón al hacer tu pedido',
    dias_validez_cupon: 30,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'restaurante-descuento',
    sector: 'Restaurantes',
    icono_emoji: '🍽️',
    nombre: 'Descuento VIP',
    descripcion: 'Acumula 8 visitas y obtén 25% en tu próxima comida',
    icono: 'utensils',
    color: '#F59E0B',
    sellos_requeridos: 8,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 25,
      max_descuento: 50,
    },
    instrucciones_canje: 'Muestra este cupón antes de pedir la cuenta',
    dias_validez_cupon: 45,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // BARES Y CAFETERÍAS
  {
    id: 'bar-cafe',
    sector: 'Bares y Cafeterías',
    icono_emoji: '☕',
    nombre: 'Café Gratis',
    descripcion: 'Toma 7 cafés y el 8º invita la casa',
    icono: 'coffee',
    color: '#78350F',
    sellos_requeridos: 7,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Café gratis',
      descripcion: 'Un café de cualquier tipo completamente gratis',
    },
    instrucciones_canje: 'Presenta tu cupón al pedir tu café',
    dias_validez_cupon: 30,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'bar-desayuno',
    sector: 'Bares y Cafeterías',
    icono_emoji: '☕',
    nombre: 'Desayuno Completo',
    descripcion: 'Acumula 10 desayunos y consigue uno completo gratis',
    icono: 'coffee',
    color: '#78350F',
    sellos_requeridos: 10,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Desayuno completo gratis',
      descripcion: 'Café + tostada + zumo de naranja',
    },
    instrucciones_canje: 'Muestra este cupón al pedir tu desayuno',
    dias_validez_cupon: 30,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // PASTELERÍAS Y PANADERÍAS
  {
    id: 'pasteleria-tarta',
    sector: 'Pastelerías',
    icono_emoji: '🎂',
    nombre: 'Tarta de Regalo',
    descripcion: 'Compra 8 veces y llévate una tarta individual gratis',
    icono: 'cake',
    color: '#F97316',
    sellos_requeridos: 8,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Tarta o pastelitos gratis',
      descripcion: 'Una tarta individual o 4 pastelitos a elegir',
    },
    instrucciones_canje: 'Elige tu dulce favorito y presenta este cupón',
    dias_validez_cupon: 30,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'pasteleria-descuento',
    sector: 'Pastelerías',
    icono_emoji: '🎂',
    nombre: 'Descuento Dulce',
    descripcion: 'Acumula 5 compras y consigue 20% de descuento',
    icono: 'cake',
    color: '#F97316',
    sellos_requeridos: 5,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 20,
      max_descuento: 15,
    },
    instrucciones_canje: 'Presenta tu cupón antes de pagar',
    dias_validez_cupon: 30,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // BAZARES Y TIENDAS
  {
    id: 'bazar-descuento',
    sector: 'Bazares',
    icono_emoji: '🛍️',
    nombre: 'Cliente VIP',
    descripcion: 'Realiza 8 compras y obtén 15% de descuento',
    icono: 'shopping-bag',
    color: '#8B5CF6',
    sellos_requeridos: 8,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 15,
      max_descuento: 25,
    },
    instrucciones_canje: 'Muestra este cupón en caja antes de pagar',
    dias_validez_cupon: 60,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'bazar-puntos',
    sector: 'Bazares',
    icono_emoji: '🛍️',
    nombre: 'Puntos Extra',
    descripcion: 'Completa 5 compras y gana 500 puntos extra',
    icono: 'shopping-bag',
    color: '#8B5CF6',
    sellos_requeridos: 5,
    tipo_premio: TipoPremioSello.PUNTOS,
    premio_detalles: {
      puntos: 500,
    },
    instrucciones_canje: 'Los puntos se añadirán automáticamente a tu cuenta',
    dias_validez_cupon: 90,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // GIMNASIOS Y FITNESS
  {
    id: 'gimnasio-sesion',
    sector: 'Gimnasios',
    icono_emoji: '💪',
    nombre: 'Entrenamiento Gratis',
    descripcion: 'Asiste 10 veces y consigue una sesión personal gratis',
    icono: 'dumbbell',
    color: '#EF4444',
    sellos_requeridos: 10,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Sesión de entrenamiento personal',
      descripcion: 'Una hora de entrenamiento personalizado con nuestro coach',
    },
    instrucciones_canje: 'Reserva tu sesión en recepción presentando este cupón',
    dias_validez_cupon: 60,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // LIBRERÍAS
  {
    id: 'libreria-libro',
    sector: 'Librerías',
    icono_emoji: '📚',
    nombre: 'Libro Gratis',
    descripcion: 'Compra 6 libros y el 7º te lo regalamos',
    icono: 'book',
    color: '#0891B2',
    sellos_requeridos: 6,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Libro gratis',
      descripcion: 'Un libro a tu elección (hasta 20€)',
    },
    instrucciones_canje: 'Elige tu libro y presenta este cupón en caja',
    dias_validez_cupon: 90,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'libreria-descuento',
    sector: 'Librerías',
    icono_emoji: '📚',
    nombre: 'Descuento Lector',
    descripcion: 'Acumula 5 compras y obtén 15% de descuento',
    icono: 'book',
    color: '#0891B2',
    sellos_requeridos: 5,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 15,
      max_descuento: 10,
    },
    instrucciones_canje: 'Presenta tu cupón antes de pagar',
    dias_validez_cupon: 60,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // FARMACIAS Y PARAFARMACIAS
  {
    id: 'farmacia-descuento',
    sector: 'Farmacias',
    icono_emoji: '💊',
    nombre: 'Cliente Frecuente',
    descripcion: 'Realiza 8 compras y consigue 10% de descuento',
    icono: 'pill',
    color: '#10B981',
    sellos_requeridos: 8,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 10,
      max_descuento: 20,
    },
    instrucciones_canje: 'Válido solo en productos de parafarmacia',
    dias_validez_cupon: 60,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // ÓPTICAS
  {
    id: 'optica-descuento',
    sector: 'Ópticas',
    icono_emoji: '👓',
    nombre: 'Descuento Gafas',
    descripcion: 'Segunda montura con 30% de descuento',
    icono: 'glasses',
    color: '#6366F1',
    sellos_requeridos: 1,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 30,
      max_descuento: 100,
    },
    instrucciones_canje: 'Aplica en tu segunda compra de gafas',
    dias_validez_cupon: 180,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // TALLERES MECÁNICOS
  {
    id: 'taller-revision',
    sector: 'Talleres',
    icono_emoji: '🔧',
    nombre: 'Revisión Gratuita',
    descripcion: 'Cada 5 servicios, revisión completa gratis',
    icono: 'wrench',
    color: '#64748B',
    sellos_requeridos: 5,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Revisión completa del vehículo',
      descripcion: 'Revisión de 20 puntos + diagnóstico electrónico',
    },
    instrucciones_canje: 'Solicita cita previa presentando este cupón',
    dias_validez_cupon: 90,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'taller-descuento',
    sector: 'Talleres',
    icono_emoji: '🔧',
    nombre: 'Descuento Mantenimiento',
    descripcion: 'Acumula 4 servicios y obtén 15% de descuento',
    icono: 'wrench',
    color: '#64748B',
    sellos_requeridos: 4,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 15,
      max_descuento: 50,
    },
    instrucciones_canje: 'Descuento aplicable en mano de obra',
    dias_validez_cupon: 120,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // TIENDAS DE MASCOTAS
  {
    id: 'mascotas-bano',
    sector: 'Tiendas de Mascotas',
    icono_emoji: '🐾',
    nombre: 'Baño Gratis',
    descripcion: 'Cada 6 servicios de peluquería, el 7º es gratis',
    icono: 'dog',
    color: '#F59E0B',
    sellos_requeridos: 6,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Baño y corte gratis',
      descripcion: 'Servicio completo de peluquería canina',
    },
    instrucciones_canje: 'Reserva tu cita y presenta este cupón',
    dias_validez_cupon: 60,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'mascotas-descuento',
    sector: 'Tiendas de Mascotas',
    icono_emoji: '🐾',
    nombre: 'Descuento Comida',
    descripcion: 'Compra 5 sacos de pienso y obtén 20% de descuento',
    icono: 'dog',
    color: '#F59E0B',
    sellos_requeridos: 5,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 20,
      max_descuento: 30,
    },
    instrucciones_canje: 'Válido en tu próxima compra de pienso',
    dias_validez_cupon: 90,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // LAVANDERÍAS
  {
    id: 'lavanderia-servicio',
    sector: 'Lavanderías',
    icono_emoji: '👕',
    nombre: 'Lavado Gratis',
    descripcion: 'Cada 8 servicios, el 9º es gratis',
    icono: 'shirt',
    color: '#3B82F6',
    sellos_requeridos: 8,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Servicio de lavado gratis',
      descripcion: 'Lavado y planchado de hasta 5kg de ropa',
    },
    instrucciones_canje: 'Presenta tu cupón al dejar la ropa',
    dias_validez_cupon: 45,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // SPAS Y CENTROS DE BELLEZA
  {
    id: 'spa-masaje',
    sector: 'Spas y Centros de Belleza',
    icono_emoji: '💆',
    nombre: 'Masaje Gratis',
    descripcion: 'Reserva 5 tratamientos y el 6º masaje es gratis',
    icono: 'spa',
    color: '#A855F7',
    sellos_requeridos: 5,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Masaje relajante gratis',
      descripcion: 'Masaje relajante de 60 minutos',
    },
    instrucciones_canje: 'Reserva tu masaje con 48h de antelación',
    dias_validez_cupon: 90,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // ZAPATERÍAS
  {
    id: 'zapateria-descuento',
    sector: 'Zapaterías',
    icono_emoji: '👞',
    nombre: 'Descuento Segundo Par',
    descripcion: 'Compra un par y lleva el segundo con 25% de descuento',
    icono: 'footprints',
    color: '#92400E',
    sellos_requeridos: 1,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 25,
      max_descuento: 40,
    },
    instrucciones_canje: 'Válido en tu segunda compra de calzado',
    dias_validez_cupon: 30,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // TIENDAS DE ROPA
  {
    id: 'ropa-descuento',
    sector: 'Tiendas de Ropa',
    icono_emoji: '👔',
    nombre: 'Cliente VIP',
    descripcion: 'Acumula 6 compras y obtén 20% de descuento',
    icono: 'shirt',
    color: '#DB2777',
    sellos_requeridos: 6,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 20,
      max_descuento: 50,
    },
    instrucciones_canje: 'Descuento aplicable en toda la tienda',
    dias_validez_cupon: 60,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'ropa-puntos',
    sector: 'Tiendas de Ropa',
    icono_emoji: '👔',
    nombre: 'Puntos Fashion',
    descripcion: 'Cada 5 compras, 1000 puntos para canjear',
    icono: 'shirt',
    color: '#DB2777',
    sellos_requeridos: 5,
    tipo_premio: TipoPremioSello.PUNTOS,
    premio_detalles: {
      puntos: 1000,
    },
    instrucciones_canje: 'Puntos añadidos automáticamente a tu cuenta',
    dias_validez_cupon: 90,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // JOYERÍAS
  {
    id: 'joyeria-limpieza',
    sector: 'Joyerías',
    icono_emoji: '💍',
    nombre: 'Limpieza Gratis',
    descripcion: 'Cada 3 compras, limpieza de joyas gratis',
    icono: 'gem',
    color: '#FCD34D',
    sellos_requeridos: 3,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Limpieza profesional',
      descripcion: 'Limpieza y pulido profesional de tus joyas',
    },
    instrucciones_canje: 'Trae tus joyas con este cupón',
    dias_validez_cupon: 180,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // TINTORERÍAS
  {
    id: 'tintoreria-servicio',
    sector: 'Tintorerías',
    icono_emoji: '🧥',
    nombre: 'Tintado Gratis',
    descripcion: 'Cada 7 servicios, el 8º es por nuestra cuenta',
    icono: 'sparkles',
    color: '#06B6D4',
    sellos_requeridos: 7,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Servicio de tintorería gratis',
      descripcion: 'Un servicio completo de tintorería (hasta 3 prendas)',
    },
    instrucciones_canje: 'Presenta tu cupón al dejar las prendas',
    dias_validez_cupon: 60,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },

  // TIENDAS DE INFORMÁTICA
  {
    id: 'informatica-revision',
    sector: 'Tiendas de Informática',
    icono_emoji: '💻',
    nombre: 'Revisión Gratuita',
    descripcion: 'Cada 3 compras, revisión de equipo gratis',
    icono: 'laptop',
    color: '#3B82F6',
    sellos_requeridos: 3,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: {
      nombre: 'Revisión y limpieza de equipo',
      descripcion: 'Revisión completa, limpieza y diagnóstico de tu ordenador',
    },
    instrucciones_canje: 'Trae tu equipo con cita previa',
    dias_validez_cupon: 90,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
  {
    id: 'informatica-descuento',
    sector: 'Tiendas de Informática',
    icono_emoji: '💻',
    nombre: 'Descuento Tech',
    descripcion: 'Acumula 5 compras y obtén 10% de descuento',
    icono: 'laptop',
    color: '#3B82F6',
    sellos_requeridos: 5,
    tipo_premio: TipoPremioSello.DESCUENTO_PORCENTAJE,
    premio_detalles: {
      porcentaje: 10,
      max_descuento: 50,
    },
    instrucciones_canje: 'Válido en accesorios y periféricos',
    dias_validez_cupon: 60,
    sellos_por_dia_max: 1,
    activo: true,
    visible_cliente: true,
  },
];

/**
 * Obtiene todas las plantillas disponibles
 */
export function obtenerTodasLasPlantillas(): PlantillaSello[] {
  return PLANTILLAS_SELLOS;
}

/**
 * Obtiene plantillas filtradas por sector
 */
export function obtenerPlantillasPorSector(sector: string): PlantillaSello[] {
  return PLANTILLAS_SELLOS.filter(p => p.sector === sector);
}

/**
 * Obtiene todos los sectores únicos
 */
export function obtenerSectores(): string[] {
  const sectores = new Set(PLANTILLAS_SELLOS.map(p => p.sector));
  return Array.from(sectores).sort();
}

/**
 * Obtiene una plantilla específica por ID
 */
export function obtenerPlantillaPorId(id: string): PlantillaSello | undefined {
  return PLANTILLAS_SELLOS.find(p => p.id === id);
}

/**
 * Convierte una plantilla en un objeto listo para crear un programa
 */
export function plantillaAFormulario(plantilla: PlantillaSello) {
  return {
    nombre: plantilla.nombre,
    descripcion: plantilla.descripcion,
    icono: plantilla.icono || 'stamp',
    color: plantilla.color || '#3B82F6',
    sellos_requeridos: plantilla.sellos_requeridos,
    tipo_premio: plantilla.tipo_premio,
    premio_detalles: plantilla.premio_detalles,
    instrucciones_canje: plantilla.instrucciones_canje || 'Presenta este cupón al personal para canjearlo',
    dias_validez_cupon: plantilla.dias_validez_cupon || 30,
    sellos_por_dia_max: plantilla.sellos_por_dia_max || 1,
    requiere_compra_minima: false,
    activo: plantilla.activo !== false,
    visible_cliente: plantilla.visible_cliente !== false,
  };
}
