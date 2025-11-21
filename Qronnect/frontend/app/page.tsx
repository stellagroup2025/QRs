'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useBrandingContext } from '@/components/BrandingProvider'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
} from 'lucide-react'

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
  const { branding, loading } = useBrandingContext()

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
      value: '40%',
      label: 'Incremento promedio en retención'
    },
    {
      id: 'businesses',
      value: '10k+',
      label: 'Negocios activos'
    },
    {
      id: 'users',
      value: '500k+',
      label: 'Usuarios registrados'
    }
  ]

  const [activeMetric, setActiveMetric] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [metrics.length])

  const mainMetric = metrics[activeMetric]
  const secondaryMetrics = [
    metrics[(activeMetric + 1) % metrics.length],
    metrics[(activeMetric + 2) % metrics.length]
  ]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('promos:v1')
    }
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className='w-12 h-12 border-4 border-gray-200 border-t-transparent rounded-full'
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
      title: 'Gestión de Clientes',
      description:
        'Sistema completo para gestionar tu base de clientes de forma eficiente y personalizada.'
    },
    {
      icon: Gift,
      title: 'Programa de Fidelización',
      description:
        'Recompensa a tus clientes habituales y aumenta su lealtad con nuestro sistema de puntos.'
    },
    {
      icon: TrendingUp,
      title: 'Análisis y Métricas',
      description:
        'Obtén insights valiosos sobre el comportamiento de tus clientes y optimiza tu negocio.'
    },
    {
      icon: QrCode,
      title: 'Tarjetas Digitales QR',
      description:
        'Olvídate de las tarjetas físicas. Todo digital, fácil y accesible desde el móvil.'
    },
    {
      icon: Shield,
      title: 'Seguridad Garantizada',
      description:
        'Tus datos y los de tus clientes protegidos con los más altos estándares de seguridad.'
    },
    {
      icon: Zap,
      title: 'Rápido y Eficiente',
      description:
        'Implementación inmediata. Empieza a usar el sistema en minutos, no en semanas.'
    }
  ]

  const benefits = [
    'Aumenta la retención de clientes hasta un 40%',
    'Reduce costos operativos eliminando tarjetas físicas',
    'Acceso a métricas en tiempo real',
    'Integración sencilla con tu sistema actual',
    'Soporte técnico incluido',
    'Actualizaciones automáticas sin costo adicional'
  ]

  const testimonials = [
    {
      name: 'María García',
      role: 'Gerente, Boutique Fashion',
      content:
        'Desde que implementamos este sistema, nuestros clientes están más comprometidos y las ventas han aumentado un 35%.',
      rating: 5
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Propietario, Café Central',
      content:
        'La mejor inversión que hemos hecho. Nuestros clientes adoran la comodidad de la tarjeta digital y nosotros ahorramos en impresiones.',
      rating: 5
    },
    {
      name: 'Ana Martínez',
      role: 'Directora, Spa Wellness',
      content:
        'Excelente plataforma. Fácil de usar tanto para nosotros como para nuestros clientes. El soporte es excepcional.',
      rating: 5
    }
  ]

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50'>
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
                  alt={displayBrandName}
                  className='h-14 md:h-16 w-auto object-contain'
                  onError={(e) => {
                    // Evitar bucle infinito de onError
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/LogoQronnect.png'
                  }}
                />

                <div className='space-y-4'>
                  <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
                    <span className='bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent'>
                      Impulsa tu negocio
                    </span>
                    <br />
                    <span style={{ color: branding.color_primario }}>
                      al siguiente nivel
                    </span>
                  </h1>

                  <p className='text-lg md:text-xl text-gray-600 leading-relaxed'>
                    Sistema integral de fidelización y gestión de clientes para
                    negocios modernos.
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-3'>
                  <Button
                    asChild
                    size='lg'
                    className='text-base md:text-lg px-6 md:px-8 py-4 md:py-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5'
                    style={{ backgroundColor: branding.color_primario }}
                  >
                    <Link href='/get-qr' className='flex items-center gap-2'>
                      Solicitar Información
                      <ArrowRight className='w-5 h-5' />
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
                    <Link href='/login'>Acceder</Link>
                  </Button>
                </div>

                <div className='flex items-center gap-6 pt-2'>
                  <div className='flex -space-x-2'>
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
                    <span className='font-semibold text-gray-900'>+10,000</span>{' '}
                    negocios confían en nosotros
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
                    <div className='aspect-square overflow-hidden rounded-2xl flex items-center justify-center'>
                      <img
                        src='/gente-de-negocios-dandose-la-mano-para-saludar.webp'
                        alt='Gente de negocios saludándose'
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          console.error('❌ Error cargando la imagen del HERO')
                          e.currentTarget.style.display = 'none'
                        }}
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
      <section className='py-12 md:py-16 bg-white'>
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
                <span className='text-gray-900'>Soluciones </span>
                <span style={{ color: branding.color_primario }}>
                  completas
                </span>
              </h2>
              <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                Todo lo que necesitas para gestionar y fidelizar a tus clientes
                en una sola plataforma
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className='group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300'
                >
                  <div
                    className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300'
                    style={{ backgroundColor: branding.color_primario }}
                  />
                  <div className='relative'>
                    <div
                      className='w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300'
                      style={{
                        backgroundColor: hexToRgba(branding.color_primario, 0.1)
                      }}
                    >
                      <service.icon
                        className='w-6 h-6'
                        style={{ color: branding.color_primario }}
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
      <section className='py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white'>
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
                    <span className='text-gray-900'>¿Por qué elegirnos?</span>
                  </h2>
                  <p className='text-lg text-gray-600'>
                    Beneficios reales que impactan directamente en tu negocio
                  </p>
                </div>

                <div className='space-y-3'>
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className='flex items-start gap-3 p-3 rounded-xl hover:bg-white transition-colors duración-300'
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
                <div
                  className='absolute -inset-3 rounded-3xl blur-2xl opacity-20'
                  style={{ backgroundColor: branding.color_primario }}
                />
                <div className='relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100 shadow-xl'>
                  <AnimatePresence mode='wait'>
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
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className='py-12 md:py-16 bg-white'>
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
                <span className='text-gray-900'>Lo que dicen </span>
                <span style={{ color: branding.color_primario }}>
                  nuestros clientes
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
                >
                  <div className='flex gap-1 mb-4'>
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className='w-4 h-4 fill-current'
                        style={{ color: branding.color_primario }}
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
      <section className='py-12 md:py-16 relative overflow-hidden'>
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
              <span className='text-gray-900'>¿Listo para transformar </span>
              <br />
              <span style={{ color: branding.color_primario }}>
                tu negocio?
              </span>
            </h2>
            <p className='text-lg md:text-xl text-gray-600 max-w-2xl mx-auto'>
              Únete a miles de negocios que ya están revolucionando la forma de
              gestionar sus clientes
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center pt-2'>
              <Button
                asChild
                size='lg'
                className='text-base md:text-lg px-8 md:px-10 py-4 md:py-5 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1'
                style={{ backgroundColor: branding.color_primario }}
              >
                <Link href='/get-qr' className='flex items-center gap-2'>
                  Comenzar ahora
                  <ArrowRight className='w-5 h-5' />
                </Link>
              </Button>
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
                <Link href='/login'>Ya tengo cuenta</Link>
              </Button>
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
