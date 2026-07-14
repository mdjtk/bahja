import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOrderAlertViaWhatsApp } from '@/lib/whatsapp'

function getTeamPhones(): string[] {
  const raw = process.env.NOTIFICATION_TEAM_PHONES || ''
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return '91' + digits
  if (digits.length === 12 && digits.startsWith('91')) return digits
  return digits
}

export async function sendNewOrderNotification(params: {
  customerName: string
  phone: string
  orderId: string
  total: number
  items: Array<{ name: string; variant: string; qty: number; price: number }>
}): Promise<void> {
  const phones = getTeamPhones()
  if (phones.length === 0) {
    console.warn('No NOTIFICATION_TEAM_PHONES configured — skipping WhatsApp alert')
    return
  }

  for (const rawPhone of phones) {
    const phone = formatPhone(rawPhone)
    try {
      await sendOrderAlertViaWhatsApp({
        phone,
        customerName: params.customerName,
        orderId: params.orderId,
        total: params.total,
        items: params.items,
      })
      console.log(`WhatsApp alert sent to ${phone} for order ${params.orderId}`)
      await logNotification(params.orderId, 'whatsapp', 'sent')
    } catch (err: any) {
      console.error(`WhatsApp alert failed for ${phone}:`, err.message)
      await logNotification(params.orderId, 'whatsapp', 'failed', err.message)
    }
  }
}

async function logNotification(
  orderId: string,
  channel: string,
  status: 'sent' | 'failed',
  error?: string,
): Promise<void> {
  try {
    await (await getSupabaseAdmin()).from('bahja_notification_log').insert({
      order_id: orderId,
      channel,
      status,
      error: error || null,
    })
  } catch (dbErr) {
    console.error('Failed to log notification:', dbErr)
  }
}