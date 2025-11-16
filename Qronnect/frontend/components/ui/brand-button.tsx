'use client'

import { Button, ButtonProps } from './button'
import { forwardRef } from 'react'

export interface BrandButtonProps extends ButtonProps {
  brandVariant?: 'primary' | 'secondary' | 'accent'
}

/**
 * Botón con colores de marca dinámicos
 * Usa las variables CSS inyectadas por BrandingProvider
 */
export const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ brandVariant = 'primary', className, style, ...props }, ref) => {
    const brandStyles = {
      primary: {
        backgroundColor: 'rgb(var(--brand-primary))',
        color: 'white',
        '--tw-shadow-color': 'rgb(var(--brand-primary) / 0.5)',
      },
      secondary: {
        backgroundColor: 'rgb(var(--brand-secondary))',
        color: 'white',
      },
      accent: {
        backgroundColor: 'rgb(var(--brand-accent))',
        color: 'white',
      },
    } as const

    return (
      <Button
        ref={ref}
        className={className}
        style={{
          ...brandStyles[brandVariant],
          ...style,
        }}
        {...props}
      />
    )
  }
)

BrandButton.displayName = 'BrandButton'
