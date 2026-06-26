'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadCart } from '@/lib/store'

function SyncInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'

  useEffect(() => {
    const sync = async () => {
      try {
        const cart = loadCart()
        if (cart.length > 0) {
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart }),
          })
        }
      } catch {}
      router.push(redirect)
    }
    sync()
  }, [router, redirect])

  return (
    <div className="section" style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>
      Syncing your cart…
    </div>
  )
}

export default function SyncPage() {
  return (
    <Suspense fallback={<div className="section" style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>Loading…</div>}>
      <SyncInner />
    </Suspense>
  )
}
