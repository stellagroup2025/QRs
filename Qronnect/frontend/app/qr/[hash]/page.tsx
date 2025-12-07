'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function QrRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Obtener info del QR desde el backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://qronnect-backend.onrender.com'}/q/${hash}/info`);

        if (!res.ok) {
          // Si el QR no existe, ir a landing
          window.location.href = 'https://qronnect.es';
          return;
        }

        const data = await res.json();

        // Si el QR está asignado, redirigir a la tienda
        if (data.id_tienda && data.url_destino !== 'https://qronnect.es') {
          window.location.href = data.url_destino;
          return;
        }

        // QR NO está asignado - verificar superadmin o comercial
        const superadminToken = localStorage.getItem('superadmin_token');
        const comercialToken = localStorage.getItem('comercial_token');

        if (superadminToken) {
          router.push(`/superadmin/asignar-qr?hash=${hash}`);
        } else if (comercialToken) {
          router.push(`/comerciales/asignar-qr?hash=${hash}`);
        } else {
          // Si no hay token administrativo, ir a landing
          window.location.href = 'https://qronnect.es';
        }
      } catch (error) {
        console.error('Error al procesar QR:', error);
        setError(true);
        setTimeout(() => {
          window.location.href = 'https://qronnect.es';
        }, 2000);
      }
    };

    if (hash) {
      handleRedirect();
    }
  }, [hash, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-purple-50">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-gray-700">QR no encontrado</p>
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
        <p className="text-xl font-semibold text-gray-700">Procesando QR...</p>
        <p className="text-sm text-gray-500">Redirigiendo a tu destino</p>
      </div>
    </div>
  );
}
