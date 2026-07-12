'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    if (!gaId) return

    const gtag = (...args: any[]) => {
      (window as any).dataLayer?.push(args)
    }

    if (!(window as any).gtag) {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).gtag = gtag
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      document.head.appendChild(script)
      gtag('js', new Date())
      gtag('config', gaId)
    } else {
      gtag('config', gaId, { page_path: pathname })
    }
  }, [pathname])

  return null
}
