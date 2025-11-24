'use client'

import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorRetryProps {
  title?: string
  message?: string
  onRetry: () => void
  isRetrying?: boolean
  variant?: 'default' | 'inline' | 'minimal'
  isOffline?: boolean
}

export function ErrorRetry({
  title = 'Error al cargar',
  message = 'No se pudo completar la operación. Por favor, inténtalo de nuevo.',
  onRetry,
  isRetrying = false,
  variant = 'default',
  isOffline = false,
}: ErrorRetryProps) {
  const Icon = isOffline ? WifiOff : AlertCircle

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <Icon className="h-4 w-4" />
        <span>{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-auto p-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">{title}</p>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          {isRetrying ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <Card className="border-destructive/20">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-destructive/10">
            <Icon className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-destructive">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
          </div>
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Reintentando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
