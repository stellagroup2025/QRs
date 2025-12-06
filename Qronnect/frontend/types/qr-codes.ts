// =====================================================
// TIPOS: Sistema de QR Codes Genéricos
// =====================================================

export interface QrCode {
  id: string;
  hash: string;
  qr_url: string;
  estado: 'disponible' | 'asignado' | 'desactivado';
  id_tienda: string | null;
  fecha_asignacion: string | null;
  lote: string | null;
  notas: string | null;
  total_escaneos: number;
  ultimo_escaneo: string | null;
  creado_en: string;
  actualizado_en: string;

  // Relaciones
  tienda?: {
    id: string;
    nombre: string;
    slug: string;
    sector?: string;
  };
}

export interface QrRedirectLog {
  id: string;
  id_qr: string;
  id_tienda: string | null;
  fecha_escaneo: string;
  user_agent: string;
  ip_address: string;
  pais: string | null;
  ciudad: string | null;
  url_destino: string;
  referer: string | null;
  dispositivo: 'mobile' | 'desktop' | 'tablet' | 'unknown';
}

export interface QrPoolEstadisticas {
  total: number;
  disponibles: number;
  asignados: number;
  desactivados: number;
  total_escaneos: number;
  lotes: string[];
}

export interface QrAnalytics {
  qr: QrCode;
  total_escaneos: number;
  por_dispositivo: Record<string, number>;
  por_fecha: Record<string, number>;
  ultimos_escaneos: QrRedirectLog[];
}

export interface GenerarQrCodesDto {
  cantidad: number;
  lote?: string;
}

export interface AsignarQrDto {
  hash: string;
  id_tienda: string;
}

export interface GenerarQrCodesResponse {
  cantidad_generada: number;
  lote: string;
  qr_codes: Array<{
    hash: string;
    qr_url: string;
  }>;
}

// Helpers
export function getEstadoColor(estado: QrCode['estado']): string {
  switch (estado) {
    case 'disponible':
      return '#22c55e'; // green
    case 'asignado':
      return '#3b82f6'; // blue
    case 'desactivado':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

export function getEstadoLabel(estado: QrCode['estado']): string {
  switch (estado) {
    case 'disponible':
      return 'Disponible';
    case 'asignado':
      return 'Asignado';
    case 'desactivado':
      return 'Desactivado';
    default:
      return estado;
  }
}

export function getDispositivoIcon(dispositivo: QrRedirectLog['dispositivo']): string {
  switch (dispositivo) {
    case 'mobile':
      return '📱';
    case 'desktop':
      return '💻';
    case 'tablet':
      return '📟';
    default:
      return '❓';
  }
}
