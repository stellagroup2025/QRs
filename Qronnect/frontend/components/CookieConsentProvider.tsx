'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CookieConsent {
  necessary: boolean // Siempre true, no se puede rechazar
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

interface CookieConsentContextType {
  consent: CookieConsent | null
  showBanner: boolean
  acceptAll: () => void
  rejectAll: () => void
  setConsent: (consent: CookieConsent) => void
  resetConsent: () => void
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

const CONSENT_KEY = 'cookie_consent'

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<CookieConsent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Cargar consentimiento guardado
    const savedConsent = localStorage.getItem(CONSENT_KEY)
    if (savedConsent) {
      try {
        setConsentState(JSON.parse(savedConsent))
        setShowBanner(false)
      } catch (e) {
        setShowBanner(true)
      }
    } else {
      setShowBanner(true)
    }
  }, [])

  const saveConsent = (newConsent: CookieConsent) => {
    setConsentState(newConsent)
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent))
    setShowBanner(false)
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    })
  }

  const rejectAll = () => {
    saveConsent({
      necessary: true, // Las necesarias no se pueden rechazar
      analytics: false,
      marketing: false,
      preferences: false,
    })
  }

  const setConsent = (newConsent: CookieConsent) => {
    saveConsent({ ...newConsent, necessary: true }) // Siempre mantener necessary en true
  }

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_KEY)
    setConsentState(null)
    setShowBanner(true)
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        showBanner,
        acceptAll,
        rejectAll,
        setConsent,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  }
  return context
}
