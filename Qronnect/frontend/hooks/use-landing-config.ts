'use client'

import { useState, useEffect } from 'react'
import { useBrandingContext } from '@/components/BrandingProvider'

export interface LandingConfig {
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
  servicio_2_titulo: string
  servicio_2_descripcion: string
  servicio_2_icono: string
  servicio_3_titulo: string
  servicio_3_descripcion: string
  servicio_3_icono: string
  servicio_4_titulo: string
  servicio_4_descripcion: string
  servicio_4_icono: string
  servicio_5_titulo: string
  servicio_5_descripcion: string
  servicio_5_icono: string
  servicio_6_titulo: string
  servicio_6_descripcion: string
  servicio_6_icono: string

  // Beneficios
  beneficios_titulo: string
  beneficios_subtitulo: string
  beneficio_1: string
  beneficio_2: string
  beneficio_3: string
  beneficio_4: string
  beneficio_5: string
  beneficio_6: string

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

const defaultConfig: LandingConfig = {
  hero_titulo_principal: 'Impulsa tu negocio',
  hero_titulo_destacado: 'al siguiente nivel',
  hero_subtitulo:
    'Sistema integral de fidelización y gestión de clientes para negocios modernos.',
  hero_cta_principal: 'Solicitar Información',
  hero_cta_secundario: 'Acceder',
  hero_social_proof: '+10,000 negocios confían en nosotros',

  servicios_titulo: 'Soluciones completas',
  servicios_subtitulo:
    'Todo lo que necesitas para gestionar y fidelizar a tus clientes en una sola plataforma',

  servicio_1_titulo: 'Gestión de Clientes',
  servicio_1_descripcion:
    'Sistema completo para gestionar tu base de clientes de forma eficiente y personalizada.',
  servicio_1_icono: 'Users',
  servicio_2_titulo: 'Programa de Fidelización',
  servicio_2_descripcion:
    'Recompensa a tus clientes habituales y aumenta su lealtad con nuestro sistema de puntos.',
  servicio_2_icono: 'Gift',
  servicio_3_titulo: 'Análisis y Métricas',
  servicio_3_descripcion:
    'Obtén insights valiosos sobre el comportamiento de tus clientes y optimiza tu negocio.',
  servicio_3_icono: 'TrendingUp',
  servicio_4_titulo: 'Tarjetas Digitales QR',
  servicio_4_descripcion:
    'Olvídate de las tarjetas físicas. Todo digital, fácil y accesible desde el móvil.',
  servicio_4_icono: 'QrCode',
  servicio_5_titulo: 'Seguridad Garantizada',
  servicio_5_descripcion:
    'Tus datos y los de tus clientes protegidos con los más altos estándares de seguridad.',
  servicio_5_icono: 'Shield',
  servicio_6_titulo: 'Rápido y Eficiente',
  servicio_6_descripcion:
    'Implementación inmediata. Empieza a usar el sistema en minutos, no en semanas.',
  servicio_6_icono: 'Zap',

  beneficios_titulo: '¿Por qué elegirnos?',
  beneficios_subtitulo:
    'Beneficios reales que impactan directamente en tu negocio',
  beneficio_1: 'Aumenta la retención de clientes hasta un 40%',
  beneficio_2: 'Reduce costos operativos eliminando tarjetas físicas',
  beneficio_3: 'Acceso a métricas en tiempo real',
  beneficio_4: 'Integración sencilla con tu sistema actual',
  beneficio_5: 'Soporte técnico incluido',
  beneficio_6: 'Actualizaciones automáticas sin costo adicional',

  estadistica_principal_numero: '40%',
  estadistica_principal_texto: 'Incremento promedio en retención',
  estadistica_1_numero: '10k+',
  estadistica_1_texto: 'Negocios activos',
  estadistica_2_numero: '500k+',
  estadistica_2_texto: 'Usuarios registrados',

  testimonios_titulo: 'Lo que dicen nuestros clientes',
  testimonio_1_nombre: 'María García',
  testimonio_1_cargo: 'Gerente, Boutique Fashion',
  testimonio_1_contenido:
    'Desde que implementamos este sistema, nuestros clientes están más comprometidos y las ventas han aumentado un 35%.',
  testimonio_1_rating: 5,
  testimonio_2_nombre: 'Carlos Rodríguez',
  testimonio_2_cargo: 'Propietario, Café Central',
  testimonio_2_contenido:
    'La mejor inversión que hemos hecho. Nuestros clientes adoran la comodidad de la tarjeta digital y nosotros ahorramos en impresiones.',
  testimonio_2_rating: 5,
  testimonio_3_nombre: 'Ana Martínez',
  testimonio_3_cargo: 'Directora, Spa Wellness',
  testimonio_3_contenido:
    'Excelente plataforma. Fácil de usar tanto para nosotros como para nuestros clientes. El soporte es excepcional.',
  testimonio_3_rating: 5,

  cta_final_titulo_1: '¿Listo para transformar',
  cta_final_titulo_2: 'tu negocio?',
  cta_final_subtitulo:
    'Únete a miles de negocios que ya están revolucionando la forma de gestionar sus clientes',
  cta_final_boton_principal: 'Comenzar ahora',
  cta_final_boton_secundario: 'Ya tengo cuenta',
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
          setConfig(data)
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
