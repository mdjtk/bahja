const API_VERSION = 'v22.0'

function getConfig() {
  const token = process.env.WHATSAPP_API_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneNumberId) {
    throw new Error('WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID must be set')
  }
  return { token, phoneNumberId }
}

export async function sendOtpViaWhatsApp(phone: string, otp: string): Promise<void> {
  const { token, phoneNumberId } = getConfig()
  const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: 'bahja_otp',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: otp }],
          },
        ],
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`WhatsApp API error: ${err}`)
  }
}
