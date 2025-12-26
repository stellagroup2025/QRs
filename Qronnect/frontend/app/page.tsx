'use client'

import { useEffect, useState } from 'react'
import { isRootDomain } from '@/lib/tenant'
import { ProductLandingPage } from '@/components/ProductLandingPage'
import { Button } from '@/components/ui/button'
import { useBrandingContext } from '@/components/BrandingProvider'
import { useLandingConfig } from '@/hooks/use-landing-config'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Sparkles,
  Users, Gift, TrendingUp, QrCode, Shield, Zap, Check, Star, ArrowRight,
  Heart, CheckCircle, Calendar, Clock, MapPin, Phone, Mail, Globe,
  Award, ThumbsUp, Camera, Video, Music, Smile, ShoppingBag, CreditCard, Truck
} from 'lucide-react'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const [isRoot, setIsRoot] = useState(false)

  // Detectar si es dominio raíz en el cliente
  useEffect(() => {
    setIsRoot(isRootDomain())
  }, [])

  // Si es dominio raíz de Qronnect, mostrar landing de producto
  if (isRoot) {
    return <ProductLandingPage />
  }

  // Si no, es un tenant - mostrar landing personalizada
  return <TenantLandingPage />
}

function TenantLandingPage() {
  const { branding, loading: brandingLoading } = useBrandingContext()
  const { config, loading: configLoading } = useLandingConfig()

  const loading = brandingLoading || configLoading

  const displayBrandName =
    !branding.nombre_comercial || branding.nombre_comercial === 'Mi Tienda'
      ? 'Qronnect'
      : branding.nombre_comercial

  // ✅ logoSrc siempre es string: si no hay logo_url válido, usamos LogoQronnect.png
  const logoSrc: string =
    branding.logo_url && branding.logo_url.trim() !== ''
      ? branding.logo_url
      : '/LogoQronnect.png'

  const metrics = [
    {
      id: 'retention',
      value: config.estadistica_principal_numero,
      label: config.estadistica_principal_texto
    },
    {
      id: 'businesses',
      value: config.estadistica_1_numero,
      label: config.estadistica_1_texto
    },
    {
      id: 'users',
      value: config.estadistica_2_numero,
      label: config.estadistica_2_texto
    }
  ].filter(m => m.value && m.value.trim() !== '')

  const [activeMetric, setActiveMetric] = useState(0)

  useEffect(() => {
    if (metrics.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [metrics.length])

  const mainMetric = metrics.length > 0 ? metrics[activeMetric] : null
  const secondaryMetrics = metrics.length >= 3
    ? [
      metrics[(activeMetric + 1) % metrics.length],
      metrics[(activeMetric + 2) % metrics.length]
    ]
    : []

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('promos:v1')
    }
  }, [])

  if (loading) {
    return (
      <div
        className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white'
        role="status"
        aria-live="polite"
        aria-label="Cargando página"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className='w-12 h-12 border-4 border-gray-200 border-t-transparent rounded-full'
          style={{ borderTopColor: branding.color_primario }}
          aria-hidden="true"
        />
        <VisuallyHidden>Cargando contenido de la página...</VisuallyHidden>
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

  const iconMap: Record<string, any> = {
    Users,
    Gift,
    TrendingUp,
    QrCode,
    Shield,
    Zap,
    Heart,
    Star,
    CheckCircle,
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    Globe,
    Award,
    ThumbsUp,
    Camera,
    Video,
    Music,
    Smile,
    ShoppingBag,
    CreditCard,
    Truck,
  }

  const services = [
    {
      icon: iconMap[config.servicio_1_icono] || Users,
      title: config.servicio_1_titulo,
      description: config.servicio_1_descripcion,
      active: config.servicio_1_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_2_icono] || Gift,
      title: config.servicio_2_titulo,
      description: config.servicio_2_descripcion,
      active: config.servicio_2_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_3_icono] || TrendingUp,
      title: config.servicio_3_titulo,
      description: config.servicio_3_descripcion,
      active: config.servicio_3_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_4_icono] || QrCode,
      title: config.servicio_4_titulo,
      description: config.servicio_4_descripcion,
      active: config.servicio_4_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_5_icono] || Shield,
      title: config.servicio_5_titulo,
      description: config.servicio_5_descripcion,
      active: config.servicio_5_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_6_icono] || Zap,
      title: config.servicio_6_titulo,
      description: config.servicio_6_descripcion,
      active: config.servicio_6_activo ?? true,
    },
  ].filter(service => service.active)

  const benefits = [
    { text: config.beneficio_1, active: config.beneficio_1_activo ?? true },
    { text: config.beneficio_2, active: config.beneficio_2_activo ?? true },
    { text: config.beneficio_3, active: config.beneficio_3_activo ?? true },
    { text: config.beneficio_4, active: config.beneficio_4_activo ?? true },
    { text: config.beneficio_5, active: config.beneficio_5_activo ?? true },
    { text: config.beneficio_6, active: config.beneficio_6_activo ?? true },
  ].filter(b => b.active && b.text).map(b => b.text)

  const testimonials = [
    {
      name: config.testimonio_1_nombre,
      role: config.testimonio_1_cargo,
      content: config.testimonio_1_contenido,
      rating: config.testimonio_1_rating,
    },
    {
      name: config.testimonio_2_nombre,
      role: config.testimonio_2_cargo,
      content: config.testimonio_2_contenido,
      rating: config.testimonio_2_rating,
    },
    {
      name: config.testimonio_3_nombre,
      role: config.testimonio_3_cargo,
      content: config.testimonio_3_contenido,
      rating: config.testimonio_3_rating,
    },
  ]

  return (
    <div className='min-h-screen bg-white'>
      {/* Skip Link para accesibilidad */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Saltar al contenido principal
      </a>

      {/* Hero Section */}
      <section
        id="main-content"
        className='relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 bg-cover bg-center'
        style={{ backgroundImage: config.hero_bg_url ? `url(${config.hero_bg_url})` : undefined }}
        aria-label="Sección principal del sitio"
      >
        <div className='absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]' />

        <div className='relative container mx-auto px-4 py-12 md:py-20'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid md:grid-cols-2 gap-10 items-center'>
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className='space-y-6'
              >
                {/* Logo con fallback a LogoQronnect */}
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src={logoSrc}
                  alt={`Logo de ${displayBrandName} - Programa de fidelización con códigos QR`}
                  className='h-14 md:h-16 w-auto object-contain'
                  role="img"
                  onError={(e) => {
                    // Evitar bucle infinito de onError
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/LogoQronnect.png'
                  }}
                />

                <div className='space-y-4'>
                  <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
                    <span className='bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent'>
                      {config.hero_titulo_principal}
                    </span>
                    <br />
                    <span style={{ color: branding.color_primario }}>
                      {config.hero_titulo_destacado}
                    </span>
                  </h1>

                  <p className='text-lg md:text-xl text-gray-600 leading-relaxed'>
                    {config.hero_subtitulo}
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-3'>
                  <Button
                    asChild
                    size='lg'
                    className='text-base md:text-lg px-6 md:px-8 py-4 md:py-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5'
                    style={{ backgroundColor: branding.color_primario }}
                  >
                    <Link
                      href='/get-qr'
                      className='flex items-center gap-2'
                      aria-label="Obtener mi código QR de fidelización - Acción principal"
                    >
                      {config.hero_cta_principal}
                      <ArrowRight className='w-5 h-5' aria-hidden="true" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size='lg'
                    variant='outline'
                    className='text-base md:text-lg px-6 md:px-8 py-4 md:py-5 border-2 transition-all duration-300 transform hover:-translate-y-0.5'
                    style={{
                      borderColor: branding.color_primario,
                      color: branding.color_primario
                    }}
                  >
                    <Link
                      href='/login'
                      aria-label="Iniciar sesión en mi cuenta"
                    >
                      {config.hero_cta_secundario}
                    </Link>
                  </Button>
                </div>

                <div className='flex items-center gap-6 pt-2'>
                  <div className='flex -space-x-2' aria-hidden="true">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className='w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold'
                        style={{
                          backgroundColor: hexToRgba(
                            branding.color_primario,
                            0.8 - i * 0.15
                          )
                        }}
                      >
                        {i}k
                      </div>
                    ))}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {config.hero_social_proof}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className='hidden md:block'
              >
                <div className='relative'>
                  {/* Glow de color */}
                  <div
                    className='absolute inset-0 rounded-3xl blur-3xl opacity-20'
                    style={{ backgroundColor: branding.color_primario }}
                  />

                  {/* Card */}
                  <div className='relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-100'>
                    <div className='aspect-square overflow-hidden rounded-2xl relative'>
                      <Image
                        src={config.hero_imagen_url || '/gente-de-negocios-dandose-la-mano-para-saludar.webp'}
                        alt='Imagen Principal'
                        fill
                        className='object-cover'
                        sizes='(max-width: 768px) 100vw, 50vw'
                        priority={true}
                        quality={90}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios / Soluciones */}
      <section
        className='py-12 md:py-16 bg-white bg-cover bg-center'
        style={{ backgroundImage: config.servicios_bg_url ? `url(${config.servicios_bg_url})` : undefined }}
        aria-labelledby="servicios-heading"
      >
        <div className='container mx-auto px-4'>
          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={stagger}
            className='max-w-6xl mx-auto'
          >
            <motion.div
              variants={fadeInUp}
              className='text-center mb-10 md:mb-12'
            >
              <h2 id="servicios-heading" className='text-3xl md:text-4xl font-bold mb-4'>
                <span className='text-gray-900'>{config.servicios_titulo.split(' ')[0]} </span>
                <span style={{ color: branding.color_primario }}>
                  {config.servicios_titulo.split(' ').slice(1).join(' ')}
                </span>
              </h2>
              <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                {config.servicios_subtitulo}
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
              role="list"
              aria-label="Lista de servicios disponibles"
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className='group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300'
                  role="listitem"
                  aria-label={`Servicio: ${service.title}`}
                >
                  <div
                    className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300'
                    style={{ backgroundColor: branding.color_primario }}
                    aria-hidden="true"
                  />
                  <div className='relative'>
                    <div
                      className='w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300'
                      style={{
                        backgroundColor: hexToRgba(branding.color_primario, 0.1)
                      }}
                      aria-hidden="true"
                    >
                      <service.icon
                        className='w-6 h-6'
                        style={{ color: branding.color_primario }}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className='text-lg font-semibold mb-2 text-gray-900'>
                      {service.title}
                    </h3>
                    <p className='text-gray-600 text-sm leading-relaxed'>
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Beneficios */}
      <section
        className='py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white bg-cover bg-center'
        style={{ backgroundImage: config.beneficios_bg_url ? `url(${config.beneficios_bg_url})` : undefined }}
      >
        <div className='container mx-auto px-4'>
          <div className='max-w-5xl mx-auto'>
            <motion.div
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
              variants={stagger}
              className='grid md:grid-cols-2 gap-10 items-center'
            >
              <motion.div variants={fadeInUp} className='space-y-6'>
                <div className='space-y-2'>
                  <h2 className='text-3xl md:text-4xl font-bold'>
                    <span className='text-gray-900'>{config.beneficios_titulo}</span>
                  </h2>
                  <p className='text-lg text-gray-600'>
                    {config.beneficios_subtitulo}
                  </p>
                </div>

                <div className='space-y-3'>
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className='flex items-start gap-3 p-3 rounded-xl hover:bg-white transition-colors duration-300'
                    >
                      <div
                        className='w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'
                        style={{ backgroundColor: branding.color_primario }}
                      >
                        <Check className='w-4 h-4 text-white' />
                      </div>
                      <p className='text-gray-700 text-sm md:text-base font-medium'>
                        {benefit}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className='relative'>
                {metrics.length > 0 && (
                  <>
                    <div
                      className='absolute -inset-3 rounded-3xl blur-2xl opacity-20'
                      style={{ backgroundColor: branding.color_primario }}
                    />
                    <div className='relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100 shadow-xl'>
                      <AnimatePresence mode='wait'>
                        {mainMetric && (
                          <motion.div
                            key={mainMetric.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className='space-y-6'
                          >
                            {/* BLOQUE PRINCIPAL (número + texto juntos) */}
                            <div className='text-center space-y-1'>
                              <div
                                className='text-5xl font-bold'
                                style={{ color: branding.color_primario }}
                              >
                                {mainMetric.value}
                              </div>
                              <div className='text-gray-600 text-sm'>
                                {mainMetric.label}
                              </div>
                            </div>

                            {/* BLOQUES SECUNDARIOS (número + texto juntos) */}
                            {secondaryMetrics.length > 0 && (
                              <div className='grid grid-cols-2 gap-4'>
                                {secondaryMetrics.map((metric) => (
                                  <div
                                    key={metric.id}
                                    className='text-center space-y-1'
                                  >
                                    <div className='text-2xl font-bold text-gray-900'>
                                      {metric.value}
                                    </div>
                                    <div className='text-xs text-gray-600'>
                                      {metric.label}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section
        className='py-12 md:py-16 bg-white bg-cover bg-center'
        style={{ backgroundImage: config.testimonios_bg_url ? `url(${config.testimonios_bg_url})` : undefined }}
      >
        <div className='container mx-auto px-4'>
          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={stagger}
            className='max-w-6xl mx-auto'
          >
            <motion.div
              variants={fadeInUp}
              className='text-center mb-10 md:mb-12'
            >
              <h2 className='text-3xl md:text-4xl font-bold mb-4'>
                <span className='text-gray-900'>{config.testimonios_titulo.split(' ').slice(0, -2).join(' ')} </span>
                <span style={{ color: branding.color_primario }}>
                  {config.testimonios_titulo.split(' ').slice(-2).join(' ')}
                </span>
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              className='grid md:grid-cols-3 gap-6 md:gap-8'
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className='bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300'
                  role="article"
                  aria-label={`Testimonio de ${testimonial.name}`}
                >
                  <div
                    className='flex gap-1 mb-4'
                    role="img"
                    aria-label={`Calificación: ${testimonial.rating} de 5 estrellas`}
                  >
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className='w-5 h-5 sm:w-4 sm:h-4 fill-current'
                        style={{ color: branding.color_primario }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className='text-gray-700 text-sm md:text-base leading-relaxed mb-4 italic'>
                    "{testimonial.content}"
                  </p>
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold'
                      style={{ backgroundColor: branding.color_primario }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900 text-sm md:text-base'>
                        {testimonial.name}
                      </div>
                      <div className='text-xs text-gray-600'>
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section
        className='py-12 md:py-16 relative overflow-hidden bg-cover bg-center'
        style={{ backgroundImage: config.cta_final_bg_url ? `url(${config.cta_final_bg_url})` : undefined }}
      >
        <div
          className='absolute inset-0 opacity-5'
          style={{ backgroundColor: branding.color_primario }}
        />
        <div className='relative container mx-auto px-4'>
          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={fadeInUp}
            className='max-w-4xl mx-auto text-center space-y-6'
          >
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold'>
              <span className='text-gray-900'>{config.cta_final_titulo_1} </span>
              <br />
              <span style={{ color: branding.color_primario }}>
                {config.cta_final_titulo_2}
              </span>
            </h2>
            <p className='text-lg md:text-xl text-gray-600 max-w-2xl mx-auto'>
              {config.cta_final_subtitulo}
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center pt-2'>
              <Button
                asChild
                size='lg'
                className='text-base md:text-lg px-8 md:px-10 py-4 md:py-5 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1'
                style={{ backgroundColor: branding.color_primario }}
              >
                <Link href='/get-qr' className='flex items-center gap-2'>
                  {config.cta_final_boton_principal}
                  <ArrowRight className='w-5 h-5' />
                </Link>
              </Button>
              {config.cta_final_boton_secundario && (
                <Button
                  asChild
                  size='lg'
                  variant='outline'
                  className='text-base md:text-lg px-8 md:px-10 py-4 md:py-5 border-2 transition-all duration-300 transform hover:-translate-y-1'
                  style={{
                    borderColor: branding.color_primario,
                    color: branding.color_primario
                  }}
                >
                  <Link href='/login'>{config.cta_final_boton_secundario}</Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            {/* GRID PRINCIPAL */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-12 text-center md:text-left'>
              {/* Branding */}
              <div className='space-y-4'>
                <img
                  src={logoSrc}
                  alt={displayBrandName}
                  className='h-10 mx-auto md:mx-0 w-auto object-contain'
                  onError={(e) => {
                    // Fallback a tu logo si falla el del cliente
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/LogoQronnect.png'
                  }}
                />
                <p className='text-gray-400 text-sm leading-relaxed'>
                  {displayBrandName}
                </p>
              </div>

              {/* Producto */}
              <div>
                <h3 className='font-semibold mb-4 text-sm md:text-base text-white'>
                  Producto
                </h3>
                <ul className='space-y-2 text-gray-400 text-sm'>
                  <li>
                    <Link
                      href='#'
                      className='hover:text-white transition-colors'
                    >
                      Características
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='#'
                      className='hover:text-white transition-colors'
                    >
                      Precios
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='#'
                      className='hover:text-white transition-colors'
                    >
                      Casos de uso
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Empresa */}
              <div>
                <h3 className='font-semibold mb-4 text-sm md:text-base text-white'>
                  Empresa
                </h3>
                <ul className='space-y-2 text-gray-400 text-sm'>
                  <li>
                    <Link
                      href='#'
                      className='hover:text-white transition-colors'
                    >
                      Sobre nosotros
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='#'
                      className='hover:text-white transition-colors'
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='#'
                      className='hover:text-white transition-colors'
                    >
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Acceso */}
              <div>
                <h3 className='font-semibold mb-4 text-sm md:text-base text-white'>
                  Acceso
                </h3>
                <ul className='space-y-2 text-gray-400 text-sm'>
                  <li>
                    <Link
                      href='/login'
                      className='hover:text-white transition-colors'
                    >
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/get-qr'
                      className='hover:text-white transition-colors'
                    >
                      Registrarse
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/recuperar'
                      className='hover:text-white transition-colors'
                    >
                      Recuperar cuenta
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* LINEA SEPARADORA */}
            <div className='border-t border-gray-800 pt-8 text-center text-gray-400 text-sm space-y-4'>
              {/* COPYRIGHT */}
              <p>
                &copy; {new Date().getFullYear()} {displayBrandName}. Todos los
                derechos reservados.
              </p>

              {/* STELLAGROUP */}
              <p className='text-xs md:text-sm'>
                Producto desarrollado por{' '}
                <Link
                  href='https://stellagroup.es'
                  target='_blank'
                  className='text-blue-400 hover:text-blue-300 underline decoration-blue-400/40 hover:decoration-blue-300/60 transition-colors'
                >
                  StellaGroup
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
