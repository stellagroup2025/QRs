'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, BarChart3, Gift, Mail } from 'lucide-react'
import { AnalistaKPIs } from './AnalistaKPIs'
import { GeneradorPromos } from './GeneradorPromos'
import { GeneradorEmailsCampana } from './GeneradorEmailsCampana'

/**
 * Panel principal de funcionalidades de IA
 *
 * Agrupa las 3 funcionalidades de IA en un componente con tabs:
 * 1. Análisis de KPIs
 * 2. Generador de Promociones
 * 3. Generador de Campañas de Email
 *
 * Incluye navegación inteligente desde el análisis de KPIs hacia
 * los generadores con datos prellenados
 */
export function PanelIA({ tenantDomain, adminToken }: { tenantDomain: string; adminToken: string }) {
  const [activeTab, setActiveTab] = useState('kpis')
  const [datosCampanaPrellenados, setDatosCampanaPrellenados] = useState<any>(null)
  const [datosPromocionPrellenados, setDatosPromocionPrellenados] = useState<any>(null)

  function handleCreateCampaign(datosPrellenados: any) {
    console.log('[PANEL IA] Crear campaña con datos:', datosPrellenados)
    setDatosCampanaPrellenados(datosPrellenados)
    setActiveTab('emails')
  }

  function handleCreatePromotion(datosPrellenados: any) {
    console.log('[PANEL IA] Crear promoción con datos:', datosPrellenados)
    setDatosPromocionPrellenados(datosPrellenados)
    setActiveTab('promos')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Asistente IA</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Potenciado por Google Gemini</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Análisis KPIs</span>
            <span className="sm:hidden">KPIs</span>
          </TabsTrigger>
          <TabsTrigger value="promos" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Promociones</span>
            <span className="sm:hidden">Promos</span>
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Campañas Email</span>
            <span className="sm:hidden">Emails</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="mt-4">
          <AnalistaKPIs
            tenantDomain={tenantDomain}
            adminToken={adminToken}
            onCreateCampaign={handleCreateCampaign}
            onCreatePromotion={handleCreatePromotion}
          />
        </TabsContent>

        <TabsContent value="promos" className="mt-4">
          <GeneradorPromos
            tenantDomain={tenantDomain}
            adminToken={adminToken}
            datosPrellenados={datosPromocionPrellenados}
            onClearPrellenados={() => setDatosPromocionPrellenados(null)}
          />
        </TabsContent>

        <TabsContent value="emails" className="mt-4">
          <GeneradorEmailsCampana
            tenantDomain={tenantDomain}
            adminToken={adminToken}
            datosPrellenados={datosCampanaPrellenados}
            onClearPrellenados={() => setDatosCampanaPrellenados(null)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
