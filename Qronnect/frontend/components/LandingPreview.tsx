'use client'

import {
  Users, Gift, TrendingUp, QrCode, Shield, Zap, Check, Star,
  Heart, CheckCircle, Calendar, Clock, MapPin, Phone, Mail, Globe,
  Award, ThumbsUp, Camera, Video, Music, Smile, ShoppingBag, CreditCard, Truck
} from 'lucide-react'
import { LandingConfig } from '@/hooks/use-landing-config'
import { useBrandingContext } from '@/components/BrandingProvider'

interface LandingPreviewProps {
  config: Partial<LandingConfig>
  deviceType?: 'desktop' | 'tablet' | 'mobile'
}

const DEVICE_SIZES = {
  desktop: { width: '100%', scale: 1 },
  tablet: { width: '768px', scale: 0.8 },
  mobile: { width: '375px', scale: 0.7 },
}

export function LandingPreview({ config, deviceType = 'desktop' }: LandingPreviewProps) {
  const { branding } = useBrandingContext()
  const deviceSize = DEVICE_SIZES[deviceType]

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
      icon: iconMap[config.servicio_1_icono || 'Users'] || Users,
      title: config.servicio_1_titulo || 'Servicio 1',
      description: config.servicio_1_descripcion || 'Descripción del servicio 1',
      active: config.servicio_1_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_2_icono || 'Gift'] || Gift,
      title: config.servicio_2_titulo || 'Servicio 2',
      description: config.servicio_2_descripcion || 'Descripción del servicio 2',
      active: config.servicio_2_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_3_icono || 'TrendingUp'] || TrendingUp,
      title: config.servicio_3_titulo || 'Servicio 3',
      description: config.servicio_3_descripcion || 'Descripción del servicio 3',
      active: config.servicio_3_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_4_icono || 'QrCode'] || QrCode,
      title: config.servicio_4_titulo || 'Servicio 4',
      description: config.servicio_4_descripcion || 'Descripción del servicio 4',
      active: config.servicio_4_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_5_icono || 'Shield'] || Shield,
      title: config.servicio_5_titulo || 'Servicio 5',
      description: config.servicio_5_descripcion || 'Descripción del servicio 5',
      active: config.servicio_5_activo ?? true,
    },
    {
      icon: iconMap[config.servicio_6_icono || 'Zap'] || Zap,
      title: config.servicio_6_titulo || 'Servicio 6',
      description: config.servicio_6_descripcion || 'Descripción del servicio 6',
      active: config.servicio_6_activo ?? true,
    },
  ]

  const benefits = [
    { text: config.beneficio_1, active: config.beneficio_1_activo ?? true },
    { text: config.beneficio_2, active: config.beneficio_2_activo ?? true },
    { text: config.beneficio_3, active: config.beneficio_3_activo ?? true },
    { text: config.beneficio_4, active: config.beneficio_4_activo ?? true },
    { text: config.beneficio_5, active: config.beneficio_5_activo ?? true },
    { text: config.beneficio_6, active: config.beneficio_6_activo ?? true },
  ].filter(b => b.active).map(b => b.text)

  const testimonial = {
    name: config.testimonio_1_nombre || 'Nombre',
    role: config.testimonio_1_cargo || 'Cargo',
    content: config.testimonio_1_contenido || 'Contenido del testimonio...',
    rating: config.testimonio_1_rating || 5,
  }

  return (
    <div className="flex justify-center items-start w-full h-full overflow-auto bg-gray-50 p-4">
      <div
        className="bg-white rounded-lg border shadow-sm overflow-hidden transition-all duration-300"
        style={{
          width: deviceSize.width,
          transform: `scale(${deviceSize.scale})`,
          transformOrigin: 'top center',
        }}
      >
        <div className="bg-white">
          {/* Hero Preview */}
          <div
            className="space-y-4 p-8 bg-gray-50 relative overflow-hidden"
          >
            {/* Dynamic Background */}
            {config.hero_bg_url ? (
              <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${config.hero_bg_url})` }}
              />
            ) : (
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[50px] opacity-20"
                  style={{ backgroundColor: branding.color_primario }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[50px] opacity-20"
                  style={{ backgroundColor: branding.color_primario }} />
              </div>
            )}
            {config.hero_bg_url && <div className="absolute inset-0 bg-white/80 z-0" />}

            <div className="relative z-10 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border bg-white/50 backdrop-blur-sm"
                  style={{ borderColor: `${branding.color_primario}30`, color: branding.color_primario }}
                >
                  <span>{branding.nombre_marca || 'Marca'}</span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
                  <span className="text-gray-900">
                    {config.hero_titulo_principal || 'Título principal'}
                  </span>{' '}
                  <span className="relative whitespace-nowrap">
                    <span className="relative z-10" style={{ color: branding.color_primario }}>
                      {config.hero_titulo_destacado || 'destacado'}
                    </span>
                    <svg className="absolute -bottom-1 w-full h-2 left-0 z-0 opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke={branding.color_primario} strokeWidth="6" fill="none" />
                    </svg>
                  </span>
                </h1>
                <p className="text-gray-600 text-lg">
                  {config.hero_subtitulo || 'Subtítulo del hero...'}
                </p>
              </div>

              {config.hero_imagen_url && (
                <div className="w-full aspect-video relative rounded-2xl overflow-hidden shadow-xl border-4 border-white/50 rotate-1">
                  <img src={config.hero_imagen_url} alt="Hero" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex gap-2">
                <div
                  className="px-6 py-3 rounded-full text-white text-sm font-bold shadow-lg"
                  style={{ backgroundColor: branding.color_primario }}
                >
                  {config.hero_cta_principal || 'CTA Principal'}
                </div>
                {config.hero_cta_secundario && (
                  <div
                    className="px-6 py-3 rounded-full border-2 text-sm font-bold bg-white"
                    style={{
                      borderColor: branding.color_primario,
                      color: branding.color_primario,
                    }}
                  >
                    {config.hero_cta_secundario || 'CTA Secundario'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Servicios Preview */}
          <div
            className="space-y-6 p-8 relative"
          >
            {config.servicios_bg_url && (
              <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${config.servicios_bg_url})` }} />
            )}

            <div className="relative z-10 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {config.servicios_titulo || 'Nuestros Servicios'}
                </h2>
                <p className="text-sm text-gray-600">
                  {config.servicios_subtitulo || 'Subtítulo de servicios...'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {services.filter(s => s.active).map((service, index) => (
                  <div key={index} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: hexToRgba(branding.color_primario, 0.1) }}
                    >
                      <service.icon
                        className="w-5 h-5"
                        style={{ color: branding.color_primario }}
                      />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{service.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Beneficios Preview */}
          <div
            className="space-y-3 p-8 bg-cover bg-center relative"
            style={{ backgroundImage: config.beneficios_bg_url ? `url(${config.beneficios_bg_url})` : undefined }}
          >
            {config.beneficios_bg_url && <div className="absolute inset-0 bg-white/90" />}
            <div className="relative z-10 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {config.beneficios_titulo || 'Beneficios'}
                </h2>
                <p className="text-sm text-gray-600">
                  {config.beneficios_subtitulo || 'Subtítulo de beneficios...'}
                </p>
              </div>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: branding.color_primario }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-xs text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>

              {/* Estadística Preview */}
              {config.estadistica_principal_numero && (
                <div className="border rounded p-4 text-center space-y-1 bg-white/80 backdrop-blur-sm">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: branding.color_primario }}
                  >
                    {config.estadistica_principal_numero}
                  </div>
                  <div className="text-xs text-gray-600">
                    {config.estadistica_principal_texto || 'Métrica principal'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Testimonio Preview */}
          <div
            className="p-8 relative bg-white"
            style={{ backgroundImage: config.testimonios_bg_url ? `url(${config.testimonios_bg_url})` : undefined }}
          >
            <div className="relative z-10">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {config.testimonios_titulo || 'Testimonios'}
                </h2>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 relative">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 fill-current"
                      style={{ color: i < testimonial.rating ? '#F59E0B' : '#E5E7EB' }}
                    />
                  ))}
                </div>

                <p className="text-gray-700 text-sm italic mb-4">"{testimonial.content}"</p>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: branding.color_primario }}>
                    {testimonial.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900">{testimonial.name}</div>
                    <div className="text-[10px] text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final Preview */}
          <div className="p-12 relative overflow-hidden bg-gray-900">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>
            {config.cta_final_bg_url && <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${config.cta_final_bg_url})` }} />}

            <div
              className='absolute inset-0 opacity-30 blur-2xl'
              style={{ background: `radial-gradient(circle at 50% 50%, ${branding.color_primario}, transparent 70%)` }}
            />

            <div className="relative z-10 space-y-6 text-center">
              <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                {config.cta_final_titulo_1 || 'Transforma'}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  {config.cta_final_titulo_2 || 'tu negocio'}
                </span>
              </h2>

              <p className="text-sm text-gray-300 max-w-sm mx-auto">
                {config.cta_final_subtitulo || 'Subtítulo del CTA final...'}
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <div
                  className="px-6 py-3 rounded-full text-white text-xs font-bold shadow-2xl"
                  style={{ backgroundColor: branding.color_primario }}
                >
                  {config.cta_final_boton_principal || 'Empezar'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

