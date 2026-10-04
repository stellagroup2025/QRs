'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Dices } from 'lucide-react';
import { ClientCard, ClientEmpty, ClientPage, ClientSectionTitle, ClientSkeleton } from '@/components/cliente/ClientPage';
import { MaquinaGacha } from '@/components/cliente/gacha/MaquinaGacha';
import { TarjetaPremioGanado } from '@/components/cliente/gacha/TarjetaPremioGanado';
import { obtenerInfoGacha, obtenerMisPremiosGacha, verificarPuntosGacha } from '@/lib/api/gacha';
import { GachaConfig, PremioGanadoHistorial } from '@/types/gacha';

export default function GachaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<GachaConfig | null>(null);
  const [premios, setPremios] = useState<PremioGanadoHistorial[]>([]);
  const [puntosActuales, setPuntosActuales] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token');
      const tenant = slug;

      if (!token) {
        window.location.href = `/${slug}/recuperar`;
        return;
      }

      const [configData, premiosData, puntosData] = await Promise.all([
        obtenerInfoGacha(token, tenant),
        obtenerMisPremiosGacha(token, tenant),
        verificarPuntosGacha(token, tenant),
      ]);

      setConfig(configData);
      setPremios(premiosData);
      setPuntosActuales(puntosData.puntos_actuales);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientPage>
        <ClientSkeleton blocks={2} />
      </ClientPage>
    );
  }

  if (!config || !config.activo) {
    return (
      <ClientPage title="Máquina de premios">
        <ClientEmpty
          icon={<Dices className="h-7 w-7" aria-hidden="true" />}
          title="La máquina de premios está apagada"
          text="El negocio no la tiene activa ahora mismo. Vuelve más adelante."
        />
      </ClientPage>
    );
  }

  const premiosPendientes = premios.filter((p) => p.estado === 'pendiente');
  const historial = premios.filter((p) => p.estado !== 'pendiente');

  return (
    <ClientPage title={config.nombre || 'Máquina de premios'} subtitle={config.descripcion}>
      <MaquinaGacha config={config} puntosActuales={puntosActuales} onTiradaRealizada={cargarDatos} slug={slug} />

      {premiosPendientes.length > 0 && (
        <>
          <ClientSectionTitle>Premios por recoger</ClientSectionTitle>
          <div className="grid gap-4">
            {premiosPendientes.map((premio) => (
              <TarjetaPremioGanado key={premio.id} premio={premio} />
            ))}
          </div>
        </>
      )}

      <ClientSectionTitle>Cómo funciona</ClientSectionTitle>
      <ClientCard>
        <ol className="space-y-3 text-[15px]">
          {[
            `Cada tirada cuesta ${config.costo_puntos} puntos.`,
            'Te toca un premio al azar: cuanto más raro, más valioso.',
            'Recibes un código único para ese premio.',
            'Enséñalo en caja para recogerlo.',
          ].map((paso, i) => (
            <li key={paso} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold">{i + 1}</span>
              <span className="text-ink/75">{paso}</span>
            </li>
          ))}
        </ol>
      </ClientCard>

      {historial.length > 0 && (
        <>
          <ClientSectionTitle>Historial</ClientSectionTitle>
          <div className="grid gap-4">
            {historial.map((premio) => (
              <TarjetaPremioGanado key={premio.id} premio={premio} />
            ))}
          </div>
        </>
      )}
    </ClientPage>
  );
}
