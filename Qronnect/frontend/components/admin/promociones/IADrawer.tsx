'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Gift, Lightbulb } from 'lucide-react'
import { GeneradorPromos } from '../ia/GeneradorPromos'

interface IADrawerPromocionesProps {
  tenantDomain: string
  adminToken: string
  onPromocionCreada?: () => void
}

export function IADrawerPromociones({
  tenantDomain,
  adminToken,
  onPromocionCreada,
}: IADrawerPromocionesProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
        >
          <Sparkles className="h-5 w-5" />
          Crear Promoción con IA
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:w-[900px] lg:w-[1000px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Asistente IA para Promociones
          </SheetTitle>
          <SheetDescription>
            Genera ideas de promociones potenciadas con inteligencia artificial
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="generador" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="generador" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                Generador de Promociones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generador" className="mt-4">
              <GeneradorPromos
                tenantDomain={tenantDomain}
                adminToken={adminToken}
                onPromoCreada={() => {
                  onPromocionCreada?.()
                  setOpen(false)
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
