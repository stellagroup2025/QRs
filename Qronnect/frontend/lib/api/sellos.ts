import {
  ProgramaSellos,
  TarjetaSelloConProgreso,
  SelloOtorgado,
  EstadisticasProgramaSellos,
  CrearProgramaSellosRequest,
  ActualizarProgramaSellosRequest,
  OtorgarSelloRequest,
  CanjearCuponSelloRequest,
  RespuestaOtorgarSello,
  RespuestaCanjearCupon,
} from '@/types/sellos';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================
// PROGRAMAS DE SELLOS (Admin)
// ============================================

export async function crearProgramaSellos(
  data: CrearProgramaSellosRequest,
  token: string,
  domain: string
): Promise<ProgramaSellos> {
  const response = await fetch(`${API_URL}/api/sellos/programas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear programa de sellos');
  }

  return response.json();
}

export async function obtenerProgramasSellos(
  token: string,
  domain: string,
  soloActivos = false
): Promise<ProgramaSellos[]> {
  const url = new URL(`${API_URL}/api/sellos/programas`);
  if (soloActivos) {
    url.searchParams.append('solo_activos', 'true');
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener programas de sellos');
  }

  return response.json();
}

export async function obtenerProgramaSello(
  id: string,
  token: string,
  domain: string
): Promise<ProgramaSellos> {
  const response = await fetch(`${API_URL}/api/sellos/programas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Programa de sellos no encontrado');
  }

  return response.json();
}

export async function actualizarProgramaSello(
  id: string,
  data: ActualizarProgramaSellosRequest,
  token: string,
  domain: string
): Promise<ProgramaSellos> {
  const response = await fetch(`${API_URL}/api/sellos/programas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar programa');
  }

  return response.json();
}

export async function eliminarProgramaSello(
  id: string,
  token: string,
  domain: string,
  force = false
): Promise<void> {
  const url = new URL(`${API_URL}/api/sellos/programas/${id}`);
  if (force) {
    url.searchParams.append('force', 'true');
  }

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Error al eliminar programa');
  }
}

export async function obtenerEstadisticasPrograma(
  id: string,
  token: string,
  domain: string
): Promise<EstadisticasProgramaSellos | null> {
  const response = await fetch(`${API_URL}/api/sellos/programas/${id}/estadisticas`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas del programa');
  }

  return response.json();
}

// ============================================
// OTORGAR Y CANJEAR (Staff/Admin)
// ============================================

export async function otorgarSello(
  data: OtorgarSelloRequest,
  token: string,
  domain: string
): Promise<RespuestaOtorgarSello> {
  const response = await fetch(`${API_URL}/api/sellos/otorgar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al otorgar sello');
  }

  return response.json();
}

export async function canjearCuponSello(
  data: CanjearCuponSelloRequest,
  token: string,
  domain: string
): Promise<RespuestaCanjearCupon> {
  const response = await fetch(`${API_URL}/api/sellos/canjear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al canjear cupón');
  }

  return response.json();
}

export async function verificarCuponSello(
  codigo: string,
  token: string,
  domain: string
): Promise<TarjetaSelloConProgreso> {
  const response = await fetch(`${API_URL}/api/sellos/verificar-cupon/${codigo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Cupón no encontrado');
  }

  return response.json();
}

// ============================================
// TARJETAS DE CLIENTES
// ============================================

export async function obtenerTarjetasCliente(
  idCliente: string,
  token: string,
  domain: string,
  soloActivas = false
): Promise<TarjetaSelloConProgreso[]> {
  const url = new URL(`${API_URL}/api/sellos/clientes/${idCliente}/tarjetas`);
  if (soloActivas) {
    url.searchParams.append('solo_activas', 'true');
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener tarjetas del cliente');
  }

  return response.json();
}

export async function obtenerTarjetasTienda(
  token: string,
  domain: string,
  estado?: string
): Promise<TarjetaSelloConProgreso[]> {
  const url = new URL(`${API_URL}/api/sellos/tarjetas`);
  if (estado) {
    url.searchParams.append('estado', estado);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener tarjetas');
  }

  return response.json();
}

export async function obtenerDetalleTarjeta(
  id: string,
  token: string,
  domain: string
): Promise<TarjetaSelloConProgreso> {
  const response = await fetch(`${API_URL}/api/sellos/tarjetas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Tarjeta no encontrada');
  }

  return response.json();
}

export async function obtenerSellosTarjeta(
  id: string,
  token: string,
  domain: string
): Promise<SelloOtorgado[]> {
  const response = await fetch(`${API_URL}/api/sellos/tarjetas/${id}/sellos`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener sellos de la tarjeta');
  }

  return response.json();
}

export async function cancelarTarjeta(id: string, token: string, domain: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/sellos/tarjetas/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Error al cancelar tarjeta');
  }
}

// ============================================
// ESTADÍSTICAS
// ============================================

export async function obtenerEstadisticasSellos(
  token: string,
  domain: string
): Promise<EstadisticasProgramaSellos[]> {
  const response = await fetch(`${API_URL}/api/sellos/estadisticas`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Domain': domain,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas');
  }

  return response.json();
}
