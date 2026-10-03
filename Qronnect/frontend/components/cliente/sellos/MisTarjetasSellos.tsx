'use client';

import { useState, useEffect } from 'react';
import { TarjetaSelloConProgreso, EstadoTarjetaSello } from '@/types/sellos';
import { TarjetaSelloCard } from './TarjetaSelloCard';
import { Stamp } from 'lucide-react';
import { ClientEmpty, ClientSectionTitle, ClientSkeleton } from '@/components/cliente/ClientPage';
import { toast } from 'sonner';

interface MisTarjetasSellosProps {
  idCliente: string;
  token: string;
  slug: string;
}

export function MisTarjetasSellos({ idCliente, token, slug }: MisTarjetasSellosProps) {
  const [tarjetas, setTarjetas] = useState<TarjetaSelloConProgreso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTarjetas();
  }, []);

  const cargarTarjetas = async () => {
    try {
      setLoading(true);

      // Usar el nuevo endpoint para clientes
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/sellos/mis-tarjetas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener tarjetas');
      }

      const data = await response.json();
      setTarjetas(data);

      // Si no hay tarjetas, intentar inicializarlas
      if (data.length === 0) {
        await inicializarTarjetas();
      }
    } catch (error) {
      console.error('Error al cargar tarjetas:', error);
      toast.error('Error al cargar tus tarjetas de sellos');
    } finally {
      setLoading(false);
    }
  };

  const inicializarTarjetas = async () => {
    try {
      // Llamar al nuevo endpoint para clientes
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/sellos/inicializar-mis-tarjetas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      });

      // Si es 400, probablemente no hay programas activos - no es un error crítico
      if (response.status === 400) {
        console.log('No hay programas de sellos activos para inicializar');
        return;
      }

      if (response.ok) {
        // Recargar tarjetas
        const misTarjetasResponse = await fetch(`${API_URL}/api/sellos/mis-tarjetas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': slug,
          },
        });

        if (misTarjetasResponse.ok) {
          const tarjetasNuevas = await misTarjetasResponse.json();
          if (tarjetasNuevas.length > 0) {
            setTarjetas(tarjetasNuevas);
            toast.success('¡Tarjetas de sellos inicializadas!');
          }
        }
      }
    } catch (error) {
      console.error('Error al inicializar tarjetas:', error);
      // No mostramos error al usuario, es una operación silenciosa
    }
  };

  // Arriba las completas (premio pendiente) y las que están en marcha; abajo el historial
  const enCurso = tarjetas
    .filter((t) => t.estado === EstadoTarjetaSello.COMPLETADA || t.estado === EstadoTarjetaSello.ACTIVA)
    .sort((a, b) => Number(b.estado === EstadoTarjetaSello.COMPLETADA) - Number(a.estado === EstadoTarjetaSello.COMPLETADA));
  const historial = tarjetas.filter(
    (t) => t.estado !== EstadoTarjetaSello.COMPLETADA && t.estado !== EstadoTarjetaSello.ACTIVA,
  );

  if (loading) {
    return <ClientSkeleton blocks={2} />;
  }

  if (tarjetas.length === 0) {
    return (
      <ClientEmpty
        icon={<Stamp className="h-7 w-7" aria-hidden="true" />}
        title="Aún no tienes tarjetas de sellos"
        text="Cuando el negocio active una tarjeta de sellos, aparecerá aquí y sumarás un sello en cada visita."
      />
    );
  }

  return (
    <div>
      <ul className="space-y-4">
        {enCurso.map((tarjeta) => (
          <li key={tarjeta.id}>
            <TarjetaSelloCard tarjeta={tarjeta} />
          </li>
        ))}
      </ul>

      {historial.length > 0 && (
        <>
          <ClientSectionTitle>Historial</ClientSectionTitle>
          <ul className="space-y-4">
            {historial.map((tarjeta) => (
              <li key={tarjeta.id}>
                <TarjetaSelloCard tarjeta={tarjeta} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
