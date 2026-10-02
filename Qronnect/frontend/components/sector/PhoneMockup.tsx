import { ArrowRight, ChevronRight, Home, QrCode, Star, Ticket, User } from 'lucide-react'
import type { SectorData } from '@/lib/sectores'
import { cn } from '@/lib/utils'
import { LotusMark, SECTOR_ICONS } from './sector-icons'
import { SectorPhoto } from './SectorPhoto'

/** Móvil con la app que ve la clienta, construido en HTML (no es una captura) */
export function PhoneMockup({ sector, className }: { sector: SectorData; className?: string }) {
  const { phone, demoBusiness } = sector

  return (
    <div
      className={cn(
        'relative w-[290px] rounded-[48px] bg-[#16121A] p-[11px] shadow-[0_40px_80px_-30px_rgba(74,13,46,0.55)]',
        className,
      )}
      aria-label={`Vista de la app de ${demoBusiness.name} en el móvil de una clienta`}
      role="img"
    >
      <div className="relative overflow-hidden rounded-[38px] bg-white">
        {/* Barra de estado */}
        <div className="flex h-10 items-center justify-between px-7 text-[11px] font-semibold text-[#16121A]">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-[#16121A]" />
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-[#16121A]" />
            <span className="h-2 w-4 rounded-sm border border-[#16121A]" />
          </span>
        </div>

        <div className="px-4 pb-3" aria-hidden="true">
          <div className="flex items-center gap-2 py-2">
            <LotusMark className="h-7 w-8 text-[var(--s-primary)]" />
            <div className="leading-tight">
              <p className="font-display text-[15px] font-bold text-[var(--s-ink)]">{demoBusiness.name}</p>
              <p className="text-[11px] text-[var(--s-ink)]/60">{demoBusiness.tagline}</p>
            </div>
          </div>

          <div className="mt-2 rounded-2xl bg-[var(--s-softer)] p-3.5 ring-1 ring-[var(--s-soft)]">
            <p className="text-[11px] font-medium text-[var(--s-ink)]/70">Tus puntos</p>
            <div className="flex items-end justify-between">
              <p className="font-display text-3xl font-bold text-[var(--s-ink)]">{phone.points}</p>
              <SECTOR_ICONS.gift className="mb-1 h-7 w-7 text-[var(--s-primary)]" />
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[var(--s-soft)]">
              <div className="h-full rounded-full bg-[var(--s-primary)]" style={{ width: `${phone.progress * 100}%` }} />
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--s-ink)]/60">{phone.progressLabel}</p>
          </div>

          <ul className="mt-2.5 space-y-1.5">
            {phone.items.map((item) => {
              const Icon = SECTOR_ICONS[item.icon]
              return (
                <li key={item.label} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--s-softer)] text-[var(--s-primary)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-[12px] font-medium text-[var(--s-ink)]">{item.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--s-ink)]/30" />
                </li>
              )
            })}
          </ul>

          <div className="mt-2.5 flex overflow-hidden rounded-2xl bg-[var(--s-softer)] ring-1 ring-[var(--s-soft)]">
            <SectorPhoto src={phone.reward.photo} className="h-24 w-24 shrink-0" />
            <div className="flex flex-1 flex-col justify-between p-3">
              <p className="font-display text-[14px] font-bold leading-tight text-[var(--s-ink)]">{phone.reward.title}</p>
              <span className="flex h-6 w-6 items-center justify-center self-end rounded-full bg-[var(--s-primary)] text-white">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Barra inferior con el QR en el centro */}
        <div className="flex items-end justify-around border-t border-black/5 px-3 pb-4 pt-2 text-[9px] text-[var(--s-ink)]/50" aria-hidden="true">
          <span className="flex flex-col items-center gap-0.5 text-[var(--s-primary)]"><Home className="h-4 w-4" />Inicio</span>
          <span className="flex flex-col items-center gap-0.5"><Star className="h-4 w-4" />Puntos</span>
          <span className="-mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--s-primary)] text-white shadow-lg">
            <QrCode className="h-5 w-5" />
          </span>
          <span className="flex flex-col items-center gap-0.5"><Ticket className="h-4 w-4" />Cupones</span>
          <span className="flex flex-col items-center gap-0.5"><User className="h-4 w-4" />Perfil</span>
        </div>
      </div>
    </div>
  )
}
