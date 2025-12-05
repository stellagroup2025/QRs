/**
 * Plantillas de programas de sellos predefinidas por sector
 *
 * Estas plantillas sirven como punto de partida para que las tiendas
 * puedan crear rápidamente programas de fidelización adaptados a su sector.
 */

import { CrearProgramaSellosRequest } from '@/types/sellos';

export interface PlantillaSello {
  id: string;
  sector: string;
  icono: string; // Emoji que representa el sector
  nombre: string;
  descripcion: string;
  config: Omit<CrearProgramaSellosRequest, 'nombre' | 'descripcion'>;
}

export const PLANTILLAS_SELLOS: PlantillaSello[] = [
  // PELUQUERÍAS Y ESTÉTICA
  {
    id: 'peluqueria-corte',
    sector: 'Peluquerías',
    icono: '💇',
    nombre: 'Corte Gratis',
    descripcion: 'Programa de fidelización para peluquerías - 8 cortes = 1 gratis',
    config: {
      num_sellos: 8,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Un corte de pelo gratis',
      activo: true,
    },
  },
  {
    id: 'peluqueria-tratamiento',
    sector: 'Peluquerías',
    icono: '💇',
    nombre: 'Tratamiento Premium',
    descripcion: 'Acumula 10 visitas y consigue un tratamiento capilar premium',
    config: {
      num_sellos: 10,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Tratamiento capilar premium (valor 40€)',
      activo: true,
    },
  },
  {
    id: 'peluqueria-descuento',
    sector: 'Peluquerías',
    icono: '💇',
    nombre: 'Descuento 20%',
    descripcion: '6 servicios = 20% de descuento en tu próxima visita',
    config: {
      num_sellos: 6,
      tipo_premio: 'descuento',
      valor_descuento: 20,
      descripcion_premio: '20% de descuento en cualquier servicio',
      activo: true,
    },
  },

  // FLORISTERÍAS
  {
    id: 'floristeria-ramo',
    sector: 'Floristerías',
    icono: '💐',
    nombre: 'Ramo Gratis',
    descripcion: 'Compra 6 ramos y el 7º te lo regalamos',
    config: {
      num_sellos: 6,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Un ramo de flores gratis (hasta 25€)',
      activo: true,
    },
  },
  {
    id: 'floristeria-descuento',
    sector: 'Floristerías',
    icono: '💐',
    nombre: 'Descuento Especial',
    descripcion: 'Acumula 5 compras y obtén 15% de descuento',
    config: {
      num_sellos: 5,
      tipo_premio: 'descuento',
      valor_descuento: 15,
      descripcion_premio: '15% de descuento en tu próxima compra',
      activo: true,
    },
  },

  // RESTAURANTES
  {
    id: 'restaurante-menu',
    sector: 'Restaurantes',
    icono: '🍽️',
    nombre: 'Menú Gratis',
    descripcion: 'Come 10 veces y la 11ª comida corre por nuestra cuenta',
    config: {
      num_sellos: 10,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Un menú del día gratis (hasta 15€)',
      activo: true,
    },
  },
  {
    id: 'restaurante-descuento',
    sector: 'Restaurantes',
    icono: '🍽️',
    nombre: 'Descuento VIP',
    descripcion: 'Acumula 8 visitas y obtén 25% en tu próxima comida',
    config: {
      num_sellos: 8,
      tipo_premio: 'descuento',
      valor_descuento: 25,
      descripcion_premio: '25% de descuento en tu próxima cuenta',
      activo: true,
    },
  },
  {
    id: 'restaurante-postre',
    sector: 'Restaurantes',
    icono: '🍽️',
    nombre: 'Postre de Regalo',
    descripcion: 'Cada 5 comidas, un postre por nuestra cuenta',
    config: {
      num_sellos: 5,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Postre gratis de la carta',
      activo: true,
    },
  },

  // BARES Y CAFETERÍAS
  {
    id: 'bar-cafe',
    sector: 'Bares y Cafeterías',
    icono: '☕',
    nombre: 'Café Gratis',
    descripcion: 'Toma 7 cafés y el 8º invita la casa',
    config: {
      num_sellos: 7,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Un café de cualquier tipo gratis',
      activo: true,
    },
  },
  {
    id: 'bar-desayuno',
    sector: 'Bares y Cafeterías',
    icono: '☕',
    nombre: 'Desayuno Completo',
    descripcion: 'Acumula 10 desayunos y consigue uno completo gratis',
    config: {
      num_sellos: 10,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Desayuno completo gratis (café + tostada + zumo)',
      activo: true,
    },
  },
  {
    id: 'bar-copas',
    sector: 'Bares y Cafeterías',
    icono: '🍺',
    nombre: 'Copa/Cerveza Gratis',
    descripcion: 'Cada 6 consumiciones, la 7ª corre por nuestra cuenta',
    config: {
      num_sellos: 6,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Una consumición gratis (cerveza, refresco o copa)',
      activo: true,
    },
  },

  // PASTELERÍAS Y PANADERÍAS
  {
    id: 'pasteleria-tarta',
    sector: 'Pastelerías',
    icono: '🎂',
    nombre: 'Tarta de Regalo',
    descripcion: 'Compra 8 veces y llévate una tarta individual gratis',
    config: {
      num_sellos: 8,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Una tarta individual o 4 pastelitos gratis',
      activo: true,
    },
  },
  {
    id: 'pasteleria-descuento',
    sector: 'Pastelerías',
    icono: '🎂',
    nombre: 'Descuento Dulce',
    descripcion: 'Acumula 5 compras y consigue 20% de descuento',
    config: {
      num_sellos: 5,
      tipo_premio: 'descuento',
      valor_descuento: 20,
      descripcion_premio: '20% de descuento en tu próxima compra',
      activo: true,
    },
  },
  {
    id: 'panaderia-pan',
    sector: 'Pastelerías',
    icono: '🥖',
    nombre: 'Pan del Día Gratis',
    descripcion: 'Compra pan 10 días seguidos y el 11º es gratis',
    config: {
      num_sellos: 10,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Barra de pan del día gratis',
      activo: true,
    },
  },

  // BAZARES Y TIENDAS
  {
    id: 'bazar-descuento',
    sector: 'Bazares',
    icono: '🛍️',
    nombre: 'Cliente VIP',
    descripcion: 'Realiza 8 compras y obtén 15% de descuento',
    config: {
      num_sellos: 8,
      tipo_premio: 'descuento',
      valor_descuento: 15,
      descripcion_premio: '15% de descuento en tu próxima compra',
      activo: true,
    },
  },
  {
    id: 'bazar-puntos',
    sector: 'Bazares',
    icono: '🛍️',
    nombre: 'Puntos Extra',
    descripcion: 'Completa 5 compras y gana 500 puntos extra',
    config: {
      num_sellos: 5,
      tipo_premio: 'puntos',
      valor_puntos: 500,
      descripcion_premio: '500 puntos extra para canjear',
      activo: true,
    },
  },

  // GIMNASIOS Y FITNESS
  {
    id: 'gimnasio-sesion',
    sector: 'Gimnasios',
    icono: '💪',
    nombre: 'Entrenamiento Gratis',
    descripcion: 'Asiste 10 veces y consigue una sesión personal gratis',
    config: {
      num_sellos: 10,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Sesión de entrenamiento personal gratis (1h)',
      activo: true,
    },
  },
  {
    id: 'gimnasio-mes',
    sector: 'Gimnasios',
    icono: '💪',
    nombre: 'Mes Gratis',
    descripcion: 'Recomienda a 5 amigos y consigue un mes de gimnasio gratis',
    config: {
      num_sellos: 5,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Un mes de gimnasio completamente gratis',
      activo: true,
    },
  },

  // LIBRERÍAS
  {
    id: 'libreria-libro',
    sector: 'Librerías',
    icono: '📚',
    nombre: 'Libro Gratis',
    descripcion: 'Compra 6 libros y el 7º te lo regalamos',
    config: {
      num_sellos: 6,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Un libro gratis (hasta 20€)',
      activo: true,
    },
  },
  {
    id: 'libreria-descuento',
    sector: 'Librerías',
    icono: '📚',
    nombre: 'Descuento Lector',
    descripcion: 'Acumula 5 compras y obtén 15% de descuento',
    config: {
      num_sellos: 5,
      tipo_premio: 'descuento',
      valor_descuento: 15,
      descripcion_premio: '15% de descuento en cualquier libro',
      activo: true,
    },
  },

  // FARMACIAS Y PARAFARMACIAS
  {
    id: 'farmacia-descuento',
    sector: 'Farmacias',
    icono: '💊',
    nombre: 'Cliente Frecuente',
    descripcion: 'Realiza 8 compras y consigue 10% de descuento',
    config: {
      num_sellos: 8,
      tipo_premio: 'descuento',
      valor_descuento: 10,
      descripcion_premio: '10% de descuento en parafarmacia',
      activo: true,
    },
  },
  {
    id: 'farmacia-producto',
    sector: 'Farmacias',
    icono: '💊',
    nombre: 'Regalo Wellness',
    descripcion: 'Acumula 10 compras y llévate un producto de regalo',
    config: {
      num_sellos: 10,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Producto de parafarmacia gratis (hasta 15€)',
      activo: true,
    },
  },

  // ÓPTICAS
  {
    id: 'optica-descuento',
    sector: 'Ópticas',
    icono: '👓',
    nombre: 'Descuento Gafas',
    descripcion: 'Segunda montura con 30% de descuento',
    config: {
      num_sellos: 1,
      tipo_premio: 'descuento',
      valor_descuento: 30,
      descripcion_premio: '30% de descuento en tu segunda montura',
      activo: true,
    },
  },
  {
    id: 'optica-revision',
    sector: 'Ópticas',
    icono: '👓',
    nombre: 'Revisión Gratis',
    descripcion: 'Cada 3 compras, revisión de vista gratuita',
    config: {
      num_sellos: 3,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Revisión de vista completa gratis',
      activo: true,
    },
  },

  // TALLERES MECÁNICOS
  {
    id: 'taller-revision',
    sector: 'Talleres',
    icono: '🔧',
    nombre: 'Revisión Gratuita',
    descripcion: 'Cada 5 servicios, revisión completa gratis',
    config: {
      num_sellos: 5,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Revisión completa del vehículo gratis',
      activo: true,
    },
  },
  {
    id: 'taller-descuento',
    sector: 'Talleres',
    icono: '🔧',
    nombre: 'Descuento Mantenimiento',
    descripcion: 'Acumula 4 servicios y obtén 15% de descuento',
    config: {
      num_sellos: 4,
      tipo_premio: 'descuento',
      valor_descuento: 15,
      descripcion_premio: '15% de descuento en mano de obra',
      activo: true,
    },
  },

  // TIENDAS DE MASCOTAS
  {
    id: 'mascotas-bano',
    sector: 'Tiendas de Mascotas',
    icono: '🐾',
    nombre: 'Baño Gratis',
    descripcion: 'Cada 6 servicios de peluquería, el 7º es gratis',
    config: {
      num_sellos: 6,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Baño y corte gratis para tu mascota',
      activo: true,
    },
  },
  {
    id: 'mascotas-descuento',
    sector: 'Tiendas de Mascotas',
    icono: '🐾',
    nombre: 'Descuento Comida',
    descripcion: 'Compra 5 sacos de pienso y obtén 20% de descuento',
    config: {
      num_sellos: 5,
      tipo_premio: 'descuento',
      valor_descuento: 20,
      descripcion_premio: '20% de descuento en tu próximo saco de pienso',
      activo: true,
    },
  },

  // LAVANDERÍAS
  {
    id: 'lavanderia-servicio',
    sector: 'Lavanderías',
    icono: '👕',
    nombre: 'Lavado Gratis',
    descripcion: 'Cada 8 servicios, el 9º es gratis',
    config: {
      num_sellos: 8,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Un servicio de lavado y planchado gratis',
      activo: true,
    },
  },
  {
    id: 'lavanderia-descuento',
    sector: 'Lavanderías',
    icono: '👕',
    nombre: 'Descuento Cliente',
    descripcion: 'Acumula 6 servicios y obtén 15% de descuento',
    config: {
      num_sellos: 6,
      tipo_premio: 'descuento',
      valor_descuento: 15,
      descripcion_premio: '15% de descuento en tu próximo servicio',
      activo: true,
    },
  },

  // SPAS Y CENTROS DE BELLEZA
  {
    id: 'spa-masaje',
    sector: 'Spas y Centros de Belleza',
    icono: '💆',
    nombre: 'Masaje Gratis',
    descripcion: 'Reserva 5 tratamientos y el 6º masaje es gratis',
    config: {
      num_sellos: 5,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Masaje relajante de 60 minutos gratis',
      activo: true,
    },
  },
  {
    id: 'spa-pack',
    sector: 'Spas y Centros de Belleza',
    icono: '💆',
    nombre: 'Pack Relax',
    descripcion: 'Acumula 8 visitas y consigue un pack de belleza',
    config: {
      num_sellos: 8,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Pack de productos de belleza (valor 40€)',
      activo: true,
    },
  },

  // ZAPATERÍAS
  {
    id: 'zapateria-descuento',
    sector: 'Zapaterías',
    icono: '👞',
    nombre: 'Descuento Segundo Par',
    descripcion: 'Compra un par y lleva el segundo con 25% de descuento',
    config: {
      num_sellos: 1,
      tipo_premio: 'descuento',
      valor_descuento: 25,
      descripcion_premio: '25% de descuento en tu segundo par',
      activo: true,
    },
  },
  {
    id: 'zapateria-regalo',
    sector: 'Zapaterías',
    icono: '👞',
    nombre: 'Complemento Gratis',
    descripcion: 'Cada 4 compras, un complemento de regalo',
    config: {
      num_sellos: 4,
      tipo_premio: 'producto_gratis',
      descripcion_premio: 'Complemento gratis (cinturón, calcetines, etc.)',
      activo: true,
    },
  },

  // TIENDAS DE ROPA
  {
    id: 'ropa-descuento',
    sector: 'Tiendas de Ropa',
    icono: '👔',
    nombre: 'Cliente VIP',
    descripcion: 'Acumula 6 compras y obtén 20% de descuento',
    config: {
      num_sellos: 6,
      tipo_premio: 'descuento',
      valor_descuento: 20,
      descripcion_premio: '20% de descuento en toda la tienda',
      activo: true,
    },
  },
  {
    id: 'ropa-puntos',
    sector: 'Tiendas de Ropa',
    icono: '👔',
    nombre: 'Puntos Fashion',
    descripcion: 'Cada 5 compras, 1000 puntos para canjear',
    config: {
      num_sellos: 5,
      tipo_premio: 'puntos',
      valor_puntos: 1000,
      descripcion_premio: '1000 puntos para canjear por ropa',
      activo: true,
    },
  },

  // JOYERÍAS
  {
    id: 'joyeria-limpieza',
    sector: 'Joyerías',
    icono: '💍',
    nombre: 'Limpieza Gratis',
    descripcion: 'Cada 3 compras, limpieza de joyas gratis',
    config: {
      num_sellos: 3,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Limpieza profesional de tus joyas gratis',
      activo: true,
    },
  },
  {
    id: 'joyeria-descuento',
    sector: 'Joyerías',
    icono: '💍',
    nombre: 'Descuento Exclusivo',
    descripcion: 'Segunda pieza con 15% de descuento',
    config: {
      num_sellos: 1,
      tipo_premio: 'descuento',
      valor_descuento: 15,
      descripcion_premio: '15% de descuento en tu segunda compra',
      activo: true,
    },
  },

  // TINTORERÍAS
  {
    id: 'tintoreria-servicio',
    sector: 'Tintorerías',
    icono: '🧥',
    nombre: 'Tintado Gratis',
    descripcion: 'Cada 7 servicios, el 8º es por nuestra cuenta',
    config: {
      num_sellos: 7,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Un servicio de tintorería gratis',
      activo: true,
    },
  },

  // TIENDAS DE INFORMÁTICA
  {
    id: 'informatica-revision',
    sector: 'Tiendas de Informática',
    icono: '💻',
    nombre: 'Revisión Gratuita',
    descripcion: 'Cada 3 compras, revisión de equipo gratis',
    config: {
      num_sellos: 3,
      tipo_premio: 'servicio_gratis',
      descripcion_premio: 'Revisión y limpieza de equipo gratis',
      activo: true,
    },
  },
  {
    id: 'informatica-descuento',
    sector: 'Tiendas de Informática',
    icono: '💻',
    nombre: 'Descuento Tech',
    descripcion: 'Acumula 5 compras y obtén 10% de descuento',
    config: {
      num_sellos: 5,
      tipo_premio: 'descuento',
      valor_descuento: 10,
      descripcion_premio: '10% de descuento en accesorios',
      activo: true,
    },
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
export function aplicarPlantilla(
  plantilla: PlantillaSello,
  personalizacion?: {
    nombre?: string;
    descripcion?: string;
  }
): CrearProgramaSellosRequest {
  return {
    nombre: personalizacion?.nombre || plantilla.nombre,
    descripcion: personalizacion?.descripcion || plantilla.descripcion,
    ...plantilla.config,
  };
}
