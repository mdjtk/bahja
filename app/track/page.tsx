'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function TrackRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    router.replace(id ? `/my-orders?id=${encodeURIComponent(id)}` : '/my-orders')
  }, [router, id])

  return <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>Redirecting…</div>
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>Loading…</div>}>
      <TrackRedirect />
    </Suspense>
  )
}
