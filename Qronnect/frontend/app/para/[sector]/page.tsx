import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SECTORES, getSector } from '@/lib/sectores'
import { SectorLanding } from '@/components/sector/SectorLanding'

const BASE_URL = 'https://www.qronnect.es'

type Params = Promise<{ sector: string }>

export function generateStaticParams() {
  return Object.keys(SECTORES).map((sector) => ({ sector }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { sector: slug } = await params
  const sector = getSector(slug)
  if (!sector) return {}

  const url = `${BASE_URL}/para/${sector.slug}`
  return {
    title: sector.seo.title,
    description: sector.seo.description,
    keywords: sector.seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: sector.seo.title,
      description: sector.seo.description,
      url,
      type: 'website',
      locale: 'es_ES',
      siteName: 'Qronnect',
    },
  }
}

export default async function SectorPage({ params }: { params: Params }) {
  const { sector: slug } = await params
  const sector = getSector(slug)
  if (!sector) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Qronnect',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: sector.seo.description,
        url: `${BASE_URL}/para/${sector.slug}`,
        audience: { '@type': 'BusinessAudience', name: sector.nombre },
      },
      {
        '@type': 'FAQPage',
        mainEntity: sector.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SectorLanding sector={sector} />
    </>
  )
}
