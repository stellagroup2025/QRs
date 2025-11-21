"use client"

import { useEffect, useState } from "react"

export interface LandingConfig {
  // Hero Section
  hero_titulo_principal: string
  hero_titulo_destacado: string
  hero_subtitulo: string
  hero_cta_principal: string
  hero_cta_secundario: string
  hero_social_proof: string

  // Servicios/Soluciones
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

// Valores por defecto
const DEFAULT_LANDING: LandingConfig = {
  // Hero Section
  hero_titulo_principal: "Impulsa tu negocio",
  hero_titulo_destacado: "al siguiente nivel",
  hero_subtitulo: "Sistema integral de fidelización y gestión de clientes para negocios modernos. Aumenta la retención y potencia tus ventas.",
  hero_cta_principal: "Solicitar Información",
  hero_cta_secundario: "Acceder",
  hero_social_proof: "Más de 500 comercios ya confían en nosotros",

  // Servicios/Soluciones
  servicios_titulo: "Soluciones completas para tu negocio",
  servicios_subtitulo: "Todo lo que necesitas en una sola plataforma",
  servicio_1_titulo: "Gestión de Clientes",
  servicio_1_descripcion: "Sistema completo para gestionar tu base de clientes, historial de compras y preferencias.",
  servicio_1_icono: "Users",
  servicio_2_titulo: "Programa de Fidelización",
  servicio_2_descripcion: "Recompensa a tus clientes frecuentes con un sistema de puntos personalizable.",
  servicio_2_icono: "Gift",
  servicio_3_titulo: "Análisis en Tiempo Real",
  servicio_3_descripcion: "Dashboards interactivos para tomar decisiones basadas en datos.",
  servicio_3_icono: "TrendingUp",
  servicio_4_titulo: "QR Dinámicos",
  servicio_4_descripcion: "Códigos QR únicos para cada cliente, fácil de escanear y gestionar.",
  servicio_4_icono: "QrCode",
  servicio_5_titulo: "Seguridad Avanzada",
  servicio_5_descripcion: "Tus datos y los de tus clientes protegidos con tecnología de última generación.",
  servicio_5_icono: "Shield",
  servicio_6_titulo: "Velocidad y Eficiencia",
  servicio_6_descripcion: "Interfaz rápida y fluida que facilita el trabajo diario.",
  servicio_6_icono: "Zap",

  // Beneficios
  beneficios_titulo: "Por qué elegirnos",
  beneficios_subtitulo: "Beneficios que marcan la diferencia",
  beneficio_1: "Aumenta la retención de clientes hasta un 40%",
  beneficio_2: "Reduce el tiempo de atención en un 60%",
  beneficio_3: "Incrementa las ventas recurrentes",
  beneficio_4: "Acceso desde cualquier dispositivo",
  beneficio_5: "Soporte técnico en español 24/7",
  beneficio_6: "Sin permanencia ni costes ocultos",

  // Estadísticas
  estadistica_principal_numero: "500+",
  estadistica_principal_texto: "Comercios activos",
  estadistica_1_numero: "98%",
  estadistica_1_texto: "Satisfacción",
  estadistica_2_numero: "24/7",
  estadistica_2_texto: "Soporte",

  // Testimonios
  testimonios_titulo: "Lo que dicen nuestros clientes",
  testimonio_1_nombre: "María García",
  testimonio_1_cargo: "Gerente, Boutique Fashion",
  testimonio_1_contenido: "Desde que implementamos este sistema, nuestras ventas recurrentes han aumentado un 35%. Los clientes aman el programa de puntos.",
  testimonio_1_rating: 5,
  testimonio_2_nombre: "Carlos Rodríguez",
  testimonio_2_cargo: "Dueño, Cafetería Aroma",
  testimonio_2_contenido: "La mejor inversión que hemos hecho. El sistema es súper intuitivo y el soporte es excepcional.",
  testimonio_2_rating: 5,
  testimonio_3_nombre: "Ana Martínez",
  testimonio_3_cargo: "Propietaria, Spa Relax",
  testimonio_3_contenido: "Perfecto para gestionar citas y fidelizar clientes. Mis clientas están encantadas con el sistema de recompensas.",
  testimonio_3_rating: 5,

  // CTA Final
  cta_final_titulo_1: "¿Listo para transformar",
  cta_final_titulo_2: "tu negocio?",
  cta_final_subtitulo: "Únete a cientos de comercios que ya están creciendo con nosotros",
  cta_final_boton_principal: "Solicitar Información",
  cta_final_boton_secundario: "Ver Demo",
}

export function useLanding() {
  const [landing, setLanding] = useState<LandingConfig>(DEFAULT_LANDING)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLanding() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

        // Obtener el dominio de la tienda actual
        const host = window.location.host
        const domain = host.split(":")[0].split(".")[0]

        const response = await fetch(`${API_URL}/api/config/landing`, {
          headers: {
            "X-Tenant-Domain": domain === "localhost" ? "visionplus" : domain,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setLanding({ ...DEFAULT_LANDING, ...data })
        } else {
          console.warn("No se pudo cargar la configuración de landing, usando valores por defecto")
          setLanding(DEFAULT_LANDING)
        }
      } catch (err) {
        console.error("Error al cargar configuración de landing:", err)
        setError("Error al cargar configuración")
        setLanding(DEFAULT_LANDING)
      } finally {
        setLoading(false)
      }
    }

    fetchLanding()
  }, [])

  return { landing, loading, error }
}
