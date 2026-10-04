/**
 * Sonidos de las landings, sintetizados con Web Audio (sin archivos).
 * Están apagados por defecto: solo suenan si el visitante los activa con el botón del altavoz.
 */

export type Sfx = 'tap' | 'scan' | 'coin' | 'stamp' | 'unlock' | 'spin' | 'tick' | 'win' | 'notify' | 'next' | 'back' | 'open' | 'close' | 'send'

const STORAGE_KEY = 'qronnect-sound'
const EVENT = 'qronnect-sound-change'

let ctx: AudioContext | null = null
let master: GainNode | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
    master = ctx.createGain()
    master.gain.value = 0.8
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone(f: number, t0: number, dur: number, type: OscillatorType = 'sine', vol = 0.1, f2?: number) {
  const c = audio()
  if (!c || !master) return
  const t = c.currentTime + t0
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(master)
  o.start(t)
  o.stop(t + dur + 0.03)
}

function noise(t0: number, dur: number, vol: number, freq: number) {
  const c = audio()
  if (!c || !master) return
  const len = Math.max(1, Math.floor(c.sampleRate * dur))
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = freq
  const g = c.createGain()
  g.gain.value = vol
  src.connect(filter)
  filter.connect(g)
  g.connect(master)
  src.start(c.currentTime + t0)
}

const SOUNDS: Record<Sfx, () => void> = {
  tap: () => tone(620, 0, 0.055, 'sine', 0.1, 900),
  scan: () => {
    tone(1568, 0, 0.09, 'square', 0.035)
    tone(2093, 0.1, 0.12, 'square', 0.035)
  },
  coin: () => {
    tone(988, 0, 0.08, 'sine', 0.1)
    tone(1319, 0.07, 0.22, 'sine', 0.1)
  },
  stamp: () => {
    noise(0, 0.08, 0.3, 700)
    tone(180, 0, 0.12, 'sine', 0.16, 70)
  },
  unlock: () => {
    noise(0, 0.16, 0.2, 1200)
    ;[523, 659, 784, 1046].forEach((f, i) => tone(f, 0.08 + i * 0.09, 0.32, 'triangle', 0.11))
    for (let i = 0; i < 6; i++) tone(1100 + Math.random() * 900, 0.2 + i * 0.05, 0.1, 'sine', 0.03)
  },
  spin: () => noise(0, 0.25, 0.08, 2400),
  tick: () => tone(1800, 0, 0.025, 'square', 0.025),
  win: () => {
    ;[784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.25, 'triangle', 0.1))
  },
  notify: () => {
    tone(880, 0, 0.1, 'sine', 0.09)
    tone(1175, 0.09, 0.18, 'sine', 0.08)
  },
  next: () => {
    tone(523, 0, 0.08, 'sine', 0.1)
    tone(784, 0.07, 0.13, 'sine', 0.1)
  },
  back: () => {
    tone(784, 0, 0.07, 'sine', 0.09)
    tone(523, 0.06, 0.11, 'sine', 0.09)
  },
  open: () => {
    tone(659, 0, 0.4, 'sine', 0.06)
    tone(988, 0.09, 0.45, 'sine', 0.05)
  },
  close: () => {
    tone(880, 0, 0.3, 'sine', 0.045)
    tone(659, 0.08, 0.35, 'sine', 0.04)
  },
  send: () => {
    tone(880, 0, 0.08, 'sine', 0.1)
    tone(1320, 0.07, 0.2, 'sine', 0.1)
  },
}

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // sin almacenamiento: el cambio vale solo para esta visita
  }
  soundOverride = on
  if (on) {
    audio()
    SOUNDS.tap()
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: on }))
}

let soundOverride: boolean | null = null

export function play(name: Sfx) {
  const on = soundOverride ?? isSoundOn()
  if (!on) return
  try {
    SOUNDS[name]()
  } catch {
    // el audio nunca debe romper la página
  }
}

/** Avisa cuando se enciende o se apaga el sonido desde cualquier botón */
export function onSoundChange(cb: (on: boolean) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<boolean>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
