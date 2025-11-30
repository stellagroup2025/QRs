'use client'

/**
 * Componentes de Schema.org (JSON-LD) para SEO
 */

interface OrganizationSchemaProps {
  name: string
  url: string
  logo?: string
  description?: string
  foundingDate?: string
  founders?: string[]
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  contactPoint?: {
    telephone?: string
    email?: string
    contactType?: string
  }
  sameAs?: string[]
}

export function OrganizationSchema({
  name = 'Qronnect',
  url = 'https://qronnect.es',
  logo = 'https://qronnect.es/LogoQronnect.png',
  description = 'Sistema de fidelización inteligente con códigos QR para comercios',
  foundingDate = '2024',
  founders = ['StellaGroup'],
  address = {
    addressCountry: 'ES',
    addressLocality: 'España',
  },
  contactPoint = {
    email: 'soporte@qronnect.com',
    contactType: 'customer support',
  },
  sameAs = ['https://stellagroup.es'],
}: Partial<OrganizationSchemaProps> = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    foundingDate,
    founders: founders.map((founder) => ({
      '@type': 'Person',
      name: founder,
    })),
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      ...contactPoint,
    },
    sameAs,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface SoftwareApplicationSchemaProps {
  name: string
  description: string
  url: string
  applicationCategory: string
  operatingSystem?: string
  offers?: {
    price: string
    priceCurrency: string
  }
  aggregateRating?: {
    ratingValue: number
    ratingCount: number
  }
}

export function SoftwareApplicationSchema({
  name = 'Qronnect',
  description = 'Sistema de fidelización con QR. Sin app, sin complicaciones. Aumenta tus ventas un 40%.',
  url = 'https://qronnect.es',
  applicationCategory = 'BusinessApplication',
  operatingSystem = 'Web',
  offers = {
    price: '0',
    priceCurrency: 'EUR',
  },
  aggregateRating = {
    ratingValue: 4.9,
    ratingCount: 523,
  },
}: Partial<SoftwareApplicationSchemaProps> = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      ...offers,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ...aggregateRating,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQSchemaProps {
  questions: Array<{
    question: string
    answer: string
  }>
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ProductSchemaProps {
  name: string
  description: string
  image?: string
  brand?: string
  offers?: {
    price: string
    priceCurrency: string
    availability: string
  }
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}

export function ProductSchema({
  name = 'Qronnect - Programa de Fidelización',
  description = 'Sistema de fidelización inteligente con códigos QR. Sin app, aumenta tus ventas un 40%.',
  image = 'https://qronnect.es/LogoQronnect.png',
  brand = 'Qronnect',
  offers = {
    price: '0',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating = {
    ratingValue: 4.9,
    reviewCount: 523,
  },
}: Partial<ProductSchemaProps> = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      ...offers,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ...aggregateRating,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
