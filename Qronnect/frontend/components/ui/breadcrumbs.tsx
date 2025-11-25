'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  homeHref?: string
  showHome?: boolean
}

export function Breadcrumbs({
  items,
  className,
  homeHref = '/',
  showHome = true,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Navegación de migas de pan"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center gap-1.5">
        {showHome && (
          <li className="flex items-center gap-1.5">
            <Link
              href={homeHref}
              className="flex items-center hover:text-foreground transition-colors"
              aria-label="Ir al inicio"
            >
              <Home className="h-4 w-4" />
            </Link>
            {items.length > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
            )}
          </li>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'truncate max-w-[150px] sm:max-w-none',
                    isLast && 'text-foreground font-medium'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
