import {
  GachaConfig,
  PremioGacha,
  PremioGanadoHistorial,
  ResultadoTirada,
  EstadisticasGacha,
  VerificacionPuntos,
} from '@/types/gacha';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ===================================
// ADMIN - Configuración
// ===================================

export async function obtenerConfigGacha(token: string, domain: string): Promise<GachaConfig | null> {
  const res = await fetch(`${API_URL}/api/gacha/config`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Error al obtener configuración del gacha');
  }

  return res.json();
}

export async function configurarGacha(
  token: string,
  domain: string,
  config: Partial<GachaConfig>
): Promise<GachaConfig> {
  const res = await fetch(`${API_URL}/api/gacha/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    throw new Error('Error al configurar gacha');
  }

  return res.json();
}

// ===================================
// ADMIN - Premios
// ===================================

export async function obtenerPremios(
  token: string,
  domain: string,
  soloActivos: boolean = false
): Promise<PremioGacha[]> {
  const url = `${API_URL}/api/gacha/premios${soloActivos ? '?solo_activos=true' : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!res.ok) {
    throw new Error('Error al obtener premios');
  }

  return res.json();
}

export async function crearPremio(
  token: string,
  domain: string,
  premio: Partial<PremioGacha>
): Promise<PremioGacha> {
  const res = await fetch(`${API_URL}/api/gacha/premios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
    body: JSON.stringify(premio),
  });

  if (!res.ok) {
    throw new Error('Error al crear premio');
  }

  return res.json();
}

export async function actualizarPremio(
  token: string,
  domain: string,
  id: string,
  premio: Partial<PremioGacha>
): Promise<PremioGacha> {
  const res = await fetch(`${API_URL}/api/gacha/premios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
    body: JSON.stringify(premio),
  });

  if (!res.ok) {
    throw new Error('Error al actualizar premio');
  }

  return res.json();
}

export async function eliminarPremio(token: string, domain: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/gacha/premios/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!res.ok) {
    throw new Error('Error al eliminar premio');
  }
}

// ===================================
// ADMIN - Estadísticas
// ===================================

export async function obtenerEstadisticasGacha(
  token: string,
  domain: string
): Promise<EstadisticasGacha> {
  const res = await fetch(`${API_URL}/api/gacha/estadisticas`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!res.ok) {
    throw new Error('Error al obtener estadísticas');
  }

  return res.json();
}

// ===================================
// ADMIN - Canjear premios
// ===================================

export async function canjearPremioGacha(
  token: string,
  domain: string,
  codigo: string
): Promise<any> {
  const res = await fetch(`${API_URL}/api/gacha/canjear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
    body: JSON.stringify({ codigo_canje: codigo }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al canjear premio');
  }

  return res.json();
}

export async function verificarCodigoGacha(
  token: string,
  domain: string,
  codigo: string
): Promise<any> {
  const res = await fetch(`${API_URL}/api/gacha/verificar-codigo/${codigo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Código no válido');
  }

  return res.json();
}

// ===================================
// CLIENTE - Jugar gacha
// ===================================

export async function realizarTiradaGacha(
  token: string,
  domain: string
): Promise<ResultadoTirada> {
  const res = await fetch(`${API_URL}/api/gacha/tirar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al realizar tirada');
  }

  return res.json();
}

export async function obtenerMisPremiosGacha(
  token: string,
  domain: string
): Promise<PremioGanadoHistorial[]> {
  const res = await fetch(`${API_URL}/api/gacha/mis-premios`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!res.ok) {
    throw new Error('Error al obtener premios');
  }

  return res.json();
}

export async function verificarPuntosGacha(
  token: string,
  domain: string
): Promise<VerificacionPuntos> {
  const res = await fetch(`${API_URL}/api/gacha/verificar-puntos`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!res.ok) {
    throw new Error('Error al verificar puntos');
  }

  return res.json();
}

export async function obtenerInfoGacha(token: string, domain: string): Promise<GachaConfig | null> {
  const res = await fetch(`${API_URL}/api/gacha/info`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Error al obtener información del gacha');
  }

  return res.json();
}
