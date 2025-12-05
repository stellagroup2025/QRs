// ============================================
// TIPOS Y ENUMS PARA SISTEMA DE SELLOS
// ============================================

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

// ============================================
// DETALLES DE PREMIOS (según tipo)
// ============================================

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

// ============================================
// INTERFACES PRINCIPALES
// ============================================

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
  fecha_inicio?: string;
  fecha_fin?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface TarjetaSelloCliente {
  id: string;
  id_cliente: string;
  id_programa: string;
  id_tienda: string;
  sellos_actuales: number;
  sellos_objetivo: number;
  estado: EstadoTarjetaSello;
  fecha_inicio: string;
  fecha_completada?: string;
  fecha_canjeada?: string;
  fecha_expiracion?: string;
  codigo_cupon?: string;
  cupon_canjeado: boolean;
  cupon_canjeado_por?: string;
  notificacion_enviada: boolean;
  visto_por_cliente: boolean;
  fecha_visto?: string;
  creado_en: string;
  actualizado_en: string;
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
  fecha_otorgado: string;
  creado_en: string;
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
  fecha_inicio: string;
  fecha_completada?: string;
  fecha_canjeada?: string;
  fecha_expiracion?: string;
  puede_canjear: boolean;
  creado_en: string;
  actualizado_en: string;
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
  creado_en: string;
  actualizado_en: string;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface CrearProgramaSellosRequest {
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
  activo?: boolean;
  visible_cliente?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface ActualizarProgramaSellosRequest
  extends Partial<CrearProgramaSellosRequest> {}

export interface OtorgarSelloRequest {
  id_cliente: string;
  id_programa: string;
  id_compra?: string;
  monto_compra?: number;
  notas?: string;
}

export interface CanjearCuponSelloRequest {
  codigo_cupon: string;
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
  limite_dia?: number;
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
  fecha_canje?: string;
  estado?: EstadoTarjetaSello;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function obtenerTextoTipoPremio(tipo: TipoPremioSello): string {
  const textos: Record<TipoPremioSello, string> = {
    [TipoPremioSello.PRODUCTO]: 'Producto',
    [TipoPremioSello.DESCUENTO_PORCENTAJE]: 'Descuento %',
    [TipoPremioSello.DESCUENTO_FIJO]: 'Descuento €',
    [TipoPremioSello.PUNTOS]: 'Puntos',
    [TipoPremioSello.TEXTO]: 'Otro premio',
  };
  return textos[tipo];
}

export function obtenerTextoEstado(estado: EstadoTarjetaSello): string {
  const textos: Record<EstadoTarjetaSello, string> = {
    [EstadoTarjetaSello.ACTIVA]: 'Activa',
    [EstadoTarjetaSello.COMPLETADA]: 'Completada',
    [EstadoTarjetaSello.CANJEADA]: 'Canjeada',
    [EstadoTarjetaSello.EXPIRADA]: 'Expirada',
    [EstadoTarjetaSello.CANCELADA]: 'Cancelada',
  };
  return textos[estado];
}

export function obtenerColorEstado(estado: EstadoTarjetaSello): string {
  const colores: Record<EstadoTarjetaSello, string> = {
    [EstadoTarjetaSello.ACTIVA]: 'blue',
    [EstadoTarjetaSello.COMPLETADA]: 'green',
    [EstadoTarjetaSello.CANJEADA]: 'gray',
    [EstadoTarjetaSello.EXPIRADA]: 'red',
    [EstadoTarjetaSello.CANCELADA]: 'orange',
  };
  return colores[estado];
}

export function formatearPremio(
  tipo: TipoPremioSello,
  detalles: PremioDetalles,
): string {
  switch (tipo) {
    case TipoPremioSello.PRODUCTO:
      return (detalles as PremioDetallesProducto).nombre;
    case TipoPremioSello.DESCUENTO_PORCENTAJE:
      return `${(detalles as PremioDetallesDescuentoPorcentaje).porcentaje}% de descuento`;
    case TipoPremioSello.DESCUENTO_FIJO:
      return `${(detalles as PremioDetallesDescuentoFijo).monto}€ de descuento`;
    case TipoPremioSello.PUNTOS:
      return `${(detalles as PremioDetallesPuntos).puntos} puntos`;
    case TipoPremioSello.TEXTO:
      return (detalles as PremioDetallesTexto).texto;
    default:
      return 'Premio';
  }
}

export function calcularDiasRestantes(fecha_expiracion?: string): number | null {
  if (!fecha_expiracion) return null;

  const ahora = new Date();
  const expiracion = new Date(fecha_expiracion);
  const diferencia = expiracion.getTime() - ahora.getTime();
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

  return dias > 0 ? dias : 0;
}

export function estaExpirado(fecha_expiracion?: string): boolean {
  if (!fecha_expiracion) return false;

  const ahora = new Date();
  const expiracion = new Date(fecha_expiracion);

  return expiracion < ahora;
}

export function obtenerIconoPorTipo(tipo: TipoPremioSello): string {
  const iconos: Record<TipoPremioSello, string> = {
    [TipoPremioSello.PRODUCTO]: 'gift',
    [TipoPremioSello.DESCUENTO_PORCENTAJE]: 'percent',
    [TipoPremioSello.DESCUENTO_FIJO]: 'euro',
    [TipoPremioSello.PUNTOS]: 'star',
    [TipoPremioSello.TEXTO]: 'ticket',
  };
  return iconos[tipo] || 'gift';
}
