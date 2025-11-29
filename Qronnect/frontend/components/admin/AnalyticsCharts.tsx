'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

interface DataPoint {
  fecha: string
  valor: number
}

interface TopCliente {
  id: string
  nombre: string
  email: string
  total_gastado: number
  num_compras: number
  puntos_totales: number
}

interface RangoPuntos {
  rango: string
  clientes: number
  color?: string
}

interface AnalyticsData {
  evolucion_clientes: DataPoint[]
  evolucion_facturacion: DataPoint[]
  distribucion_puntos: RangoPuntos[]
  top_clientes: TopCliente[]
  tasa_retencion: number
  frecuencia_visita_promedio: number
  cambio_clientes_pct: number
  cambio_facturacion_pct: number
  cambio_ticket_medio_pct: number
}

interface AnalyticsChartsProps {
  data: AnalyticsData | null
  loading?: boolean
}

export function AnalyticsCharts({ data, loading }: AnalyticsChartsProps) {
  const { branding } = useBrandingContext()

  // Formatear datos para recharts
  const evolucionClientesData = useMemo(() => {
    if (!data?.evolucion_clientes) return []
    return data.evolucion_clientes.map(d => ({
      fecha: new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      clientes: d.valor,
    }))
  }, [data?.evolucion_clientes])

  const evolucionFacturacionData = useMemo(() => {
    if (!data?.evolucion_facturacion) return []
    return data.evolucion_facturacion.map(d => ({
      fecha: new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      facturacion: d.valor,
    }))
  }, [data?.evolucion_facturacion])

  const distribucionPuntosData = useMemo(() => {
    if (!data?.distribucion_puntos) return []
    return data.distribucion_puntos.map(d => ({
      name: d.rango,
      value: d.clientes,
      color: d.color || '#94a3b8',
    }))
  }, [data?.distribucion_puntos])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  // Componente auxiliar para header con tooltip informativo
  const ChartHeader = ({ title, description, helpText }: { title: string; description: string; helpText: string }) => (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <button className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-sm">{helpText}</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
    </CardHeader>
  )

  return (
    <div className="space-y-6">
      {/* Primera fila: Gráficos de línea y barras */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Evolución de Facturación */}
        <Card>
          <ChartHeader
            title="Evolución de Facturación"
            description="Ingresos diarios del periodo seleccionado"
            helpText="Este gráfico muestra la tendencia de ingresos a lo largo del tiempo. Te ayuda a identificar días de mayor venta, patrones estacionales y el crecimiento general de tu negocio. Úsalo para planificar inventario y personal en días de alta demanda."
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucionFacturacionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number) => [`€${value.toFixed(2)}`, 'Facturación']}
                />
                <Line
                  type="monotone"
                  dataKey="facturacion"
                  stroke={hexToRgb(branding.color_primario)}
                  strokeWidth={2}
                  dot={{ fill: hexToRgb(branding.color_primario), r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Nuevos Clientes */}
        <Card>
          <ChartHeader
            title="Nuevos Clientes"
            description="Clientes registrados por día"
            helpText="Visualiza cuántos clientes nuevos se registran cada día. Un crecimiento constante indica que tus estrategias de captación están funcionando. Usa esta info para medir el impacto de tus campañas de marketing y promociones de registro."
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={evolucionClientesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number) => [value, 'Clientes']}
                />
                <Bar
                  dataKey="clientes"
                  fill={hexToRgb(branding.color_acento)}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila: Distribución de puntos y Top clientes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribución de Clientes por Puntos */}
        <Card>
          <ChartHeader
            title="Distribución por Puntos"
            description="Clientes agrupados por rango de puntos acumulados"
            helpText="Esta gráfica te muestra cómo se distribuyen tus clientes según los puntos que han acumulado. Te ayuda a identificar cuántos clientes están cerca de canjear recompensas, y cuántos son clientes VIP con muchos puntos. Úsalo para crear promociones específicas para cada segmento."
          />
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={distribucionPuntosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribucionPuntosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => [value, 'Clientes']}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Leyenda personalizada */}
              <div className="grid grid-cols-2 gap-2">
                {distribucionPuntosData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Clientes VIP */}
        <Card className="overflow-hidden">
          <ChartHeader
            title="Top 10 Clientes VIP"
            description="Clientes con mayor facturación total"
            helpText="Identifica a tus clientes más valiosos por el dinero que han gastado en tu negocio. Estos clientes son clave para tu negocio - considera ofrecerles atención especial, promociones exclusivas o un programa VIP. Mantén la relación con ellos para asegurar su fidelidad."
          />
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto max-h-[300px]">
              <Table className="min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] sm:w-[50px] px-2 sm:px-4">#</TableHead>
                    <TableHead className="px-2 sm:px-4">Cliente</TableHead>
                    <TableHead className="text-right px-2 sm:px-4 whitespace-nowrap">Gastado</TableHead>
                    <TableHead className="text-right px-2 sm:px-4 hidden sm:table-cell">Compras</TableHead>
                    <TableHead className="text-right px-2 sm:px-4">Puntos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.top_clientes && data.top_clientes.length > 0 ? (
                    data.top_clientes.map((cliente, index) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium px-2 sm:px-4">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && index + 1}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <div className="max-w-[120px] sm:max-w-none">
                            <p className="font-medium text-sm truncate">{cliente.nombre}</p>
                            <p className="text-xs text-muted-foreground truncate hidden sm:block">{cliente.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium px-2 sm:px-4 whitespace-nowrap">
                          €{cliente.total_gastado.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-right px-2 sm:px-4 hidden sm:table-cell">
                          {cliente.num_compras}
                        </TableCell>
                        <TableCell className="text-right px-2 sm:px-4">
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: hexToRgb(branding.color_acento) + '20', color: hexToRgb(branding.color_acento) }}
                          >
                            {cliente.puntos_totales}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No hay clientes con compras aún
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
