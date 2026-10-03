"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { MisTarjetasSellos } from '@/components/cliente/sellos/MisTarjetasSellos'
import { ClientPage, ClientSkeleton } from '@/components/cliente/ClientPage'

export default function MisSellosPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { toast } = useToast()
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAuth()
  }, [])

  const loadAuth = async () => {
    try {
      const savedToken = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token')
      if (!savedToken) {
        toast({
          title: "No autenticado",
          description: "Por favor inicia sesión",
          variant: "destructive",
        })
        router.push(`/${slug}/login`)
        return
      }

      setToken(savedToken)

      // Obtener datos del cliente para tener el ID
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const clienteResponse = await fetch(`${API_URL}/api/clientes/me`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
          'X-Tenant-Domain': slug,
        },
      })

      if (!clienteResponse.ok) {
        throw new Error('Error al obtener datos del cliente')
      }

      const clienteData = await clienteResponse.json()
      setClienteId(clienteData.id)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar tus datos",
        variant: "destructive",
      })
      router.push(`/${slug}/login`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ClientPage>
        <ClientSkeleton blocks={2} />
      </ClientPage>
    )
  }

  if (!clienteId || !token) {
    return null
  }

  return (
    <ClientPage title="Sellos" subtitle="Un sello en cada visita. Completa la tarjeta y llévate el premio.">
      <MisTarjetasSellos idCliente={clienteId} token={token} slug={slug} />
    </ClientPage>
  )
}
