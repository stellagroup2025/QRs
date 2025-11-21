"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useBrandingContext } from "@/components/BrandingProvider"
import { useLanding } from "@/hooks/use-landing"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Store,
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

// Mapeo de iconos
const iconMap: Record<string, any> = {
  Users,
  Gift,
  TrendingUp,
  QrCode,
  Shield,
  Zap,
  Store,
}

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
  const { branding, loading: brandingLoading } = useBrandingContext()
  const { landing, loading: landingLoading } = useLanding()

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("promos:v1")
    }
  }, [])

  if (brandingLoading || landingLoading) {
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

  // Construir array de servicios desde landing config
  const services = [
    {
      icon: iconMap[landing.servicio_1_icono] || Users,
      title: landing.servicio_1_titulo,
      description: landing.servicio_1_descripcion
    },
    {
      icon: iconMap[landing.servicio_2_icono] || Gift,
      title: landing.servicio_2_titulo,
      description: landing.servicio_2_descripcion
    },
    {
      icon: iconMap[landing.servicio_3_icono] || TrendingUp,
      title: landing.servicio_3_titulo,
      description: landing.servicio_3_descripcion
    },
    {
      icon: iconMap[landing.servicio_4_icono] || QrCode,
      title: landing.servicio_4_titulo,
      description: landing.servicio_4_descripcion
    },
    {
      icon: iconMap[landing.servicio_5_icono] || Shield,
      title: landing.servicio_5_titulo,
      description: landing.servicio_5_descripcion
    },
    {
      icon: iconMap[landing.servicio_6_icono] || Zap,
      title: landing.servicio_6_titulo,
      description: landing.servicio_6_descripcion
    }
  ]

  // Construir array de beneficios
  const benefits = [
    landing.beneficio_1,
    landing.beneficio_2,
    landing.beneficio_3,
    landing.beneficio_4,
    landing.beneficio_5,
    landing.beneficio_6,
  ].filter(Boolean)

  // Construir array de testimonios
  const testimonials = [
    {
      name: landing.testimonio_1_nombre,
      role: landing.testimonio_1_cargo,
      content: landing.testimonio_1_contenido,
      rating: landing.testimonio_1_rating
    },
    {
      name: landing.testimonio_2_nombre,
      role: landing.testimonio_2_cargo,
      content: landing.testimonio_2_contenido,
      rating: landing.testimonio_2_rating
    },
    {
      name: landing.testimonio_3_nombre,
      role: landing.testimonio_3_cargo,
      content: landing.testimonio_3_contenido,
      rating: landing.testimonio_3_rating
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
                      {landing.hero_titulo_principal}
                    </span>
                    <br />
                    <span style={{ color: branding.color_primario }}>
                      {landing.hero_titulo_destacado}
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                    {landing.hero_subtitulo}
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
                      {landing.hero_cta_principal}
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
                      {landing.hero_cta_secundario}
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
                    <span className="font-semibold text-gray-900">{landing.hero_social_proof}</span>
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
            className="max-w-7xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {landing.servicios_titulo}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {landing.servicios_subtitulo}
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ y: -8 }}
                    className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"
                      style={{ backgroundColor: branding.color_primario }}
                    />
                    <div className="relative z-10">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white"
                        style={{ backgroundColor: branding.color_primario }}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-24 md:py-32" style={{ backgroundColor: hexToRgba(branding.color_primario, 0.02) }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {landing.beneficios_titulo}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {landing.beneficios_subtitulo}
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="flex items-start gap-4 bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: branding.color_primario }}
                  >
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">{benefit}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Estadísticas */}
            <motion.div
              variants={fadeInUp}
              className="grid md:grid-cols-3 gap-8 mt-16"
            >
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{ color: branding.color_primario }}>
                  {landing.estadistica_principal_numero}
                </div>
                <div className="text-gray-600">{landing.estadistica_principal_texto}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{ color: branding.color_primario }}>
                  {landing.estadistica_1_numero}
                </div>
                <div className="text-gray-600">{landing.estadistica_1_texto}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{ color: branding.color_primario }}>
                  {landing.estadistica_2_numero}
                </div>
                <div className="text-gray-600">{landing.estadistica_2_texto}</div>
              </div>
            </motion.div>
          </motion.div>
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
            className="max-w-7xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {landing.testimonios_titulo}
              </h2>
            </motion.div>

            <motion.div variants={stagger} className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" style={{ color: branding.color_primario }} />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section
        className="py-24 md:py-32 relative overflow-hidden"
        style={{ backgroundColor: branding.color_primario }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {landing.cta_final_titulo_1}
              <br />
              {landing.cta_final_titulo_2}
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-white/90 mb-12">
              {landing.cta_final_subtitulo}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 bg-white hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300"
                style={{ color: branding.color_primario }}
              >
                <Link href="/get-qr" className="flex items-center gap-2">
                  {landing.cta_final_boton_principal}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10 transition-all duration-300"
              >
                <Link href="/login">
                  {landing.cta_final_boton_secundario}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{branding.nombre_comercial}</h3>
              <p className="text-gray-400">
                Sistema integral de fidelización y gestión de clientes.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Enlaces</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Acceder</Link></li>
                <li><Link href="/get-qr" className="hover:text-white transition-colors">Solicitar Información</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contacto</h3>
              <p className="text-gray-400">
                ¿Necesitas ayuda? Contáctanos y te responderemos lo antes posible.
              </p>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {branding.nombre_comercial}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
