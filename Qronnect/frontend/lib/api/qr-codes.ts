// =====================================================
// API: QR Codes Genéricos
// =====================================================

import {
  QrCode,
  QrPoolEstadisticas,
  QrAnalytics,
  GenerarQrCodesDto,
  AsignarQrDto,
  GenerarQrCodesResponse,
} from '@/types/qr-codes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ===================================
// SUPERADMIN - Gestión de Pool
// ===================================

export async function generarQrCodes(
  token: string,
  dto: GenerarQrCodesDto,
): Promise<GenerarQrCodesResponse> {
  const res = await fetch(`${API_URL}/api/qr-codes/generar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al generar QR codes');
  }

  return res.json();
}

export async function listarQrCodes(
  token: string,
  estado?: string,
  lote?: string,
): Promise<QrCode[]> {
  const params = new URLSearchParams();
  if (estado) params.append('estado', estado);
  if (lote) params.append('lote', lote);

  const url = `${API_URL}/api/qr-codes${params.toString() ? `?${params.toString()}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Error al listar QR codes');
  }

  return res.json();
}

export async function obtenerEstadisticas(token: string): Promise<QrPoolEstadisticas> {
  const res = await fetch(`${API_URL}/api/qr-codes/estadisticas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Error al obtener estadísticas');
  }

  return res.json();
}

export async function listarTiendasSinQr(token: string): Promise<Array<{
  id: string;
  nombre: string;
  dominio: string;
  email: string;
  creado_en: string;
}>> {
  const res = await fetch(`${API_URL}/api/qr-codes/tiendas-sin-qr`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al listar tiendas sin QR' }));
    throw new Error(error.message || `Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export async function obtenerQrCode(token: string, hash: string): Promise<QrCode> {
  const res = await fetch(`${API_URL}/api/qr-codes/${hash}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('QR code no encontrado');
  }

  return res.json();
}

export async function asignarQr(token: string, dto: AsignarQrDto): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/qr-codes/asignar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al asignar QR code');
  }

  return res.json();
}

export async function desasignarQr(token: string, hash: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/qr-codes/${hash}/desasignar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Error al desasignar QR code');
  }

  return res.json();
}

export async function obtenerAnalytics(token: string, hash: string): Promise<QrAnalytics> {
  const res = await fetch(`${API_URL}/api/qr-codes/${hash}/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Error al obtener analytics');
  }

  return res.json();
}

export async function marcarQrComoDescargado(token: string, hash: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/qr-codes/${hash}/mark-downloaded`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Error al marcar QR como descargado');
  }

  return res.json();
}

export async function marcarLoteComoDescargado(token: string, hashes: string[]): Promise<any> {
  const res = await fetch(`${API_URL}/api/qr-codes/mark-batch-downloaded`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hashes }),
  });

  if (!res.ok) {
    throw new Error('Error al marcar lote como descargado');
  }

  return res.json();
}

export async function exportarCsv(token: string, lote: string): Promise<Blob> {
  const res = await fetch(`${API_URL}/api/qr-codes/exportar-csv?lote=${encodeURIComponent(lote)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Error al exportar CSV');
  }

  const data = await res.json();

  // Convertir a Blob para descarga
  const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8;' });
  return blob;
}

// ===================================
// UTILIDADES
// ===================================

export function descargarCsv(blob: Blob, filename: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generarUrlQr(hash: string): string {
  return `https://qronnect.es/q/${hash}`;
}
