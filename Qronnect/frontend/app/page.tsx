"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useBrandingContext } from "@/components/BrandingProvider"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Store,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Gift,
  QrCode,
  Check,
  Star,
  ArrowRight
} from "lucide-react"

// Variantes de animación
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const { branding, loading } = useBrandingContext()

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("promos:v1")
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-200 border-t-transparent rounded-full"
          style={{ borderTopColor: branding.color_primario }}
        />
      </div>
    )
  }

  const hexToRgba = (hex: string, alpha: number = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(0, 0, 0, ${alpha})`
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const services = [
    {
      icon: Users,
      title: "Gestión de Clientes",
      description: "Sistema completo para gestionar tu base de clientes de forma eficiente y personalizada."
    },
    {
      icon: Gift,
      title: "Programa de Fidelización",
      description: "Recompensa a tus clientes habituales y aumenta su lealtad con nuestro sistema de puntos."
    },
    {
      icon: TrendingUp,
      title: "Análisis y Métricas",
      description: "Obtén insights valiosos sobre el comportamiento de tus clientes y optimiza tu negocio."
    },
    {
      icon: QrCode,
      title: "Tarjetas Digitales QR",
      description: "Olvídate de las tarjetas físicas. Todo digital, fácil y accesible desde el móvil."
    },
    {
      icon: Shield,
      title: "Seguridad Garantizada",
      description: "Tus datos y los de tus clientes protegidos con los más altos estándares de seguridad."
    },
    {
      icon: Zap,
      title: "Rápido y Eficiente",
      description: "Implementación inmediata. Empieza a usar el sistema en minutos, no en semanas."
    }
  ]

  const benefits = [
    "Aumenta la retención de clientes hasta un 40%",
    "Reduce costos operativos eliminando tarjetas físicas",
    "Acceso a métricas en tiempo real",
    "Integración sencilla con tu sistema actual",
    "Soporte técnico incluido",
    "Actualizaciones automáticas sin costo adicional"
  ]

  const testimonials = [
    {
      name: "María García",
      role: "Gerente, Boutique Fashion",
      content: "Desde que implementamos este sistema, nuestros clientes están más comprometidos y las ventas han aumentado un 35%.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Propietario, Café Central",
      content: "La mejor inversión que hemos hecho. Nuestros clientes adoran la comodidad de la tarjeta digital y nosotros ahorramos en impresiones.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Directora, Spa Wellness",
      content: "Excelente plataforma. Fácil de usar tanto para nosotros como para nuestros clientes. El soporte es excepcional.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-8"
              >
                {branding.logo_url && (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    src={branding.logo_url}
                    alt={branding.nombre_comercial}
                    className="h-16 md:h-20 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}

                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      Impulsa tu negocio
                    </span>
                    <br />
                    <span style={{ color: branding.color_primario }}>
                      al siguiente nivel
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                    Sistema integral de fidelización y gestión de clientes para negocios modernos.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="text-lg px-8 py-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                    style={{ backgroundColor: branding.color_primario }}
                  >
                    <Link href="/get-qr" className="flex items-center gap-2">
                      Solicitar Información
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 transition-all duration-300 transform hover:-translate-y-0.5"
                    style={{ borderColor: branding.color_primario, color: branding.color_primario }}
                  >
                    <Link href="/login">
                      Acceder
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold"
                        style={{ backgroundColor: hexToRgba(branding.color_primario, 0.8 - i * 0.15) }}
                      >
                        {i}k
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">+10,000</span> negocios confían en nosotros
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="hidden md:block"
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
                    style={{ backgroundColor: branding.color_primario }}
                  />
                  <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                    <div className="aspect-square flex items-center justify-center">
                      <Store className="w-64 h-64 opacity-10" style={{ color: branding.color_primario }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <QrCode className="w-32 h-32" style={{ color: branding.color_primario }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios / Soluciones */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gray-900">Soluciones </span>
                <span style={{ color: branding.color_primario }}>completas</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Todo lo que necesitas para gestionar y fidelizar a tus clientes en una sola plataforma
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300"
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                    style={{ backgroundColor: branding.color_primario }}
                  />
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300"
                      style={{ backgroundColor: hexToRgba(branding.color_primario, 0.1) }}
                    >
                      <service.icon className="w-7 h-7" style={{ color: branding.color_primario }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <motion.div variants={fadeInUp} className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">
                    <span className="text-gray-900">¿Por qué elegirnos?</span>
                  </h2>
                  <p className="text-xl text-gray-600">
                    Beneficios reales que impactan directamente en tu negocio
                  </p>
                </div>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-white transition-colors duration-300"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: branding.color_primario }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-gray-700 font-medium">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="relative"
              >
                <div
                  className="absolute -inset-4 rounded-3xl blur-2xl opacity-20"
                  style={{ backgroundColor: branding.color_primario }}
                />
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-12 border border-gray-100 shadow-xl">
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <div className="text-6xl font-bold" style={{ color: branding.color_primario }}>40%</div>
                      <div className="text-gray-600">Incremento promedio en retención</div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center space-y-1">
                        <div className="text-3xl font-bold text-gray-900">10k+</div>
                        <div className="text-sm text-gray-600">Negocios activos</div>
                      </div>
                      <div className="text-center space-y-1">
                        <div className="text-3xl font-bold text-gray-900">500k+</div>
                        <div className="text-sm text-gray-600">Usuarios registrados</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gray-900">Lo que dicen </span>
                <span style={{ color: branding.color_primario }}>nuestros clientes</span>
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid md:grid-cols-3 gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" style={{ color: branding.color_primario }} />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: branding.color_primario }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundColor: branding.color_primario }}
        />
        <div className="relative container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="text-gray-900">¿Listo para transformar </span>
              <br />
              <span style={{ color: branding.color_primario }}>tu negocio?</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              Únete a miles de negocios que ya están revolucionando la forma de gestionar sus clientes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                className="text-lg px-10 py-7 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: branding.color_primario }}
              >
                <Link href="/get-qr" className="flex items-center gap-2">
                  Comenzar ahora
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 border-2 transition-all duration-300 transform hover:-translate-y-1"
                style={{ borderColor: branding.color_primario, color: branding.color_primario }}
              >
                <Link href="/login">
                  Ya tengo cuenta
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="space-y-4">
                {branding.logo_url && (
                  <img
                    src={branding.logo_url}
                    alt={branding.nombre_comercial}
                    className="h-10 w-auto object-contain brightness-0 invert"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <p className="text-gray-400 text-sm leading-relaxed">
                  {branding.nombre_comercial}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Producto</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="#" className="hover:text-white transition-colors">Características</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Precios</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Casos de uso</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Empresa</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="#" className="hover:text-white transition-colors">Sobre nosotros</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Acceso</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                  <li><Link href="/get-qr" className="hover:text-white transition-colors">Registrarse</Link></li>
                  <li><Link href="/recuperar" className="hover:text-white transition-colors">Recuperar cuenta</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} {branding.nombre_comercial}. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
