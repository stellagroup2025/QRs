'use client'

import { Skeleton } from './skeleton'
import { Card, CardContent, CardHeader } from './card'

// Skeleton para las tarjetas de estadísticas del dashboard
export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-2 sm:p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-6 sm:pb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent className="p-2 pt-0 sm:p-6 sm:pt-0">
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-3 w-20 hidden sm:block" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Skeleton para tablas
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-md border">
      <div className="border-b p-4">
        <div className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex gap-4 items-center">
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={`h-4 ${colIndex === 0 ? 'w-32' : 'flex-1'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton para grid de cards compactas (promociones, campañas)
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[...Array(count)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg mb-2">
              <div className="text-center flex-1">
                <Skeleton className="h-6 w-8 mx-auto mb-1" />
                <Skeleton className="h-2 w-12 mx-auto" />
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center flex-1">
                <Skeleton className="h-6 w-8 mx-auto mb-1" />
                <Skeleton className="h-2 w-12 mx-auto" />
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center flex-1">
                <Skeleton className="h-6 w-8 mx-auto mb-1" />
                <Skeleton className="h-2 w-12 mx-auto" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <Skeleton className="h-3 w-20" />
              <div className="flex gap-1">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Skeleton para lista de clientes con avatar
export function ClientListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  )
}

// Skeleton para el dashboard completo
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Stats Cards */}
      <StatsCardsSkeleton />

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b pb-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>

        {/* Content */}
        <CardGridSkeleton count={4} />
      </div>
    </div>
  )
}

// Skeleton para página de tiendas SuperAdmin
export function TiendasListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full max-w-sm rounded-md" />

      {/* Cards */}
      <div className="grid gap-4 lg:hidden">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="text-center p-2 bg-muted rounded">
                    <Skeleton className="h-5 w-8 mx-auto mb-1" />
                    <Skeleton className="h-2 w-12 mx-auto" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table for desktop */}
      <div className="hidden lg:block">
        <TableSkeleton rows={5} columns={6} />
      </div>
    </div>
  )
}
