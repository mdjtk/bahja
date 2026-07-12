export const SHIPPING_THRESHOLD = 400

export async function getShippingThreshold(): Promise<number> {
  try {
    const res = await fetch('/api/shipping-threshold')
    if (!res.ok) return SHIPPING_THRESHOLD
    const data = await res.json()
    return data.threshold || SHIPPING_THRESHOLD
  } catch { return SHIPPING_THRESHOLD }
}
