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

  // Helper to detect if a color is light (approximated)
  const isLightColor = (color: string) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return brightness > 200 // Threshold for "light/white"
  }

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

  // Safe colors logic: If secondary is light, use primary or dark gray for text
  const safeColorSecundario = isLightColor(branding.color_secundario)
    ? branding.color_primario
    : branding.color_secundario

  // Accent often needs to be visible on white. If light yellow/white, maybe fallback to primary or warning color
  const safeColorAcento = isLightColor(branding.color_acento)
    ? '#F59E0B' // Default Gold/Orange if accent is too light (like white)
    : branding.color_acento || branding.color_primario

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

  const iconMap: Record<string, any> = {
    Users, Gift, TrendingUp, QrCode, Shield, Zap, Heart, Star, CheckCircle,
    Calendar, Clock, MapPin, Phone, Mail, Globe, Award, ThumbsUp, Camera,
    Video, Music, Smile, ShoppingBag, CreditCard, Truck,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": displayBrandName,
            "description": config.hero_subtitulo || `Programa de fidelización de ${displayBrandName}`,
            "image": [
              config.hero_imagen_url || undefined,
              branding.logo_url || undefined
            ].filter(Boolean),
            "url": typeof window !== 'undefined' ? window.location.href : undefined,
          })
        }}
      />
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
        className='relative overflow-hidden bg-gray-50'
        aria-label="Sección principal del sitio"
      >
        {/* Dynamic Background */}
        {config.hero_bg_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${config.hero_bg_url})` }}
          />
        ) : (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20 animate-pulse"
              style={{ backgroundColor: branding.color_primario }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20 animate-pulse"
              style={{ backgroundColor: isLightColor(branding.color_secundario) ? branding.color_primario : branding.color_secundario, animationDelay: '1s' }} />
            {/* Accent color sprinkle */}
            <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] rounded-full blur-[80px] opacity-10"
              style={{ backgroundColor: safeColorAcento }} />

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          </div>
        )}

        {/* Overlay if image exists */}
        {config.hero_bg_url && <div className="absolute inset-0 bg-white/80 z-0" />}

        <div className='relative z-10 container mx-auto px-4 py-20 md:py-32'>
          <div className='max-w-7xl mx-auto'>
            <div className='grid lg:grid-cols-2 gap-12 items-center'>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className='space-y-8 order-2 md:order-1'
              >
                {/* Brand Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border bg-white/50 backdrop-blur-sm shadow-sm"
                  style={{ borderColor: `${safeColorAcento}40`, color: safeColorAcento }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{brandingLoading ? "Cargando..." : displayBrandName}</span>
                </motion.div>

                <div className='space-y-6'>
                  <h1 className='text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-gray-900'>
                    {config.hero_titulo_principal}{' '}
                    <span
                      className="relative inline-block"
                    >
                      <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${branding.color_primario}, ${safeColorSecundario})`
                        }}
                      >
                        {config.hero_titulo_destacado}
                      </span>
                      {/* Underline decoration */}
                      <svg className="absolute -bottom-2 w-full h-3 left-0 z-0 opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 5 Q 50 10 100 5" stroke={safeColorAcento} strokeWidth="6" fill="none" />
                      </svg>
                    </span>
                  </h1>

                  <p className='text-xl md:text-2xl text-gray-600 leading-relaxed max-w-lg'>
                    {config.hero_subtitulo}
                  </p>
                </div>

                <div className='flex flex-wrap gap-4'>
                  <Button
                    asChild
                    size='lg'
                    className='h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
                    style={{ backgroundColor: branding.color_primario }}
                  >
                    <Link href='/registro'>{config.hero_cta_principal}</Link>
                  </Button>
                  {config.hero_cta_secundario && (
                    <Button
                      asChild
                      variant='outline'
                      size='lg'
                      className='h-14 px-8 text-lg rounded-full border-2 hover:bg-gray-50 transition-colors'
                      style={{ color: safeColorSecundario, borderColor: safeColorSecundario }}
                    >
                      <Link href='/login'>{config.hero_cta_secundario}</Link>
                    </Button>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className='order-1 md:order-2 relative'
              >
                <div className="relative">
                  {/* Abstract Shapes behind image using multiple brand colors */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 animate-bounce"
                    style={{ backgroundColor: safeColorAcento, animationDuration: '3s' }} />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-20 animate-bounce"
                    style={{ backgroundColor: safeColorSecundario, animationDuration: '4s', animationDelay: '1s' }} />

                  <div className='relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50 bg-white rotate-2 hover:rotate-0 transition-transform duration-500'>
                    <div className='aspect-[4/5] relative'>
                      <Image
                        src={config.hero_imagen_url || '/gente-de-negocios-dandose-la-mano-para-saludar.webp'}
                        alt={config.hero_titulo_principal || `Imagen destacada de ${displayBrandName}`}
                        fill
                        className='object-cover'
                        sizes='(max-width: 768px) 100vw, 50vw'
                        priority={true}
                        quality={95}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[60px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* Servicios / Soluciones */}
      <section
        className='py-20 md:py-32 bg-white relative'
        aria-labelledby="servicios-heading"
      >
        {config.servicios_bg_url && (
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${config.servicios_bg_url})` }} />
        )}

        {/* Decorative elements - Only if secondary is not light, otherwise transparent */}
        {!isLightColor(branding.color_secundario) && (
          <div className="absolute top-0 right-0 w-1/3 h-1/3 opacity-5 bg-gradient-to-bl from-transparent to-transparent pointer-events-none"
            style={{ backgroundImage: `radial-gradient(circle at top right, ${branding.color_secundario}, transparent)` }}
          />
        )}


        <div className='container mx-auto px-4 relative z-10'>
          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={stagger}
            className='text-center max-w-3xl mx-auto mb-16'
          >
            <motion.h2
              variants={fadeInUp}
              id="servicios-heading"
              className='text-3xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900'
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r"
                style={{ backgroundImage: `linear-gradient(to right, ${branding.color_primario}, ${safeColorSecundario})` }}>
                {config.servicios_titulo}
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className='text-xl text-gray-600'>
              {config.servicios_subtitulo}
            </motion.p>
          </motion.div>

          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={stagger}
            className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'
          >
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className='group relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: `0 10px 40px -10px ${safeColorSecundario}30`,
                      border: `1px solid ${safeColorSecundario}40`
                    }}
                  />
                  <div
                    className='w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110'
                    style={{
                      backgroundColor: `${safeColorSecundario}10`,
                      color: safeColorAcento
                    }}
                  >
                    <Icon className='w-7 h-7' />
                  </div>
                  <h3 className='text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors'
                    style={{ color: 'inherit' }}
                  >
                    {service.title}
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    {service.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Beneficios */}
      <section
        className='py-20 md:py-32 relative overflow-hidden bg-gray-50'
      >
        {config.beneficios_bg_url && (
          <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${config.beneficios_bg_url})` }} />
        )}

        {/* Decorative Grid with Secondary Color */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(${safeColorSecundario} 2px, transparent 2px)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-6xl mx-auto'>
            <motion.div
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
              variants={stagger}
              className='grid md:grid-cols-2 gap-16 items-center'
            >
              <div className='order-2 md:order-1'>
                <motion.div variants={fadeInUp} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-white border"
                  style={{
                    borderColor: safeColorAcento,
                    color: safeColorAcento
                  }}
                >
                  Beneficios Exclusivos
                </motion.div>
                <motion.h2 variants={fadeInUp} className='text-3xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900'>
                  {config.beneficios_titulo}
                </motion.h2>
                <motion.p variants={fadeInUp} className='text-xl text-gray-600 mb-8 leading-relaxed'>
                  {config.beneficios_subtitulo}
                </motion.p>

                {/* PREMIUM GRID OF CARDS (Redesign) */}
                <motion.div
                  variants={stagger}
                  className='grid sm:grid-cols-2 gap-4'
                >
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className='flex flex-col p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1'
                      style={{
                        borderTop: `4px solid ${safeColorAcento}`
                      }}
                    >
                      <div className="mb-3 flex justify-between items-start">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-inner"
                          style={{ backgroundColor: `${safeColorAcento}15` }}
                        >
                          <CheckCircle className="w-5 h-5" style={{ color: safeColorAcento }} />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                          <ArrowRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>

                      <span className='text-gray-800 font-bold text-lg leading-tight group-hover:text-gray-900 transition-colors'>
                        {benefit}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Metrics / Visual Side */}
              <div className='order-1 md:order-2 relative'>
                <div className="relative z-10 grid gap-6">
                  {metrics.map((metric, i) => (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 relative overflow-hidden group"
                    >
                      <div className="absolute right-0 top-0 w-24 h-24 opacity-5 rounded-bl-full transition-transform group-hover:scale-110"
                        style={{ backgroundColor: i % 2 === 0 ? branding.color_primario : safeColorSecundario }}
                      />

                      <div className="h-12 w-1.5 rounded-full"
                        style={{ backgroundColor: i % 2 === 0 ? branding.color_primario : safeColorAcento }} />
                      <div>
                        <div className="text-4xl font-extrabold tracking-tight"
                          style={{ color: i % 2 === 0 ? branding.color_primario : safeColorSecundario }}>
                          {metric.value}
                        </div>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                          {metric.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Decorative background blobs - Gradient involving secondary color */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br opacity-30 rounded-full blur-3xl -z-10"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${branding.color_primario}, ${isLightColor(branding.color_secundario) ? '#e5e7eb' : branding.color_secundario}, transparent)`
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section
        className='py-24 md:py-32 relative overflow-hidden bg-white'
      >
        {config.testimonios_bg_url && (
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${config.testimonios_bg_url})` }} />
        )}

        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-7xl mx-auto'>
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block"
              >
                <h2 className='text-3xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight'>
                  {config.testimonios_titulo}
                </h2>
                <div className="h-1.5 w-24 mx-auto rounded-full" style={{ backgroundColor: safeColorAcento }} />
              </motion.div>
            </div>

            <div className='grid md:grid-cols-3 gap-8'>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='bg-gray-50 p-8 rounded-3xl relative hover:bg-white hover:shadow-xl transition-all duration-300 group ring-1 ring-transparent hover:ring-gray-100'
                >
                  <div className="absolute top-8 right-8 text-6xl opacity-20 font-serif leading-none select-none transition-transform group-hover:scale-110 group-hover:opacity-30"
                    style={{ color: safeColorAcento }}>"</div>

                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < (testimonial.rating || 5) ? 'fill-current' : 'text-gray-200'}`}
                        style={{ color: i < (testimonial.rating || 5) ? '#F59E0B' : undefined }}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 text-lg mb-8 leading-relaxed relative z-10 font-medium">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200/50">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md ring-2 ring-offset-2 ring-transparent group-hover:ring-offset-2"
                      style={{
                        backgroundColor: safeColorSecundario,
                        boxShadow: `0 4px 6px -1px ${safeColorSecundario}40`
                      }}
                    >
                      {testimonial.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm" style={{ color: branding.color_primario }}>{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section
        className='py-24 md:py-32 relative overflow-hidden bg-gray-900'
      >
        {config.cta_final_bg_url ? (
          <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: `url(${config.cta_final_bg_url})` }} />
        ) : (
          <div className="absolute inset-0 opacity-20">
            {/* Dynamic background using Secondary Color. If light, use dark gray to preserve Dark Mode feel */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))]"
              style={{
                '--tw-gradient-from': isLightColor(branding.color_secundario) ? '#374151' : branding.color_secundario,
                '--tw-gradient-to': '#111827',
                '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to)`
              } as any}
            />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-gray-900/50 to-gray-900" />

        {/* Glow Effect */}
        <div
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 blur-[100px] rounded-full pointers-events-none'
          style={{ background: `radial-gradient(circle, ${branding.color_primario}, transparent 70%)` }}
        />

        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-4xl mx-auto text-center space-y-10'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className='text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4'>
                {config.cta_final_titulo_1}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  {config.cta_final_titulo_2}
                </span>
              </h2>
              <div className="h-1.5 w-32 bg-white rounded-full mx-auto opacity-20" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light'
            >
              {config.cta_final_subtitulo}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='flex flex-col sm:flex-row gap-6 justify-center pt-8'
            >
              <Button
                asChild
                size='lg'
                className='text-lg px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 border-none'
                style={{ backgroundColor: branding.color_primario }}
              >
                <Link href='/registro'>{config.cta_final_boton_principal}</Link>
              </Button>
              {config.cta_final_boton_secundario && (
                <Button
                  asChild
                  variant='outline'
                  size='lg'
                  className='text-lg px-12 py-8 rounded-full bg-transparent text-white hover:bg-white/10 hover:text-white backdrop-blur-md transition-all'
                  style={{ borderColor: safeColorAcento }}
                >
                  <Link href='/demo'>{config.cta_final_boton_secundario}</Link>
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-950 text-white py-16 border-t border-gray-900'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
            {/* Brand */}
            <div className='col-span-1 md:col-span-1 space-y-4'>
              <div className="flex items-center gap-2">
                <img
                  src={logoSrc}
                  alt={displayBrandName}
                  className='h-8 w-auto object-contain brightness-0 invert opacity-90'
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/LogoQronnect.png'
                  }}
                />
                <span className="font-bold text-xl tracking-tight">{displayBrandName}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                La plataforma líder para fidelización de clientes mediante códigos QR. Simple, potente y efectiva.
              </p>
            </div>

            {/* Links 1 */}
            <div>
              <h4 className="font-bold text-white mb-6">Producto</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Características</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integraciones</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <h4 className="font-bold text-white mb-6">Empresa</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Carreras</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/terminos" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-900 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} {displayBrandName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
