interface OrderConfirmationPayload {
  email?: string
  phone: string
  name: string
  orderId: string
  total: number
  items: Array<{ name: string; variant: string; qty: number; price: number }>
}

export async function sendOrderConfirmation(payload: OrderConfirmationPayload): Promise<void> {
  if (payload.email) {
    try {
      const res = await fetch(process.env.NOTIFICATION_WEBHOOK_URL || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order_confirmation',
          to: payload.email,
          ...payload,
        }),
      })
      if (!res.ok) console.error('Notification webhook returned', res.status)
    } catch (err) {
      console.error('Failed to send email notification:', err)
    }
  }
}

export async function sendAdminNotification(orderId: string, total: number, customerName: string): Promise<void> {
  const webhookUrl = process.env.ADMIN_NOTIFICATION_WEBHOOK_URL || process.env.NOTIFICATION_WEBHOOK_URL
  if (!webhookUrl) return
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_order_admin',
        orderId,
        total,
        customerName,
      }),
    })
  } catch (err) {
    console.error('Failed to send admin notification:', err)
  }
}
