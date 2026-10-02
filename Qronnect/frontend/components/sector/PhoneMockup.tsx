import type { CSSProperties } from 'react'
import { Gift, QrCode, Settings, User } from 'lucide-react'
import type { SectorData } from '@/lib/sectores'
import { cn } from '@/lib/utils'
import { LotusMark, SECTOR_ICONS } from './sector-icons'

/** Móvil con la tarjeta de sellos que ve el cliente, construido en HTML (no es una captura) */
export function PhoneMockup({ sector, className }: { sector: SectorData; className?: string }) {
  const { stampCard, demoBusiness, palette } = sector
  const StampIcon = SECTOR_ICONS[stampCard.icon]

  return (
    <div
      className={cn(
        'relative w-[270px] rounded-[46px] border-[3px] border-[#C9CDD3] bg-[#111] p-[9px] shadow-[0_40px_70px_-30px_rgba(0,0,0,0.45)]',
        className,
      )}
      style={{ '--s-ink': palette.ink } as CSSProperties}
      role="img"
      aria-label={`Tarjeta de sellos de ${demoBusiness.name} en el móvil de un cliente`}
    >
      <div className="relative flex h-[540px] flex-col overflow-hidden rounded-[37px] bg-[#F1F1F2]" aria-hidden="true">
        <div className="mx-auto mt-3 h-7 w-24 rounded-full bg-[#111]" />
        <div className="mt-4 flex justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-black/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--s-primary)]" />
        </div>

        <div className="mx-4 mt-4 flex flex-1 flex-col items-center rounded-2xl bg-white px-4 pb-5 pt-5 shadow-sm">
          <div className="flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full border-[3px] border-[var(--s-primary)] text-[var(--s-primary)]">
            <LotusMark className="h-6 w-7" />
            <span className="mt-0.5 max-w-[60px] text-center font-display text-[8px] font-bold uppercase leading-tight">
              {demoBusiness.name}
            </span>
          </div>
          <p className="mt-4 text-center font-display text-[17px] font-semibold leading-tight tracking-wide text-[var(--s-ink)]">
            {stampCard.line1}
            <br />
            {stampCard.line2}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-3">
            {Array.from({ length: stampCard.total }).map((_, i) => {
              const date = stampCard.filled[i]
              const isReward = i === stampCard.total - 1
              return (
                <div key={i} className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border',
                      date ? 'border-transparent bg-[var(--s-soft)] text-[var(--s-primary)]' : 'border-black/10 text-[var(--s-primary)]/70',
                    )}
                  >
                    {isReward ? <Gift className="h-5 w-5" /> : date ? <StampIcon className="h-6 w-6" /> : null}
                  </span>
                  <span className="mt-1 h-3 text-[9px] text-black/45">{date ?? ''}</span>
                </div>
              )
            })}
          </div>

          {/* En Qronnect el cliente enseña su QR y el equipo le pone el sello */}
          <span className="mt-auto flex items-center gap-2 rounded-full bg-[var(--s-primary)] px-6 py-2 font-display text-sm font-bold text-[var(--s-primary-on)]">
            <QrCode className="h-4 w-4" />
            Mostrar mi QR
          </span>
        </div>

        <div className="mt-3 flex justify-around border-t border-black/5 bg-white px-6 pb-5 pt-3 text-black/60">
          <User className="h-5 w-5" />
          <Gift className="h-5 w-5" />
          <Settings className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

/** Portátil con el panel del negocio (cifras, gráfico y lista de visitas), en HTML */
export function DashboardMockup({ sector, className }: { sector: SectorData; className?: string }) {
  const { dashboard } = sector
  const bars = [38, 34, 46, 50, 54, 58, 52, 64, 68, 72, 78, 86]
  const tiles = [
    { icon: Gift, value: dashboard.redemptions, label: 'Premios canjeados', color: sector.palette.accents[0] },
    { icon: User, value: dashboard.newMembers, label: 'Socios nuevos', color: sector.palette.primary },
    { icon: User, value: dashboard.members, label: 'Socios totales', color: sector.palette.accents[1] },
  ]

  return (
    <div className={cn('w-[620px]', className)} role="img" aria-label="Panel del negocio con estadísticas de fidelización">
      <div className="rounded-t-[18px] border-[10px] border-b-0 border-[#1D1D1F] bg-white" aria-hidden="true">
        <div className="space-y-3 p-4">
          <div className="flex gap-2">
            {['Tarjeta: Sellos', 'Últimos 12 meses'].map((t) => (
              <span key={t} className="rounded-md border border-black/10 px-2 py-1 text-[8px] text-black/50">{t}</span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {tiles.map((t) => (
              <div key={t.label} className="flex items-center gap-2 rounded-lg border border-black/5 p-2">
                <t.icon className="h-4 w-4" style={{ color: t.color }} />
                <span className="leading-none">
                  <span className="block text-[11px] font-bold text-black/80">{t.value}</span>
                  <span className="text-[7px] text-black/45">{t.label}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex h-24 items-end gap-2 rounded-lg border border-black/5 px-3 pb-2 pt-3">
            {bars.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t-sm"
                style={{ height: `${h}%`, background: `linear-gradient(180deg, ${sector.palette.accents[1]}, ${sector.palette.accents[1]}99)` }}
              />
            ))}
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3">
                {[0, 1, 2, 3].map((c) => (
                  <span key={c} className="h-1.5 rounded-full bg-black/[0.07]" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-[-24px] h-3 rounded-b-xl bg-gradient-to-b from-[#D4D6DA] to-[#A9ACB1]" aria-hidden="true" />
    </div>
  )
}
