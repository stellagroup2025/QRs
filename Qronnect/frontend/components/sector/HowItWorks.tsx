'use client'

import { QRCodeSVG } from 'qrcode.react'
import { ArrowRight, Check, Gift, Mail, ScanLine, Upload } from 'lucide-react'
import type { HowVisual, SectorShowcase } from '@/lib/sectores'
import { LotusMark } from './sector-icons'

/** Pequeñas ilustraciones en HTML de cada paso; no son capturas reales de la app */
function Visual({ kind, sector }: { kind: HowVisual; sector: SectorShowcase }) {
  const reward = sector.phone.reward.title

  switch (kind) {
    case 'setup':
      return (
        <div className="w-full max-w-[230px] space-y-2 rounded-xl bg-white p-3 text-[11px] shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-black/15 p-2">
            <Upload className="h-3.5 w-3.5 text-black/40" />
            <span className="text-black/60">Tu logo</span>
            <LotusMark className="ml-auto h-4 w-5 text-[var(--s-primary)]" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-black/[0.03] px-2 py-1.5">
            <span className="text-black/60">Color</span>
            <span className="h-4 w-8 rounded bg-[var(--s-primary)]" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-black/[0.03] px-2 py-1.5">
            <span className="text-black/60">1 € =</span>
            <span className="font-semibold text-black/80">1 punto</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-black/[0.03] px-2 py-1.5">
            <span className="text-black/60">Bienvenida</span>
            <span className="font-semibold text-black/80">+50 puntos</span>
          </div>
        </div>
      )
    case 'qr':
      return (
        <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-black/5">
          <LotusMark className="mx-auto h-4 w-5 text-[var(--s-primary)]" />
          <p className="font-display text-[11px] font-bold text-[var(--s-ink)]">{sector.demoBusiness.name}</p>
          <QRCodeSVG value={sector.slug ? `https://qronnect.es/para/${sector.slug}` : 'https://qronnect.es'} size={86} level="M" className="mx-auto mt-2" />
          <p className="mt-2 text-[9px] text-black/55">Escanea y únete al club</p>
        </div>
      )
    case 'signup':
      return (
        <div className="w-full max-w-[200px] rounded-2xl bg-white p-3 text-[11px] shadow-sm ring-1 ring-black/5">
          <p className="font-display text-sm font-bold text-[var(--s-ink)]">Únete al club</p>
          <div className="mt-2 space-y-1.5">
            <div className="rounded-md border border-black/10 px-2 py-1.5 text-black/45">Tu nombre</div>
            <div className="rounded-md border border-black/10 px-2 py-1.5 text-black/45">tu@email.com</div>
          </div>
          <div className="mt-2 rounded-md bg-[var(--s-primary)] py-1.5 text-center font-semibold text-[var(--s-primary-on)]">
            Unirme gratis
          </div>
        </div>
      )
    case 'scan':
      return (
        <div className="w-full max-w-[220px] rounded-2xl bg-[#16121A] p-3 text-white shadow-sm">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-lg border-2 border-white/30">
            <ScanLine className="h-10 w-10 text-white/70" />
            <span className="scan-line absolute inset-x-1 top-1/2 h-0.5 bg-[var(--s-primary)] shadow-[0_0_10px_1px_var(--s-primary)]" />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/15 px-2 py-1.5 text-[11px] text-emerald-300">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            +1 sello · +25 puntos
          </div>
        </div>
      )
    case 'reward':
      return (
        <div className="relative w-full max-w-[220px] overflow-hidden rounded-2xl bg-[var(--s-primary)] p-3 text-[var(--s-primary-on)] shadow-sm">
          <Gift className="h-5 w-5" />
          <p className="mt-2 font-display text-sm font-bold leading-tight">{reward}</p>
          <div className="mt-3 rounded-md border border-dashed border-current/50 bg-white/15 px-2 py-1 text-center font-mono text-[11px] tracking-widest">
            CUPÓN · QX7M-4HPA
          </div>
          <span className="absolute -left-2 top-1/2 h-4 w-4 rounded-full bg-[var(--s-softer)]" />
          <span className="absolute -right-2 top-1/2 h-4 w-4 rounded-full bg-[var(--s-softer)]" />
        </div>
      )
    case 'results': {
      const bars = [40, 52, 46, 64, 70, 82]
      return (
        <div className="w-full max-w-[230px] rounded-2xl bg-white p-3 text-[11px] shadow-sm ring-1 ring-black/5">
          <div className="flex justify-between">
            <span className="text-black/55">Clientes que vuelven</span>
            <span className="font-semibold text-emerald-600">↑</span>
          </div>
          <div className="mt-2 flex h-14 items-end gap-1.5">
            {bars.map((h, i) => (
              <span key={i} className="grow-bar flex-1 rounded-t bg-[var(--s-primary)]" style={{ height: `${h}%`, opacity: 0.45 + i * 0.1 }} />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 rounded-md bg-black/[0.04] px-2 py-1.5 text-black/65">
            <Mail className="h-3.5 w-3.5" />
            Promoción enviada
          </div>
        </div>
      )
    }
  }
}

/**
 * "Cómo funciona": seis pasos con quién hace cada uno (tú, tu equipo, tu cliente)
 * y una ilustración, para que un negocio entienda el sistema completo de un vistazo
 */
export function HowItWorks({ sector }: { sector: SectorShowcase }) {
  const { howItWorks } = sector

  return (
    <section id="como-funciona" aria-labelledby="como-funciona-title" className="scroll-mt-20 bg-[var(--s-softer)] px-5 py-24 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl" data-reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">Cómo funciona</p>
          <h2 id="como-funciona-title" className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            {howItWorks.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--s-ink)]/70">{howItWorks.intro}</p>
        </div>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {howItWorks.steps.map((step, i) => (
            <li
              key={step.title}
              data-reveal
              className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--s-ink)]/10 bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-34px_rgba(0,0,0,0.35)]"
            >
              <div className="flex h-48 items-center justify-center bg-[var(--s-soft)]/60 p-5 transition-colors duration-300 group-hover:bg-[var(--s-soft)]" aria-hidden="true">
                <div className="transition-transform duration-500 group-hover:scale-105">
                  <Visual kind={step.visual} sector={sector} />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-[var(--s-primary)]">Paso {i + 1}</span>
                  <span className="rounded-full bg-[var(--s-ink)]/[0.06] px-2.5 py-1 text-xs font-semibold">{step.who}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-[var(--s-ink)]/70">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p data-reveal className="mt-10 flex flex-wrap items-center gap-2 text-[var(--s-ink)]/70">
          <span className="font-semibold text-[var(--s-ink)]">En resumen:</span>
          {['Configuras', 'Pones tu QR', 'Se unen', 'Suman en cada visita', 'Canjean su premio', 'Vuelven'].map((t, i) => (
            <span key={t} className="inline-flex items-center gap-2">
              {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-[var(--s-primary)]" aria-hidden="true" />}
              {t}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
