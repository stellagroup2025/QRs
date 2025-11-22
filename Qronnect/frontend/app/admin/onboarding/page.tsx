'use client'

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  const handleCompleted = () => {
    // Redirigir al dashboard cuando se complete el onboarding
    router.push('/admin/dashboard')
  }

  return <OnboardingWizard onCompleted={handleCompleted} />
}
