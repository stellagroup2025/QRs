'use client'

import { useState, useEffect } from 'react'
import { useBrandingContext } from '@/components/BrandingProvider'

export interface LandingConfig {
  // Imágenes
  hero_imagen_url?: string
  hero_bg_url?: string
  servicios_bg_url?: string
  beneficios_bg_url?: string
  testimonios_bg_url?: string
  cta_final_bg_url?: string

  // Hero Section
  hero_titulo_principal: string
  hero_titulo_destacado: string
  hero_subtitulo: string
  hero_cta_principal: string
  hero_cta_secundario: string
  hero_social_proof: string

  // Servicios
  servicios_titulo: string
  servicios_subtitulo: string
  servicio_1_titulo: string
  servicio_1_descripcion: string
  servicio_1_icono: string
  servicio_1_activo: boolean
  servicio_2_titulo: string
  servicio_2_descripcion: string
  servicio_2_icono: string
  servicio_2_activo: boolean
  servicio_3_titulo: string
  servicio_3_descripcion: string
  servicio_3_icono: string
  servicio_3_activo: boolean
  servicio_4_titulo: string
  servicio_4_descripcion: string
  servicio_4_icono: string
  servicio_4_activo: boolean
  servicio_5_titulo: string
  servicio_5_descripcion: string
  servicio_5_icono: string
  servicio_5_activo: boolean
  servicio_6_titulo: string
  servicio_6_descripcion: string
  servicio_6_icono: string
  servicio_6_activo: boolean

  // Beneficios
  beneficios_titulo: string
  beneficios_subtitulo: string
  beneficio_1: string
  beneficio_1_activo: boolean
  beneficio_2: string
  beneficio_2_activo: boolean
  beneficio_3: string
  beneficio_3_activo: boolean
  beneficio_4: string
  beneficio_4_activo: boolean
  beneficio_5: string
  beneficio_5_activo: boolean
  beneficio_6: string
  beneficio_6_activo: boolean

  // Estadísticas
  estadistica_principal_numero: string
  estadistica_principal_texto: string
  estadistica_1_numero: string
  estadistica_1_texto: string
  estadistica_2_numero: string
  estadistica_2_texto: string

  // Testimonios
  testimonios_titulo: string
  testimonio_1_nombre: string
  testimonio_1_cargo: string
  testimonio_1_contenido: string
  testimonio_1_rating: number
  testimonio_2_nombre: string
  testimonio_2_cargo: string
  testimonio_2_contenido: string
  testimonio_2_rating: number
  testimonio_3_nombre: string
  testimonio_3_cargo: string
  testimonio_3_contenido: string
  testimonio_3_rating: number

  // CTA Final
  cta_final_titulo_1: string
  cta_final_titulo_2: string
  cta_final_subtitulo: string
  cta_final_boton_principal: string
  cta_final_boton_secundario: string
}

// Textos por defecto pensados para los clientes de la tienda (cada tienda puede cambiarlos)
const defaultConfig: LandingConfig = {
  hero_titulo_principal: 'Cada visita',
  hero_titulo_destacado: 'tiene premio',
  hero_subtitulo:
    'Únete gratis a nuestro club: suma puntos y sellos con cada compra y canjéalos por descuentos y regalos.',
  hero_cta_principal: 'Unirme gratis',
  hero_cta_secundario: 'Ya soy socio',
  hero_social_proof: '',

  servicios_titulo: 'Lo que tienes en el club',
  servicios_subtitulo: 'Ventajas pensadas para quienes vuelven.',

  servicio_1_titulo: 'Puntos en cada compra',
  servicio_1_descripcion: 'Cada euro que gastas suma puntos que puedes canjear cuando quieras.',
  servicio_1_icono: 'Star',
  servicio_1_activo: true,
  servicio_2_titulo: 'Regalo de bienvenida',
  servicio_2_descripcion: 'Nada más registrarte tienes un detalle esperándote.',
  servicio_2_icono: 'Gift',
  servicio_2_activo: true,
  servicio_3_titulo: 'Tarjeta de sellos',
  servicio_3_descripcion: 'Completa tu tarjeta y llévate un premio. Sin papel, siempre en tu móvil.',
  servicio_3_icono: 'CreditCard',
  servicio_3_activo: true,
  servicio_4_titulo: 'Promociones exclusivas',
  servicio_4_descripcion: 'Ofertas solo para socios que no encontrarás en ningún otro sitio.',
  servicio_4_icono: 'ShoppingBag',
  servicio_4_activo: true,
  servicio_5_titulo: 'Invita y gana',
  servicio_5_descripcion: 'Comparte tu código con tus amigos y ganad puntos los dos.',
  servicio_5_icono: 'Users',
  servicio_5_activo: true,
  servicio_6_titulo: 'Sin descargar nada',
  servicio_6_descripcion: 'Tu tarjeta funciona desde el navegador: solo enseña tu QR en caja.',
  servicio_6_icono: 'QrCode',
  servicio_6_activo: true,

  beneficios_titulo: 'Ser socio merece la pena',
  beneficios_subtitulo: 'Es gratis, es rápido y tus datos están protegidos.',
  beneficio_1: 'Registro gratis en 30 segundos',
  beneficio_1_activo: true,
  beneficio_2: 'Sin apps ni tarjetas de plástico',
  beneficio_2_activo: true,
  beneficio_3: 'Consulta tus puntos cuando quieras',
  beneficio_3_activo: true,
  beneficio_4: 'Te avisamos de las mejores ofertas',
  beneficio_4_activo: true,
  beneficio_5: 'Date de baja cuando quieras',
  beneficio_5_activo: true,
  beneficio_6: '',
  beneficio_6_activo: false,

  estadistica_principal_numero: '',
  estadistica_principal_texto: '',
  estadistica_1_numero: '',
  estadistica_1_texto: '',
  estadistica_2_numero: '',
  estadistica_2_texto: '',

  testimonios_titulo: 'Lo que dicen nuestros socios',
  testimonio_1_nombre: '',
  testimonio_1_cargo: '',
  testimonio_1_contenido: '',
  testimonio_1_rating: 5,
  testimonio_2_nombre: '',
  testimonio_2_cargo: '',
  testimonio_2_contenido: '',
  testimonio_2_rating: 5,
  testimonio_3_nombre: '',
  testimonio_3_cargo: '',
  testimonio_3_contenido: '',
  testimonio_3_rating: 5,

  cta_final_titulo_1: '¿Te unes?',
  cta_final_titulo_2: 'Tu primer premio te espera.',
  cta_final_subtitulo: 'Regístrate gratis y empieza a sumar desde tu próxima visita.',
  cta_final_boton_principal: 'Unirme gratis',
  cta_final_boton_secundario: 'Ya soy socio',
}

export function useLandingConfig() {
  const { branding } = useBrandingContext()
  const [config, setConfig] = useState<LandingConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const domain = window.location.hostname.split('.')[0]
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://qronnect-backend.onrender.com'

        const response = await fetch(`${apiUrl}/api/config/landing`, {
          headers: {
            'X-Tenant-Domain': domain,
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Los campos que la tienda no ha rellenado (null/undefined) usan el texto por defecto
          const filled = Object.fromEntries(
            Object.entries(data ?? {}).filter(([, value]) => value !== null && value !== undefined),
          )
          setConfig({ ...defaultConfig, ...filled })
        } else {
          console.warn('No se pudo cargar configuración de landing, usando defaults')
          setConfig(defaultConfig)
        }
      } catch (error) {
        console.error('Error al cargar configuración de landing:', error)
        setConfig(defaultConfig)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, loading }
}
