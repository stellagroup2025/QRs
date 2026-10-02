'use client'

import { QRCodeSVG } from 'qrcode.react'
import type { SectorData } from '@/lib/sectores'
import { LotusMark } from './sector-icons'

/** Expositor de metacrilato con el QR del salón, dibujado en HTML */
export function QrStand({ sector }: { sector: SectorData }) {
  return (
    <div className="flex flex-col items-center" role="img" aria-label={`Expositor con el QR de ${sector.demoBusiness.name}`}>
      <div className="w-44 rounded-[22px] bg-white/70 p-2 shadow-[0_24px_40px_-20px_rgba(74,13,46,0.45)] ring-1 ring-white backdrop-blur">
        <div className="rounded-2xl bg-white px-4 pb-4 pt-3 text-center ring-1 ring-black/5">
          <LotusMark className="mx-auto h-6 w-7 text-[var(--s-primary)]" />
          <p className="font-display text-sm font-bold text-[var(--s-ink)]">{sector.demoBusiness.name}</p>
          <p className="text-[10px] text-[var(--s-ink)]/60">{sector.demoBusiness.tagline}</p>
          <QRCodeSVG
            value={`https://qronnect.es/para/${sector.slug}`}
            size={104}
            level="M"
            fgColor="#16121A"
            className="mx-auto mt-3"
          />
          <p className="mt-3 text-[10px] font-medium leading-snug text-[var(--s-ink)]/80">{sector.qrStand.caption}</p>
        </div>
      </div>
      <div className="h-3 w-52 rounded-b-xl bg-white/80 shadow-md" />
    </div>
  )
}
