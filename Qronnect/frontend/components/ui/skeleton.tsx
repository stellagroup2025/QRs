import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      role="status"
      aria-label="Cargando contenido"
      {...props}
    />
  )
}

/**
 * Skeleton predefinido para Cards de Cliente (mobile)
 */
function ClienteCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

/**
 * Skeleton para tabla de clientes (desktop)
 */
function ClienteTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border rounded-md">
      <div className="p-4 border-b bg-muted/50">
        <div className="grid grid-cols-6 gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-b-0">
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para Stats Cards
 */
function StatCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

/**
 * Skeleton para Dashboard completo
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Skeleton para Card genérico
 */
function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

export {
  Skeleton,
  ClienteCardSkeleton,
  ClienteTableSkeleton,
  StatCardSkeleton,
  DashboardSkeleton,
  CardSkeleton,
}
