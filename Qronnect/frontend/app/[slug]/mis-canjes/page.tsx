'use client'

import { useParams } from 'next/navigation'
import { CuponesView } from '@/components/cliente/CuponesView'

/** Mis cupones: premios canjeados con puntos y regalos recibidos */
export default function Page() {
  const params = useParams()
  return <CuponesView slug={params.slug as string} />
}
