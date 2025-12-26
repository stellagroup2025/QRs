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
        <div className="space-y-8 p-8">
          {/* Hero Preview */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">
                <span className="text-gray-900">
                  {config.hero_titulo_principal || 'Título principal'}
                </span>
                <br />
                <span style={{ color: branding.color_primario }}>
                  {config.hero_titulo_destacado || 'destacado'}
                </span>
              </h1>
              <p className="text-gray-600">
                {config.hero_subtitulo || 'Subtítulo del hero...'}
              </p>
            </div>
            <div className="flex gap-2">
              <div
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: branding.color_primario }}
              >
                {config.hero_cta_principal || 'CTA Principal'}
              </div>
              <div
                className="px-4 py-2 rounded border text-sm font-medium"
                style={{
                  borderColor: branding.color_primario,
                  color: branding.color_primario,
                }}
              >
                {config.hero_cta_secundario || 'CTA Secundario'}
              </div>
            </div>
            <p className="text-xs text-gray-600">
              {config.hero_social_proof || 'Social proof...'}
            </p>
          </div>

          {/* Servicios Preview */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-gray-900">
                  {config.servicios_titulo?.split(' ')[0] || 'Servicios'}
                </span>{' '}
                <span style={{ color: branding.color_primario }}>
                  {config.servicios_titulo?.split(' ').slice(1).join(' ') || 'completos'}
                </span>
              </h2>
              <p className="text-sm text-gray-600">
                {config.servicios_subtitulo || 'Subtítulo de servicios...'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {services.filter(s => s.active).map((service, index) => (
                <div key={index} className="border rounded p-3 space-y-2">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: hexToRgba(branding.color_primario, 0.1) }}
                  >
                    <service.icon
                      className="w-4 h-4"
                      style={{ color: branding.color_primario }}
                    />
                  </div>
                  <h3 className="font-semibold text-sm">{service.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Beneficios Preview */}
          <div className="space-y-3">
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
          </div>

          {/* Estadística Preview */}
          <div className="border rounded p-4 text-center space-y-1">
            <div
              className="text-3xl font-bold"
              style={{ color: branding.color_primario }}
            >
              {config.estadistica_principal_numero || '40%'}
            </div>
            <div className="text-xs text-gray-600">
              {config.estadistica_principal_texto || 'Métrica principal'}
            </div>
          </div>

          {/* Testimonio Preview */}
          <div className="border rounded p-4 space-y-3">
            <div>
              <h2 className="text-xl font-bold mb-2">
                <span className="text-gray-900">
                  {config.testimonios_titulo?.split(' ').slice(0, -2).join(' ') || 'Lo que dicen'}
                </span>{' '}
                <span style={{ color: branding.color_primario }}>
                  {config.testimonios_titulo?.split(' ').slice(-2).join(' ') || 'nuestros clientes'}
                </span>
              </h2>
            </div>
            <div className="space-y-2">
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 fill-current"
                    style={{ color: branding.color_primario }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-700 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: branding.color_primario }}
                >
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-xs">{testimonial.name}</div>
                  <div className="text-xs text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final Preview */}
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-bold">
              <span className="text-gray-900">
                {config.cta_final_titulo_1 || '¿Listo para transformar'}
              </span>
              <br />
              <span style={{ color: branding.color_primario }}>
                {config.cta_final_titulo_2 || 'tu negocio?'}
              </span>
            </h2>
            <p className="text-sm text-gray-600">
              {config.cta_final_subtitulo || 'Subtítulo del CTA final...'}
            </p>
            <div className="flex gap-2 justify-center">
              <div
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: branding.color_primario }}
              >
                {config.cta_final_boton_principal || 'Botón principal'}
              </div>
              <div
                className="px-4 py-2 rounded border text-sm font-medium"
                style={{
                  borderColor: branding.color_primario,
                  color: branding.color_primario,
                }}
              >
                {config.cta_final_boton_secundario || 'Botón secundario'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
