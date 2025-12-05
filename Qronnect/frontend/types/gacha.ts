export enum TipoPremioGacha {
  DESCUENTO_PORCENTAJE = 'descuento_porcentaje',
  DESCUENTO_FIJO = 'descuento_fijo',
  PRODUCTO_GRATIS = 'producto_gratis',
  PUNTOS_EXTRA = 'puntos_extra',
  SELLO_EXTRA = 'sello_extra',
}

export enum RarezaPremio {
  COMUN = 'comun',
  RARO = 'raro',
  EPICO = 'epico',
  LEGENDARIO = 'legendario',
}

export enum EstadoPremioGacha {
  PENDIENTE = 'pendiente',
  CANJEADO = 'canjeado',
  EXPIRADO = 'expirado',
}

export interface GachaConfig {
  id: string;
  id_tienda: string;
  activo: boolean;
  costo_puntos: number;
  nombre: string;
  descripcion: string;
  max_tiradas_por_dia: number | null;
  cooldown_minutos: number | null;
  color_primario: string;
  icono: string;
  creado_en: string;
  actualizado_en: string;
}

export interface PremioGacha {
  id: string;
  id_tienda: string;
  nombre: string;
  descripcion: string;
  tipo: TipoPremioGacha;
  valor: number;
  rareza: RarezaPremio;
  peso: number;
  imagen_url?: string;
  color_rareza: string;
  condiciones?: string;
  dias_validez: number;
  activo: boolean;
  stock_limitado: boolean;
  stock_actual: number | null;
  creado_en: string;
  actualizado_en: string;
}

export interface PremioGanadoHistorial {
  id: string;
  puntos_gastados: number;
  fecha_tirada: string;
  estado: EstadoPremioGacha;
  codigo_canje: string;
  fecha_expiracion: string;
  fecha_canjeado?: string;
  gacha_premios: {
    nombre: string;
    descripcion: string;
    tipo: TipoPremioGacha;
    valor: number;
    rareza: RarezaPremio;
    color_rareza: string;
    condiciones?: string;
    imagen_url?: string;
  };
}

export interface ResultadoTirada {
  premio_id: string;
  premio_nombre: string;
  premio_descripcion: string;
  premio_tipo: TipoPremioGacha;
  premio_valor: number;
  premio_rareza: RarezaPremio;
  codigo_canje: string;
  fecha_expiracion: string;
  puntos_restantes: number;
}

export interface EstadisticasGacha {
  total_tiradas: number;
  total_puntos_gastados: number;
  premios_canjeados: number;
  premios_pendientes: number;
  tasa_canje: number;
  por_rareza: {
    comun: number;
    raro: number;
    epico: number;
    legendario: number;
  };
}

export interface VerificacionPuntos {
  puntos_actuales: number;
  costo_gacha: number;
  puede_jugar: boolean;
}

// Helpers
export const getRarezaColor = (rareza: RarezaPremio): string => {
  switch (rareza) {
    case RarezaPremio.COMUN:
      return '#95A5A6';
    case RarezaPremio.RARO:
      return '#3498DB';
    case RarezaPremio.EPICO:
      return '#9B59B6';
    case RarezaPremio.LEGENDARIO:
      return '#F39C12';
    default:
      return '#95A5A6';
  }
};

export const getRarezaLabel = (rareza: RarezaPremio): string => {
  switch (rareza) {
    case RarezaPremio.COMUN:
      return 'Común';
    case RarezaPremio.RARO:
      return 'Raro';
    case RarezaPremio.EPICO:
      return 'Épico';
    case RarezaPremio.LEGENDARIO:
      return 'Legendario';
    default:
      return rareza;
  }
};

export const getTipoLabel = (tipo: TipoPremioGacha): string => {
  switch (tipo) {
    case TipoPremioGacha.DESCUENTO_PORCENTAJE:
      return 'Descuento %';
    case TipoPremioGacha.DESCUENTO_FIJO:
      return 'Descuento Fijo';
    case TipoPremioGacha.PRODUCTO_GRATIS:
      return 'Producto Gratis';
    case TipoPremioGacha.PUNTOS_EXTRA:
      return 'Puntos Extra';
    case TipoPremioGacha.SELLO_EXTRA:
      return 'Sello Extra';
    default:
      return tipo;
  }
};

export const formatearPremio = (tipo: TipoPremioGacha, valor: number): string => {
  switch (tipo) {
    case TipoPremioGacha.DESCUENTO_PORCENTAJE:
      return `${valor}% de descuento`;
    case TipoPremioGacha.DESCUENTO_FIJO:
      return `${valor}€ de descuento`;
    case TipoPremioGacha.PRODUCTO_GRATIS:
      return 'Producto gratis';
    case TipoPremioGacha.PUNTOS_EXTRA:
      return `+${valor} puntos`;
    case TipoPremioGacha.SELLO_EXTRA:
      return `+${valor} sello${valor > 1 ? 's' : ''}`;
    default:
      return `Premio: ${valor}`;
  }
};

export const calcularDiasRestantes = (fechaExpiracion: string): number | null => {
  if (!fechaExpiracion) return null;

  const expiracion = new Date(fechaExpiracion);
  const ahora = new Date();
  const diff = expiracion.getTime() - ahora.getTime();
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return dias > 0 ? dias : 0;
};

export const estaExpirado = (fechaExpiracion: string): boolean => {
  if (!fechaExpiracion) return false;
  return new Date(fechaExpiracion) < new Date();
};
