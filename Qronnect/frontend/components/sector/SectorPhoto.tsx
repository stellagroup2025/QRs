'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Foto de una landing de sector. Si el archivo aún no está en /public,
 * muestra un panel con el color suave del sector en lugar de una imagen rota.
 */
export function SectorPhoto({
  src,
  alt = '',
  className,
  priority = false,
}: {
  src: string
  alt?: string
  className?: string
  priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Si la imagen falló antes de hidratar, onError ya no se dispara: lo comprobamos al montar
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) setFailed(true)
  }, [])

  if (failed) {
    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        className={cn('bg-[linear-gradient(135deg,var(--s-soft),var(--s-softer))]', className)}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  )
}
