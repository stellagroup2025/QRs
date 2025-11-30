'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  QrCode,
  Zap,
  Users,
  TrendingUp,
  Check,
  Star,
  ArrowRight,
  ShoppingBag,
  Utensils,
  Scissors,
  Coffee,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Shield,
  Lock,
  Award,
  Smartphone,
  BarChart3,
  MessageSquare,
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

/**
 * Componente para animar números con count-up
 */
function CountUpNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return

    const increment = target / (duration / 16) // 60fps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [target, duration, hasStarted])

  // Trigger cuando el componente es visible
  useEffect(() => {
    setHasStarted(true)
  }, [])

  return <span>{count}</span>
}

export function ProductLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showNav, setShowNav] = useState(false)
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)

  // Detectar scroll para mostrar sticky nav y floating CTA
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowNav(scrollY > 100)
      // Mostrar floating CTA después de hero section (aprox 600px)
      // Ocultarlo en la sección de CTA final
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const isNearBottom = scrollY + windowHeight > documentHeight - 800
      setShowFloatingCTA(scrollY > 600 && !isNearBottom)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className='min-h-screen bg-white'>
      {/* Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: showNav ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm'
      >
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-2'>
              <img
                src='/LogoQronnect.png'
                alt='Qronnect'
                className='h-8 w-auto'
              />
            </div>

            <div className='hidden md:flex items-center gap-6'>
              <a href='#demo' className='text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors'>
                Cómo Funciona
              </a>
              <a href='#pricing' className='text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors'>
                Precios
              </a>
              <a href='#faq' className='text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors'>
                FAQ
              </a>
              <Button asChild size='sm' className='bg-blue-600 hover:bg-blue-700 text-white'>
                <Link href='/get-qr'>
                  Empezar Gratis
                </Link>
              </Button>
            </div>

            {/* Mobile CTA */}
            <div className='md:hidden'>
              <Button asChild size='sm' className='bg-blue-600 hover:bg-blue-700 text-white'>
                <Link href='/get-qr'>
                  Empezar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>

      {/* Hero Section */}
      <section
        id="main-content"
        className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      >
        <div className='absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]' />

        <div className='relative container mx-auto px-4 py-16 md:py-24'>
          <div className='max-w-7xl mx-auto'>
            <div className='grid lg:grid-cols-2 gap-12 items-center'>
              {/* Left Column */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className='space-y-8'
              >
                {/* Badge de novedad */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className='inline-flex'
                >
                  <div className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-full shadow-sm hover:shadow-md transition-shadow'>
                    <span className='relative flex h-3 w-3'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                      <span className='relative inline-flex rounded-full h-3 w-3 bg-blue-500'></span>
                    </span>
                    <span className='text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                      🚀 Nuevo: IA Generativa para campañas automáticas
                    </span>
                  </div>
                </motion.div>

                {/* Logo */}
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src='/LogoQronnect.png'
                  alt='Qronnect - Fidelización Inteligente'
                  className='h-16 md:h-20 w-auto object-contain'
                />

                {/* Headline */}
                <div className='space-y-4'>
                  <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
                    <span className='bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                      Convierte Clientes Ocasionales en
                    </span>
                    <br />
                    <span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                      Fans Leales
                    </span>
                  </h1>

                  <p className='text-xl md:text-2xl text-gray-600 leading-relaxed'>
                    Programa de fidelización con QR<br />
                    <span className='font-semibold text-gray-800'>Sin app. Sin complicaciones. Resultados en 30 días.</span>
                  </p>
                </div>

                {/* Stats */}
                <div className='grid grid-cols-3 gap-4 pt-4'>
                  <div className='text-center'>
                    <div className='text-3xl md:text-4xl font-bold text-blue-600'>500+</div>
                    <div className='text-sm text-gray-600'>Comercios</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl md:text-4xl font-bold text-blue-600'>50K+</div>
                    <div className='text-sm text-gray-600'>Clientes</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl md:text-4xl font-bold text-blue-600'>98%</div>
                    <div className='text-sm text-gray-600'>Satisfacción</div>
                  </div>
                </div>

                {/* CTAs */}
                <div className='flex flex-col sm:flex-row gap-4 pt-2'>
                  <Button
                    asChild
                    size='lg'
                    className='text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all'
                  >
                    <Link href='/get-qr' className='flex items-center gap-2'>
                      Empezar Gratis
                      <ArrowRight className='w-5 h-5' />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size='lg'
                    variant='outline'
                    className='text-lg px-8 py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                  >
                    <Link href='#demo'>
                      Ver Demo
                    </Link>
                  </Button>
                </div>

                {/* Trust Badge */}
                <div className='flex items-center gap-2 text-sm text-gray-600 pt-2'>
                  <Check className='w-5 h-5 text-green-500' />
                  <span>Sin tarjeta de crédito • Setup en 15 minutos</span>
                </div>
              </motion.div>

              {/* Right Column - Visual */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className='hidden lg:block'
              >
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl blur-3xl opacity-20' />
                  <div className='relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100'>
                    <div className='space-y-6'>
                      {/* Mock Dashboard Preview */}
                      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6'>
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center'>
                            <QrCode className='w-6 h-6 text-white' />
                          </div>
                          <div>
                            <div className='font-bold text-gray-900'>Tu Código QR</div>
                            <div className='text-sm text-gray-600'>Listo para usar</div>
                          </div>
                        </div>
                        <div className='aspect-square bg-white rounded-xl flex items-center justify-center'>
                          <QrCode className='w-32 h-32 text-blue-600' />
                        </div>
                      </div>

                      {/* Stats Preview */}
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='bg-green-50 rounded-xl p-4'>
                          <div className='text-2xl font-bold text-green-600'>+35%</div>
                          <div className='text-xs text-gray-600'>Visitas recurrentes</div>
                        </div>
                        <div className='bg-purple-50 rounded-xl p-4'>
                          <div className='text-2xl font-bold text-purple-600'>+28%</div>
                          <div className='text-xs text-gray-600'>Ticket medio</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Bar - Trust */}
      <section className='py-8 bg-gray-50 border-y border-gray-200'>
        <div className='container mx-auto px-4'>
          <p className='text-center text-sm text-gray-600 mb-6'>Confiado por comercios líderes en España</p>
          <div className='flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60'>
            {['Retail', 'Restaurantes', 'Salones', 'Cafeterías', 'Servicios'].map((type) => (
              <div key={type} className='text-2xl font-bold text-gray-400'>
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="demo" className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={stagger}
            className='max-w-6xl mx-auto'
          >
            <motion.div variants={fadeInUp} className='text-center mb-16'>
              <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                <span className='text-gray-900'>Así de </span>
                <span className='text-blue-600'>Simple</span>
              </h2>
              <p className='text-xl text-gray-600'>
                Tu programa de fidelización funcionando en 4 pasos
              </p>
            </motion.div>

            <div className='grid md:grid-cols-4 gap-8'>
              {[
                {
                  step: '1',
                  icon: QrCode,
                  title: 'Cliente Escanea',
                  description: 'Tu cliente escanea el código QR en tu local'
                },
                {
                  step: '2',
                  icon: Smartphone,
                  title: 'Registro Rápido',
                  description: 'Se registra en 30 segundos con email o teléfono'
                },
                {
                  step: '3',
                  icon: TrendingUp,
                  title: 'Acumula Puntos',
                  description: 'Gana puntos automáticamente en cada compra'
                },
                {
                  step: '4',
                  icon: Star,
                  title: 'Canjea Recompensas',
                  description: 'Usa sus puntos para obtener premios y descuentos'
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className='relative'
                >
                  <div className='text-center space-y-4'>
                    <div className='relative inline-block'>
                      <div className='w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto'>
                        <item.icon className='w-8 h-8 text-blue-600' />
                      </div>
                      <div className='absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm'>
                        {item.step}
                      </div>
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900'>{item.title}</h3>
                    <p className='text-gray-600 text-sm'>{item.description}</p>
                  </div>
                  {index < 3 && (
                    <div className='hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -ml-4' />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Casos de Uso */}
      <section className='py-20 bg-gradient-to-b from-gray-50 to-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                <span className='text-gray-900'>Perfecto para </span>
                <span className='text-blue-600'>Tu Negocio</span>
              </h2>
              <p className='text-xl text-gray-600'>
                Soluciones específicas para cada industria
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {[
                {
                  icon: Utensils,
                  industry: 'Restaurantes',
                  benefit: 'Más visitas, mayor ticket medio',
                  stat: '+40% clientes recurrentes',
                  color: 'from-orange-500 to-red-500'
                },
                {
                  icon: ShoppingBag,
                  industry: 'Retail',
                  benefit: 'Fidelización sin complicaciones',
                  stat: '+35% ventas repetidas',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: Scissors,
                  industry: 'Salones & Spas',
                  benefit: 'Reservas garantizadas',
                  stat: '+50% retención',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Coffee,
                  industry: 'Cafeterías',
                  benefit: 'Clientes diarios fieles',
                  stat: '+60% frecuencia visitas',
                  color: 'from-amber-500 to-yellow-500'
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100'
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className='w-7 h-7 text-white' />
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>{item.industry}</h3>
                  <p className='text-gray-600 text-sm mb-3'>{item.benefit}</p>
                  <div className='pt-3 border-t border-gray-100'>
                    <span className='text-blue-600 font-semibold text-sm'>{item.stat}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROI y Beneficios Numéricos */}
      <section className='py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden'>
        {/* Background decorativo */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl'></div>
        </div>

        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl md:text-5xl font-bold mb-4 text-white'>
                Resultados Medibles desde el Día 1
              </h2>
              <p className='text-xl text-blue-100'>
                Datos reales de comercios usando Qronnect
              </p>
            </div>

            {/* Grid de métricas principales */}
            <div className='grid md:grid-cols-4 gap-6 mb-12'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all'
              >
                <div className='text-5xl font-bold text-white mb-2'>+42%</div>
                <div className='text-blue-100 font-medium'>Visitas Repetidas</div>
                <div className='text-sm text-blue-200 mt-2'>vs clientes sin programa</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all'
              >
                <div className='text-5xl font-bold text-white mb-2'>3.5x</div>
                <div className='text-blue-100 font-medium'>ROI Promedio</div>
                <div className='text-sm text-blue-200 mt-2'>primer año de uso</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all'
              >
                <div className='text-5xl font-bold text-white mb-2'>€2,400</div>
                <div className='text-blue-100 font-medium'>Ingresos Extra/Mes</div>
                <div className='text-sm text-blue-200 mt-2'>promedio restaurante</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all'
              >
                <div className='text-5xl font-bold text-white mb-2'>15min</div>
                <div className='text-blue-100 font-medium'>Setup Completo</div>
                <div className='text-sm text-blue-200 mt-2'>y listo para usar</div>
              </motion.div>
            </div>

            {/* Calculadora de ROI simplificada */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='bg-white rounded-2xl p-8 shadow-2xl'
            >
              <div className='text-center mb-6'>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                  Calcula tu ROI Estimado
                </h3>
                <p className='text-gray-600'>
                  Resultados conservadores basados en promedios del sector
                </p>
              </div>

              <div className='grid md:grid-cols-3 gap-6'>
                {/* Input simulado */}
                <div className='bg-gray-50 rounded-xl p-6 border-2 border-gray-200'>
                  <div className='text-sm font-semibold text-gray-600 mb-2'>Clientes/Mes</div>
                  <div className='text-4xl font-bold text-gray-900 mb-1'>500</div>
                  <div className='text-xs text-gray-500'>clientes actuales</div>
                </div>

                <div className='bg-gray-50 rounded-xl p-6 border-2 border-gray-200'>
                  <div className='text-sm font-semibold text-gray-600 mb-2'>Ticket Medio</div>
                  <div className='text-4xl font-bold text-gray-900 mb-1'>€25</div>
                  <div className='text-xs text-gray-500'>gasto promedio</div>
                </div>

                <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 border-2 border-green-400 shadow-lg'>
                  <div className='text-sm font-semibold text-green-100 mb-2'>Ingresos Extra/Mes</div>
                  <div className='text-4xl font-bold text-white mb-1'>€2,100</div>
                  <div className='text-xs text-green-100'>con +42% retención</div>
                </div>
              </div>

              <div className='mt-6 pt-6 border-t border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Inversión mensual en Qronnect</p>
                    <p className='text-2xl font-bold text-gray-900'>€29/mes</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-gray-600'>Tu ROI estimado</p>
                    <p className='text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
                      7,141%
                    </p>
                  </div>
                </div>
              </div>

              <div className='mt-6 text-center'>
                <Button
                  size='lg'
                  className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all'
                  onClick={() => {
                    const element = document.getElementById('pricing')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Ver Planes y Precios
                </Button>
                <p className='text-xs text-gray-500 mt-2'>
                  * Cálculo basado en estadísticas reales de clientes. Resultados individuales pueden variar.
                </p>
              </div>
            </motion.div>

            {/* Testimonios de métricas */}
            <div className='grid md:grid-cols-3 gap-6 mt-12'>
              <div className='text-center'>
                <div className='text-3xl mb-2'>📈</div>
                <p className='text-blue-100 text-sm'>
                  <span className='font-bold text-white'>"Recuperamos el 38%</span> de clientes inactivos con las campañas automáticas"
                </p>
                <p className='text-blue-200 text-xs mt-2'>- Restaurante La Taberna</p>
              </div>

              <div className='text-center'>
                <div className='text-3xl mb-2'>💰</div>
                <p className='text-blue-100 text-sm'>
                  <span className='font-bold text-white'>"€3,200 extra/mes</span> solo con promociones dirigidas a clientes VIP"
                </p>
                <p className='text-blue-200 text-xs mt-2'>- Boutique Moda Clara</p>
              </div>

              <div className='text-center'>
                <div className='text-3xl mb-2'>⚡</div>
                <p className='text-blue-100 text-sm'>
                  <span className='font-bold text-white'>"Setup en 12 minutos.</span> Primer cliente registrado a los 5 minutos"
                </p>
                <p className='text-blue-200 text-xs mt-2'>- Cafetería Espresso</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características Destacadas */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                <span className='text-gray-900'>Todo lo que </span>
                <span className='text-blue-600'>Necesitas</span>
              </h2>
            </div>

            <div className='grid md:grid-cols-3 gap-8'>
              {[
                {
                  icon: Zap,
                  title: 'Setup Instantáneo',
                  description: 'Configura tu programa en 15 minutos. Sin instalaciones complicadas.'
                },
                {
                  icon: MessageSquare,
                  title: 'Campañas Automáticas',
                  description: 'Email y SMS automáticos para recuperar clientes inactivos.'
                },
                {
                  icon: BarChart3,
                  title: 'Analytics en Tiempo Real',
                  description: 'Métricas claras de retención, engagement y ROI.'
                },
                {
                  icon: Users,
                  title: 'Sin App Necesaria',
                  description: 'Tus clientes no instalan nada. Todo funciona desde el navegador.'
                },
                {
                  icon: Shield,
                  title: 'Seguro y Confiable',
                  description: 'GDPR compliant. Datos encriptados en servidores EU.'
                },
                {
                  icon: Smartphone,
                  title: 'Multi-dispositivo',
                  description: 'Funciona perfectamente en móvil, tablet y desktop.'
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className='space-y-3'
                >
                  <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                    <feature.icon className='w-6 h-6 text-blue-600' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900'>{feature.title}</h3>
                  <p className='text-gray-600'>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integraciones */}
      <section className='py-20 bg-white border-y border-gray-100'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                <span className='text-gray-900'>Se integra con </span>
                <span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                  tus herramientas
                </span>
              </h2>
              <p className='text-xl text-gray-600'>
                Conecta Qronnect con las plataformas que ya usas
              </p>
            </div>

            {/* Grid de logos de integraciones */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12'>
              {/* Stripe */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className='bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center hover:border-blue-400 hover:shadow-lg transition-all group'
              >
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#635BFF] group-hover:scale-110 transition-transform'>
                    Stripe
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>Pagos</p>
                </div>
              </motion.div>

              {/* Shopify */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className='bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center hover:border-green-400 hover:shadow-lg transition-all group'
              >
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#96bf48] group-hover:scale-110 transition-transform'>
                    Shopify
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>E-commerce</p>
                </div>
              </motion.div>

              {/* WooCommerce */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className='bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center hover:border-purple-400 hover:shadow-lg transition-all group'
              >
                <div className='text-center'>
                  <div className='text-3xl font-bold text-[#96588a] group-hover:scale-110 transition-transform'>
                    WooCommerce
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>WordPress</p>
                </div>
              </motion.div>

              {/* Square */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className='bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center hover:border-blue-400 hover:shadow-lg transition-all group'
              >
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#3E4348] group-hover:scale-110 transition-transform'>
                    Square
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>POS</p>
                </div>
              </motion.div>

              {/* Mailchimp */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className='bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center hover:border-yellow-400 hover:shadow-lg transition-all group'
              >
                <div className='text-center'>
                  <div className='text-3xl font-bold text-[#FFE01B] group-hover:scale-110 transition-transform'>
                    🐵
                  </div>
                  <div className='text-lg font-bold text-gray-800 mt-1'>Mailchimp</div>
                  <p className='text-xs text-gray-500 mt-1'>Email</p>
                </div>
              </motion.div>

              {/* Zapier */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className='bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center hover:border-orange-400 hover:shadow-lg transition-all group'
              >
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#FF4A00] group-hover:scale-110 transition-transform'>
                    Zapier
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>Automatización</p>
                </div>
              </motion.div>

              {/* Google Analytics */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className='bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center hover:border-blue-400 hover:shadow-lg transition-all group'
              >
                <div className='text-center'>
                  <div className='text-3xl font-bold text-[#E37400] group-hover:scale-110 transition-transform'>
                    📊
                  </div>
                  <div className='text-lg font-bold text-gray-800 mt-1'>Analytics</div>
                  <p className='text-xs text-gray-500 mt-1'>Métricas</p>
                </div>
              </motion.div>

              {/* WhatsApp Business */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className='bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center hover:border-green-400 hover:shadow-lg transition-all group'
              >
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#25D366] group-hover:scale-110 transition-transform'>
                    WhatsApp
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>Mensajería</p>
                </div>
              </motion.div>

              {/* Meta (Facebook/Instagram) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
                className='bg-white border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center hover:border-blue-400 hover:shadow-lg transition-all group'
              >
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#0668E1] group-hover:scale-110 transition-transform'>
                    Meta
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>Social Media</p>
                </div>
              </motion.div>

              {/* Más integraciones */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0 }}
                className='bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center hover:border-blue-400 hover:shadow-lg transition-all'
              >
                <div className='text-center'>
                  <div className='text-3xl mb-2'>✨</div>
                  <p className='text-sm font-semibold text-gray-700'>Y muchas más...</p>
                  <p className='text-xs text-gray-500 mt-1'>API disponible</p>
                </div>
              </motion.div>
            </div>

            {/* CTA de integraciones */}
            <div className='text-center'>
              <p className='text-gray-600 mb-4'>
                ¿Usas otra herramienta? Nuestra API REST permite integraciones personalizadas
              </p>
              <Button
                variant='outline'
                size='lg'
                onClick={() => (window.location.href = 'mailto:soporte@qronnect.com?subject=Consulta sobre integraciones')}
                className='border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
              >
                Consultar Integraciones
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className='py-20 bg-gradient-to-b from-gray-50 to-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                <span className='text-gray-900'>Precios </span>
                <span className='text-blue-600'>Transparentes</span>
              </h2>
              <p className='text-xl text-gray-600'>
                Sin costes ocultos. Cancela cuando quieras.
              </p>
            </div>

            <div className='grid md:grid-cols-3 gap-8'>
              {/* Starter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className='bg-white rounded-2xl p-8 shadow-lg border border-gray-200'
              >
                <div className='mb-6'>
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>Starter</h3>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-4xl font-bold text-gray-900'>Gratis</span>
                  </div>
                  <p className='text-gray-600 mt-2'>Perfecto para empezar</p>
                </div>

                <ul className='space-y-4 mb-8'>
                  {[
                    'Hasta 100 clientes',
                    'QR ilimitado',
                    'Email básico',
                    'Dashboard básico',
                    'Soporte por email',
                  ].map((feature, i) => (
                    <li key={i} className='flex items-start gap-3'>
                      <Check className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                      <span className='text-gray-700'>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className='w-full bg-gray-900 hover:bg-gray-800'>
                  <Link href='/get-qr'>Empezar Gratis</Link>
                </Button>
              </motion.div>

              {/* Professional - DESTACADO */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className='bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-2xl transform scale-105 relative'
              >
                <div className='absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-2xl rounded-tr-2xl text-sm font-semibold'>
                  Popular
                </div>

                <div className='mb-6'>
                  <h3 className='text-2xl font-bold text-white mb-2'>Professional</h3>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-4xl font-bold text-white'>29€</span>
                    <span className='text-white/80'>/mes</span>
                  </div>
                  <p className='text-white/90 mt-2'>Para negocios en crecimiento</p>
                </div>

                <ul className='space-y-4 mb-8'>
                  {[
                    'Clientes ilimitados',
                    'SMS + Email',
                    'Analytics avanzados',
                    'Promociones personalizadas',
                    'Integraciones API',
                    'Soporte prioritario',
                  ].map((feature, i) => (
                    <li key={i} className='flex items-start gap-3'>
                      <Check className='w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5' />
                      <span className='text-white'>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className='w-full bg-white text-blue-600 hover:bg-gray-50'>
                  <Link href='/get-qr?plan=professional'>Empezar Ahora</Link>
                </Button>
              </motion.div>

              {/* Enterprise */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className='bg-white rounded-2xl p-8 shadow-lg border border-gray-200'
              >
                <div className='mb-6'>
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>Enterprise</h3>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-4xl font-bold text-gray-900'>Custom</span>
                  </div>
                  <p className='text-gray-600 mt-2'>Para cadenas y franquicias</p>
                </div>

                <ul className='space-y-4 mb-8'>
                  {[
                    'Multi-tienda',
                    'White label',
                    'API dedicada',
                    'Integraciones custom',
                    'Account manager',
                    'SLA 99.9%',
                  ].map((feature, i) => (
                    <li key={i} className='flex items-start gap-3'>
                      <Check className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                      <span className='text-gray-700'>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant='outline' className='w-full border-2 border-blue-600 text-blue-600'>
                  <Link href='mailto:sales@qronnect.com'>Contactar Ventas</Link>
                </Button>
              </motion.div>
            </div>

            {/* Tabla Comparativa */}
            <div className='mt-16'>
              <h3 className='text-2xl font-bold text-center mb-8 text-gray-900'>
                Comparativa Detallada
              </h3>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse bg-white rounded-xl overflow-hidden shadow-lg'>
                  <thead>
                    <tr className='bg-gray-50'>
                      <th className='text-left p-4 font-semibold text-gray-900'>Característica</th>
                      <th className='text-center p-4 font-semibold text-gray-900'>Starter</th>
                      <th className='text-center p-4 font-semibold bg-blue-50 text-blue-900'>Professional</th>
                      <th className='text-center p-4 font-semibold text-gray-900'>Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    <tr>
                      <td className='p-4 text-gray-700'>Clientes activos</td>
                      <td className='p-4 text-center text-gray-600'>100</td>
                      <td className='p-4 text-center bg-blue-50 font-semibold text-blue-900'>Ilimitados</td>
                      <td className='p-4 text-center font-semibold text-gray-900'>Ilimitados</td>
                    </tr>
                    <tr>
                      <td className='p-4 text-gray-700'>Códigos QR</td>
                      <td className='p-4 text-center'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                      <td className='p-4 text-center bg-blue-50'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                      <td className='p-4 text-center'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                    </tr>
                    <tr>
                      <td className='p-4 text-gray-700'>Campañas Email</td>
                      <td className='p-4 text-center text-gray-600'>Básico</td>
                      <td className='p-4 text-center bg-blue-50'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                      <td className='p-4 text-center'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                    </tr>
                    <tr>
                      <td className='p-4 text-gray-700'>Campañas SMS</td>
                      <td className='p-4 text-center text-gray-400'>—</td>
                      <td className='p-4 text-center bg-blue-50'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                      <td className='p-4 text-center'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                    </tr>
                    <tr>
                      <td className='p-4 text-gray-700'>Analytics</td>
                      <td className='p-4 text-center text-gray-600'>Básico</td>
                      <td className='p-4 text-center bg-blue-50 text-blue-900 font-semibold'>Avanzado</td>
                      <td className='p-4 text-center text-gray-900 font-semibold'>Avanzado + Custom</td>
                    </tr>
                    <tr>
                      <td className='p-4 text-gray-700'>Integraciones API</td>
                      <td className='p-4 text-center text-gray-400'>—</td>
                      <td className='p-4 text-center bg-blue-50'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                      <td className='p-4 text-center'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                    </tr>
                    <tr>
                      <td className='p-4 text-gray-700'>Multi-tienda</td>
                      <td className='p-4 text-center text-gray-400'>—</td>
                      <td className='p-4 text-center bg-blue-50 text-gray-400'>—</td>
                      <td className='p-4 text-center'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                    </tr>
                    <tr>
                      <td className='p-4 text-gray-700'>White Label</td>
                      <td className='p-4 text-center text-gray-400'>—</td>
                      <td className='p-4 text-center bg-blue-50 text-gray-400'>—</td>
                      <td className='p-4 text-center'><Check className='w-5 h-5 text-green-500 mx-auto' /></td>
                    </tr>
                    <tr>
                      <td className='p-4 text-gray-700'>Soporte</td>
                      <td className='p-4 text-center text-gray-600'>Email</td>
                      <td className='p-4 text-center bg-blue-50 text-blue-900 font-semibold'>Email + Chat</td>
                      <td className='p-4 text-center text-gray-900 font-semibold'>Dedicado</td>
                    </tr>
                    <tr>
                      <td className='p-4 text-gray-700'>SLA</td>
                      <td className='p-4 text-center text-gray-600'>99%</td>
                      <td className='p-4 text-center bg-blue-50 text-gray-600'>99.5%</td>
                      <td className='p-4 text-center text-gray-900 font-semibold'>99.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trust badges debajo de pricing */}
            <div className='mt-16 pt-12 border-t border-gray-200'>
              <div className='flex flex-wrap justify-center items-center gap-8'>
                <div className='flex items-center gap-2 text-gray-600'>
                  <Shield className='w-6 h-6 text-green-500' />
                  <span className='font-medium'>GDPR Compliant</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600'>
                  <Lock className='w-6 h-6 text-blue-500' />
                  <span className='font-medium'>SSL Encriptado</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600'>
                  <Award className='w-6 h-6 text-purple-500' />
                  <span className='font-medium'>Datos en EU</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                <span className='text-gray-900'>Historias de </span>
                <span className='text-blue-600'>Éxito</span>
              </h2>
            </div>

            <div className='grid md:grid-cols-3 gap-8'>
              {[
                {
                  name: 'María González',
                  role: 'Propietaria, Café Central',
                  location: 'Madrid',
                  content: 'Aumentamos las visitas recurrentes un 40% en solo 3 meses. Nuestros clientes adoran lo fácil que es acumular puntos.',
                  rating: 5,
                  avatar: 'MG'
                },
                {
                  name: 'Carlos Ruiz',
                  role: 'Gerente, Boutique Fashion',
                  location: 'Barcelona',
                  content: 'Qronnect nos ayudó a duplicar nuestra base de clientes leales. El sistema de promociones es increíblemente potente.',
                  rating: 5,
                  avatar: 'CR'
                },
                {
                  name: 'Laura Martín',
                  role: 'Dueña, Salón de Belleza Elite',
                  location: 'Valencia',
                  content: 'Setup súper rápido y los clientes se registran sin problemas. El ROI fue positivo desde el primer mes.',
                  rating: 5,
                  avatar: 'LM'
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className='bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100'
                >
                  <div className='flex gap-1 mb-4'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className='w-5 h-5 fill-yellow-400 text-yellow-400' />
                    ))}
                  </div>

                  <p className='text-gray-700 mb-6 italic'>"{testimonial.content}"</p>

                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold'>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>{testimonial.name}</div>
                      <div className='text-sm text-gray-600'>{testimonial.role}</div>
                      <div className='text-xs text-gray-500'>{testimonial.location}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className='py-20 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                <span className='text-gray-900'>Preguntas </span>
                <span className='text-blue-600'>Frecuentes</span>
              </h2>
            </div>

            <div className='space-y-4'>
              {[
                {
                  question: '¿Necesito una app móvil?',
                  answer: 'No. Todo funciona desde el navegador web. Tus clientes solo necesitan escanear el QR y ya pueden empezar a acumular puntos.'
                },
                {
                  question: '¿Cuánto tiempo tarda el setup?',
                  answer: 'Aproximadamente 15 minutos. Configuras tu branding, sistema de puntos, y listo. No requiere conocimientos técnicos.'
                },
                {
                  question: '¿Puedo cancelar en cualquier momento?',
                  answer: 'Sí, sin penalizaciones ni costes ocultos. Si cancelas, mantienes acceso hasta el final del período pagado.'
                },
                {
                  question: '¿Qué métodos de pago aceptan?',
                  answer: 'Tarjeta de crédito/débito, transferencia bancaria, y PayPal. Facturación mensual o anual (con 2 meses gratis).'
                },
                {
                  question: '¿Los datos están seguros?',
                  answer: 'Absolutamente. Cumplimos GDPR, datos encriptados, servidores en EU, y auditorías regulares de seguridad.'
                },
                {
                  question: '¿Ofrecen soporte en español?',
                  answer: 'Sí, soporte completo en español por email, chat y teléfono. Tiempo de respuesta < 2 horas en plan Professional.'
                },
              ].map((faq, index) => (
                <div key={index} className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className='w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors'
                  >
                    <span className='font-semibold text-gray-900 pr-4'>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                        openFaq === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className='px-6 pb-6 text-gray-600'>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className='py-20 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'>
        <div className='absolute inset-0 bg-grid-white/10' />

        {/* Elementos decorativos animados */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse'></div>
          <div className='absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse'></div>
        </div>

        <div className='relative container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center space-y-8'>
            {/* Badge de usuarios activos */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className='inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 shadow-xl'
            >
              <div className='flex -space-x-2'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white flex items-center justify-center text-xs font-bold'>
                  👤
                </div>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white flex items-center justify-center text-xs font-bold'>
                  👤
                </div>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white flex items-center justify-center text-xs font-bold'>
                  👤
                </div>
              </div>
              <div className='text-left'>
                <div className='flex items-center gap-2'>
                  <span className='relative flex h-2 w-2'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-2 w-2 bg-green-500'></span>
                  </span>
                  <span className='text-sm font-bold text-white'>
                    <CountUpNumber target={523} /> comercios activos
                  </span>
                </div>
                <p className='text-xs text-white/70'>+18 nuevos esta semana</p>
              </div>
            </motion.div>

            <h2 className='text-4xl md:text-5xl font-bold text-white'>
              ¿Listo para Transformar tu Negocio?
            </h2>

            <p className='text-xl text-white/90 max-w-2xl mx-auto'>
              Únete a <span className='font-bold text-white'><CountUpNumber target={523} />+ comercios</span> que ya están aumentando sus ventas con Qronnect
            </p>

            {/* Stats rápidos */}
            <div className='grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-4'>
              <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
                <div className='text-3xl font-bold text-white mb-1'>
                  <CountUpNumber target={52} />K+
                </div>
                <div className='text-sm text-white/80'>Clientes Activos</div>
              </div>
              <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
                <div className='text-3xl font-bold text-white mb-1'>98%</div>
                <div className='text-sm text-white/80'>Satisfacción</div>
              </div>
              <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
                <div className='text-3xl font-bold text-white mb-1'>3.5x</div>
                <div className='text-sm text-white/80'>ROI Promedio</div>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 justify-center pt-4'>
              <Button
                asChild
                size='lg'
                className='text-lg px-10 py-6 bg-white text-blue-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl transition-all hover:scale-105'
              >
                <Link href='/get-qr' className='flex items-center gap-2'>
                  Empezar Gratis Ahora
                  <ArrowRight className='w-5 h-5' />
                </Link>
              </Button>

              <Button
                asChild
                size='lg'
                variant='outline'
                className='text-lg px-10 py-6 border-2 border-white text-white hover:bg-white/10 transition-all'
              >
                <Link href='mailto:sales@qronnect.com'>
                  Hablar con Ventas
                </Link>
              </Button>
            </div>

            <p className='text-white/80 text-sm pt-4'>
              ✓ Sin tarjeta de crédito • ✓ Setup en 15 minutos • ✓ Cancela cuando quieras
            </p>

            {/* Urgencia sutil */}
            <div className='inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-full px-4 py-2 mt-4'>
              <span className='text-yellow-300 text-sm'>⚡</span>
              <span className='text-sm text-yellow-100 font-medium'>
                Oferta de lanzamiento: 3 meses gratis en plan Professional
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12'>
              {/* Brand */}
              <div className='space-y-4'>
                <img
                  src='/LogoQronnect.png'
                  alt='Qronnect'
                  className='h-10 w-auto object-contain brightness-0 invert'
                />
                <p className='text-gray-400 text-sm'>
                  Fidelización inteligente para tu negocio
                </p>
              </div>

              {/* Producto */}
              <div>
                <h3 className='font-semibold mb-4 text-white'>Producto</h3>
                <ul className='space-y-3 text-gray-400 text-sm'>
                  <li><Link href='#' className='hover:text-white transition-colors'>Características</Link></li>
                  <li><Link href='#pricing' className='hover:text-white transition-colors'>Precios</Link></li>
                  <li><Link href='#demo' className='hover:text-white transition-colors'>Demo</Link></li>
                  <li><Link href='/get-qr' className='hover:text-white transition-colors'>Empezar</Link></li>
                </ul>
              </div>

              {/* Empresa */}
              <div>
                <h3 className='font-semibold mb-4 text-white'>Empresa</h3>
                <ul className='space-y-3 text-gray-400 text-sm'>
                  <li><Link href='https://stellagroup.es' target='_blank' className='hover:text-white transition-colors'>Sobre StellaGroup</Link></li>
                  <li><Link href='mailto:sales@qronnect.com' className='hover:text-white transition-colors'>Contacto</Link></li>
                  <li><Link href='#' className='hover:text-white transition-colors'>Blog</Link></li>
                  <li><Link href='/admin/login' className='hover:text-white transition-colors'>Admin</Link></li>
                </ul>
              </div>

              {/* Contacto */}
              <div>
                <h3 className='font-semibold mb-4 text-white'>Contacto</h3>
                <ul className='space-y-3 text-gray-400 text-sm'>
                  <li className='flex items-start gap-2'>
                    <Mail className='w-4 h-4 mt-0.5 flex-shrink-0' />
                    <a href='mailto:soporte@qronnect.com' className='hover:text-white transition-colors'>
                      soporte@qronnect.com
                    </a>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Phone className='w-4 h-4 mt-0.5 flex-shrink-0' />
                    <span>+34 900 123 456</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <MapPin className='w-4 h-4 mt-0.5 flex-shrink-0' />
                    <span>Madrid, España</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom */}
            <div className='border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400'>
              <p>
                &copy; {new Date().getFullYear()} Qronnect. Todos los derechos reservados.
              </p>
              <p>
                Desarrollado por{' '}
                <a
                  href='https://stellagroup.es'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-400 hover:text-blue-300 underline'
                >
                  StellaGroup
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating CTA Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: showFloatingCTA ? 1 : 0,
          opacity: showFloatingCTA ? 1 : 0
        }}
        transition={{ duration: 0.3, type: 'spring' }}
        className='fixed bottom-8 right-8 z-40'
      >
        <Button
          asChild
          size='lg'
          className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 px-8 py-6 text-lg'
        >
          <Link href='/get-qr' className='flex items-center gap-2'>
            Empezar Gratis
            <ArrowRight className='w-5 h-5' />
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
