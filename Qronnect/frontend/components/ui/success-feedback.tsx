'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuccessFeedbackProps {
  show: boolean
  onComplete?: () => void
  message?: string
  variant?: 'check' | 'celebration'
  duration?: number
  className?: string
}

/**
 * Componente de feedback de éxito con animación
 * Muestra un check animado o celebración cuando una acción se completa
 */
export function SuccessFeedback({
  show,
  onComplete,
  message = '¡Completado!',
  variant = 'check',
  duration = 2000,
  className,
}: SuccessFeedbackProps) {
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      setAnimating(true)

      const timer = setTimeout(() => {
        setAnimating(false)
        setTimeout(() => {
          setVisible(false)
          onComplete?.()
        }, 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onComplete])

  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity duration-300',
        animating ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div
        className={cn(
          'bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 transition-all duration-300',
          animating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        {variant === 'check' ? (
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-[bounce_0.5s_ease-in-out]">
              <CheckCircle2 className="h-12 w-12 text-green-600 animate-[scale-in_0.3s_ease-out]" />
            </div>
            {/* Círculos de partículas */}
            <div className="absolute inset-0 animate-ping">
              <div className="w-20 h-20 rounded-full border-4 border-green-300 opacity-50" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center animate-[bounce_0.5s_ease-in-out]">
              <PartyPopper className="h-12 w-12 text-yellow-600 animate-[wiggle_0.5s_ease-in-out]" />
            </div>
            {/* Confetti effect with CSS */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-[confetti_1s_ease-out_forwards]"
                  style={{
                    backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'][i],
                    animationDelay: `${i * 0.1}s`,
                    left: `${(i - 3) * 15}px`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <p className="text-lg font-semibold text-gray-800 animate-[fade-in_0.3s_ease-out_0.2s_backwards]">
          {message}
        </p>
      </div>
    </div>
  )
}

// Hook para usar el feedback de éxito fácilmente
export function useSuccessFeedback() {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackVariant, setFeedbackVariant] = useState<'check' | 'celebration'>('check')

  const trigger = (message: string = '¡Completado!', variant: 'check' | 'celebration' = 'check') => {
    setFeedbackMessage(message)
    setFeedbackVariant(variant)
    setShowFeedback(true)
  }

  const reset = () => {
    setShowFeedback(false)
  }

  const FeedbackComponent = () => (
    <SuccessFeedback
      show={showFeedback}
      message={feedbackMessage}
      variant={feedbackVariant}
      onComplete={reset}
    />
  )

  return { trigger, FeedbackComponent }
}
