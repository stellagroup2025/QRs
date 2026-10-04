import { cn } from '@/lib/utils'

/** Cinta de nombres que se desplaza sola (se para al pasar el ratón) */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const fila = (copia: number) =>
    items.map((t, i) => (
      <span key={`${copia}-${i}`} className={cn('whitespace-nowrap', i % 3 === 2 && 'text-[var(--s-primary)]')}>
        {t}
      </span>
    ))

  return (
    <div className={cn('marquee-mask overflow-hidden py-6', className)} aria-hidden="true">
      <div className="marquee-track flex w-max gap-12 font-display text-2xl font-semibold tracking-tight opacity-60 sm:text-3xl">
        {fila(0)}
        {fila(1)}
      </div>
    </div>
  )
}
