export enum TipoPremioSello {
  PRODUCTO = 'producto',
  DESCUENTO_PORCENTAJE = 'descuento_porcentaje',
  DESCUENTO_FIJO = 'descuento_fijo',
  PUNTOS = 'puntos',
  TEXTO = 'texto',
}

export enum EstadoTarjetaSello {
  ACTIVA = 'activa',
  COMPLETADA = 'completada',
  CANJEADA = 'canjeada',
  EXPIRADA = 'expirada',
  CANCELADA = 'cancelada',
}

export interface PremioDetallesProducto {
  nombre: string;
  descripcion?: string;
  imagen?: string;
}

export interface PremioDetallesDescuentoPorcentaje {
  porcentaje: number;
  max_descuento?: number;
}

export interface PremioDetallesDescuentoFijo {
  monto: number;
  moneda?: string;
}

export interface PremioDetallesPuntos {
  puntos: number;
}

export interface PremioDetallesTexto {
  texto: string;
  instrucciones?: string;
}

export type PremioDetalles =
  | PremioDetallesProducto
  | PremioDetallesDescuentoPorcentaje
  | PremioDetallesDescuentoFijo
  | PremioDetallesPuntos
  | PremioDetallesTexto;

export interface ProgramaSellos {
  id: string;
  id_tienda: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  imagen_url?: string;
  color?: string;
  sellos_requeridos: number;
  tipo_premio: TipoPremioSello;
  premio_detalles: PremioDetalles;
  instrucciones_canje?: string;
  dias_validez_cupon?: number;
  sellos_por_dia_max?: number;
  requiere_compra_minima?: boolean;
  compra_minima?: number;
  activo: boolean;
  visible_cliente: boolean;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  creado_en: Date;
  actualizado_en: Date;
}

export interface TarjetaSelloCliente {
  id: string;
  id_cliente: string;
  id_programa: string;
  id_tienda: string;
  sellos_actuales: number;
  sellos_objetivo: number;
  estado: EstadoTarjetaSello;
  fecha_inicio: Date;
  fecha_completada?: Date;
  fecha_canjeada?: Date;
  fecha_expiracion?: Date;
  codigo_cupon?: string;
  cupon_canjeado: boolean;
  cupon_canjeado_por?: string;
  notificacion_enviada: boolean;
  visto_por_cliente: boolean;
  fecha_visto?: Date;
  creado_en: Date;
  actualizado_en: Date;
}

export interface SelloOtorgado {
  id: string;
  id_tarjeta: string;
  id_cliente: string;
  id_tienda: string;
  id_programa: string;
  numero_sello: number;
  id_compra?: string;
  monto_compra?: number;
  otorgado_por?: string;
  notas?: string;
  metadata?: Record<string, any>;
  fecha_otorgado: Date;
  creado_en: Date;
}

export interface TarjetaSelloConProgreso {
  id: string;
  id_cliente: string;
  id_tienda: string;
  cliente_nombre: string;
  cliente_email: string;
  programa_id: string;
  programa_nombre: string;
  programa_descripcion?: string;
  programa_icono?: string;
  programa_imagen?: string;
  programa_color?: string;
  tipo_premio: TipoPremioSello;
  premio_detalles: PremioDetalles;
  instrucciones_canje?: string;
  sellos_actuales: number;
  sellos_objetivo: number;
  porcentaje_completado: number;
  estado: EstadoTarjetaSello;
  codigo_cupon?: string;
  cupon_canjeado: boolean;
  fecha_inicio: Date;
  fecha_completada?: Date;
  fecha_canjeada?: Date;
  fecha_expiracion?: Date;
  puede_canjear: boolean;
  creado_en: Date;
  actualizado_en: Date;
}

export interface EstadisticasProgramaSellos {
  programa_id: string;
  id_tienda: string;
  programa_nombre: string;
  activo: boolean;
  total_clientes_participantes: number;
  tarjetas_activas: number;
  tarjetas_completadas: number;
  tarjetas_canjeadas: number;
  total_sellos_otorgados: number;
  promedio_sellos_por_tarjeta: number;
  creado_en: Date;
  actualizado_en: Date;
}

export interface RespuestaOtorgarSello {
  success: boolean;
  error?: string;
  tarjeta_id?: string;
  sello_id?: string;
  sellos_actuales?: number;
  sellos_objetivo?: number;
  completada?: boolean;
  codigo_cupon?: string;
  premio?: PremioDetalles;
}

export interface RespuestaCanjearCupon {
  success: boolean;
  error?: string;
  mensaje?: string;
  tarjeta_id?: string;
  cliente_id?: string;
  programa_nombre?: string;
  tipo_premio?: TipoPremioSello;
  premio_detalles?: PremioDetalles;
  instrucciones?: string;
  fecha_canje?: Date;
  estado?: EstadoTarjetaSello;
}
