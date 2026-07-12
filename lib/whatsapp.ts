const API_VERSION = 'v22.0'

type WhatsAppConfig = { token: string; phoneNumberId: string }

function getConfig(): WhatsAppConfig | null {
  const token = process.env.WHATSAPP_API_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneNumberId) {
    return null
  }
  return { token, phoneNumberId }
}

async function sendMessage(phone: string, bodyPayload: Record<string, unknown>): Promise<void> {
  const cfg = getConfig()
  if (!cfg) throw new Error('WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID not configured')
  const url = `https://graph.facebook.com/${API_VERSION}/${cfg.phoneNumberId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...bodyPayload }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`WhatsApp API error: ${err}`)
  }
}

export async function sendOtpViaWhatsApp(phone: string, otp: string): Promise<void> {
  await sendMessage(phone, {
    to: phone,
    type: 'template',
    template: {
      name: 'bahja_otp',
      language: { code: 'en' },
      components: [{ type: 'body', parameters: [{ type: 'text', text: otp }] }],
    },
  })
}

interface OrderAlertParams {
  phone: string
  customerName: string
  orderId: string
  total: number
  items: Array<{ name: string; variant: string; qty: number }>
}

export async function sendOrderAlertViaWhatsApp(params: OrderAlertParams): Promise<void> {
  const lines = [
    `*New Order Received*`,
    ``,
    `Customer: ${params.customerName}`,
    `Order: ${params.orderId}`,
    `Total: ₹${params.total}`,
    ``,
    `Items:`,
    ...params.items.map((i) => `  • ${i.qty}× ${i.name} (${i.variant})`),
    ``,
    `Open admin: https://bahja.in/admin`,
  ]
  const text = lines.join('\n')

  await sendMessage(params.phone, {
    to: params.phone,
    type: 'text',
    text: { body: text },
  })
}
