import {
  BarChart3, CalendarCheck, Clock, Coffee, Dumbbell, Gem, Gift, Heart, History, Mail, Megaphone,
  Palette, QrCode, ScanLine, Share2, Smartphone, Sparkles, Stamp, Star, Tag, Users,
} from 'lucide-react'
import type { SectorIcon } from '@/lib/sectores'

export const SECTOR_ICONS: Record<SectorIcon, typeof Gift> = {
  gift: Gift,
  megaphone: Megaphone,
  users: Users,
  chart: BarChart3,
  gem: Gem,
  tag: Tag,
  share: Share2,
  calendar: CalendarCheck,
  mail: Mail,
  phone: Smartphone,
  stamp: Stamp,
  history: History,
  heart: Heart,
  star: Star,
  qr: QrCode,
  scan: ScanLine,
  coffee: Coffee,
  sparkles: Sparkles,
  clock: Clock,
  palette: Palette,
  dumbbell: Dumbbell,
}

/** Loto de la línea de belleza: cinco pétalos en el color principal del sector */
export function LotusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden="true">
      <g fill="currentColor">
        <path d="M24 4c4.5 5 6.5 11 6 17.5-1.6 3.4-3.6 6.2-6 8.5-2.4-2.3-4.4-5.1-6-8.5C17.5 15 19.5 9 24 4Z" />
        <path opacity=".85" d="M10 12.5c6 1 10.6 4.9 13.2 11.3.5 3.8.2 7.2-.8 10.2-5.5-1.3-9.4-4.3-11.3-9.4-1.2-3.6-1.6-7.6-1.1-12.1Z" />
        <path opacity=".85" d="M38 12.5c.5 4.5.1 8.5-1.1 12.1-1.9 5.1-5.8 8.1-11.3 9.4-1-3-1.3-6.4-.8-10.2C27.4 17.4 32 13.5 38 12.5Z" />
        <path opacity=".65" d="M1.5 22.5c6.2-1.3 12 .4 17.2 5.7 1.5 1.8 2.6 3.8 3.4 6-4.3 1.6-8.6 1.5-12.6-.5-3.6-2.2-6.3-5.9-8-11.2Z" />
        <path opacity=".65" d="M46.5 22.5c-1.7 5.3-4.4 9-8 11.2-4 2-8.3 2.1-12.6.5.8-2.2 1.9-4.2 3.4-6 5.2-5.3 11-7 17.2-5.7Z" />
      </g>
    </svg>
  )
}
