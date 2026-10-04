'use client'

import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isSoundOn, onSoundChange, setSoundOn } from '@/lib/sfx'
import { cn } from '@/lib/utils'

/** Altavoz para activar los sonidos de la página (apagados por defecto) */
export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    setOn(isSoundOn())
    return onSoundChange(setOn)
  }, [])

  return (
    <button
      type="button"
      onClick={() => setSoundOn(!on)}
      aria-pressed={on}
      aria-label={on ? 'Silenciar sonidos' : 'Activar sonidos'}
      title={on ? 'Sonido activado' : 'Sonido desactivado'}
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors',
        className,
      )}
    >
      {on ? <Volume2 className="h-[18px] w-[18px]" aria-hidden="true" /> : <VolumeX className="h-[18px] w-[18px]" aria-hidden="true" />}
    </button>
  )
}
