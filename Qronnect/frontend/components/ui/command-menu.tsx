'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Users,
  ShoppingCart,
  Gift,
  Mail,
  BarChart3,
  Settings,
  QrCode,
  Sparkles,
  FileText,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

interface CommandItem {
  icon: React.ElementType
  label: string
  shortcut?: string
  action: () => void
  keywords?: string[]
}

/**
 * Menú de comandos global (Cmd+K / Ctrl+K)
 * Para navegación rápida en el panel de admin
 */
export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  // Toggle con Cmd/Ctrl + K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const navigationItems: CommandItem[] = [
    {
      icon: QrCode,
      label: 'QR de Registro',
      action: () => {
        router.push('/admin/dashboard?tab=qr')
        setOpen(false)
      },
      keywords: ['qr', 'codigo', 'registro', 'clientes'],
    },
    {
      icon: Users,
      label: 'Ver Clientes',
      action: () => {
        router.push('/admin/dashboard?tab=clientes')
        setOpen(false)
      },
      keywords: ['clientes', 'usuarios', 'customers'],
    },
    {
      icon: ShoppingCart,
      label: 'Registro de Ventas',
      action: () => {
        router.push('/admin/dashboard?tab=ventas')
        setOpen(false)
      },
      keywords: ['ventas', 'compras', 'transacciones'],
    },
    {
      icon: Gift,
      label: 'Gestionar Promociones',
      action: () => {
        router.push('/admin/dashboard?tab=promociones')
        setOpen(false)
      },
      keywords: ['promociones', 'ofertas', 'descuentos', 'cupones'],
    },
    {
      icon: Mail,
      label: 'Campañas de Email',
      action: () => {
        router.push('/admin/dashboard?tab=campanas')
        setOpen(false)
      },
      keywords: ['campañas', 'email', 'marketing', 'newsletter'],
    },
    {
      icon: BarChart3,
      label: 'Ver Analytics',
      action: () => {
        router.push('/admin/dashboard?tab=analytics')
        setOpen(false)
      },
      keywords: ['analytics', 'estadísticas', 'métricas', 'reportes'],
    },
    {
      icon: Sparkles,
      label: 'Herramientas IA',
      action: () => {
        router.push('/admin/dashboard?tab=ia')
        setOpen(false)
      },
      keywords: ['ia', 'inteligencia', 'artificial', 'asistente'],
    },
    {
      icon: Settings,
      label: 'Configuración',
      action: () => {
        router.push('/admin/configuracion')
        setOpen(false)
      },
      keywords: ['configuracion', 'ajustes', 'settings'],
    },
  ]

  const actionItems: CommandItem[] = [
    {
      icon: ShoppingCart,
      label: 'Registrar Nueva Venta',
      shortcut: '⌘N',
      action: () => {
        // Trigger modal de registro de venta
        const event = new CustomEvent('open-sale-modal')
        window.dispatchEvent(event)
        setOpen(false)
      },
      keywords: ['nueva', 'venta', 'compra', 'registrar'],
    },
    {
      icon: Gift,
      label: 'Crear Promoción',
      action: () => {
        const event = new CustomEvent('open-promo-modal')
        window.dispatchEvent(event)
        setOpen(false)
      },
      keywords: ['nueva', 'promocion', 'crear', 'oferta'],
    },
    {
      icon: Mail,
      label: 'Nueva Campaña',
      action: () => {
        const event = new CustomEvent('open-campaign-modal')
        window.dispatchEvent(event)
        setOpen(false)
      },
      keywords: ['nueva', 'campaña', 'email', 'crear'],
    },
  ]

  const helpItems: CommandItem[] = [
    {
      icon: FileText,
      label: 'Documentación',
      action: () => {
        window.open('https://docs.qronnect.com', '_blank')
        setOpen(false)
      },
      keywords: ['ayuda', 'docs', 'documentacion', 'manual'],
    },
    {
      icon: Search,
      label: 'Buscar en Ayuda',
      action: () => {
        window.open('https://docs.qronnect.com/search', '_blank')
        setOpen(false)
      },
      keywords: ['ayuda', 'soporte', 'help', 'support'],
    },
  ]

  return (
    <>
      {/* Botón visual para abrir (opcional) */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border rounded-md bg-background/50 hover:bg-accent"
        aria-label="Abrir barra de búsqueda"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Escribe un comando o búsqueda..."
          aria-label="Buscar comandos"
        />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>

          <CommandGroup heading="Navegación">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={item.action}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
                {item.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Acciones Rápidas">
            {actionItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={item.action}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
                {item.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Ayuda">
            {helpItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={item.action}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

/**
 * Hook para abrir el command menu programáticamente
 */
export function useCommandMenu() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return { open, setOpen }
}
