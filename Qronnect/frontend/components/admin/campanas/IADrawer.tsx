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
import { Sparkles, Mail, Zap } from 'lucide-react'
import { GeneradorEmailsCampana } from '../ia/GeneradorEmailsCampana'

interface IADrawerCampanasProps {
  tenantDomain: string
  adminToken: string
  onCampanaCreada?: () => void
}

export function IADrawerCampanas({
  tenantDomain,
  adminToken,
  onCampanaCreada,
}: IADrawerCampanasProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
        >
          <Sparkles className="h-5 w-5" />
          Crear Campaña con IA
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:w-[900px] lg:w-[1000px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Asistente IA para Campañas
          </SheetTitle>
          <SheetDescription>
            Crea campañas de email potenciadas con inteligencia artificial
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Generador de Emails
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <GeneradorEmailsCampana
                tenantDomain={tenantDomain}
                adminToken={adminToken}
                onCampanaCreada={() => {
                  onCampanaCreada?.()
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
