import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyAuth, isAdmin } from '@/lib/auth-helpers'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendNewOrderNotification } from '@/lib/notifications'

function sanitize(val: unknown): string {
  if (typeof val !== 'string') return ''
  return val.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' })[c] || c)
}

export async function POST(req: NextRequest) {
  const decoded = await verifyAuth(req)
  if (!decoded) {
    return NextResponse.json({ error: 'Authentication required to place an order' }, { status: 401 })
  }

  const rl = checkRateLimit(`orders:${decoded.uid}`, { maxTokens: 10 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  try {
    const body = await req.json()
    const userId = decoded.uid

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Server-side price re-validation
    let computedTotal = 0
    const productCache = new Map<string, any>()
    for (const item of body.items) {
      const cached = productCache.get(item.id)
      const product = cached ?? await getSupabaseAdmin()
        .from('bahja_products')
        .select('name, variants')
        .eq('id', item.id)
        .single()
        .then(r => r.data)
      if (!cached && product) productCache.set(item.id, product)

      if (!product) {
        return NextResponse.json({ error: `Product ${item.id} not found` }, { status: 400 })
      }

      const variant = product.variants?.[item.variant]
      if (!variant || typeof variant.price !== 'number') {
        return NextResponse.json({ error: `Variant ${item.variant} not found for ${item.id}` }, { status: 400 })
      }

      computedTotal += variant.price * item.qty
    }

    const SHIPPING_THRESHOLD = 400
    const SHIPPING_FEE = 49
    const serverShipping = computedTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const serverTotal = computedTotal + serverShipping

    if (Math.abs(serverTotal - body.total) > 1) {
      console.error(`Price mismatch: client=${body.total}, server=${serverTotal} (subtotal=${computedTotal}, shipping=${serverShipping}), user=${userId}`)
      return NextResponse.json({ error: 'Order total mismatch' }, { status: 400 })
    }

    // Verify Razorpay payment amount matches order total
    if (body.razorpay_payment_id) {
      const key_id = process.env.RAZORPAY_KEY_ID
      const key_secret = process.env.RAZORPAY_KEY_SECRET
      if (key_id && key_secret) {
        try {
          const razorpay = new Razorpay({ key_id, key_secret })
          const payment = await razorpay.payments.fetch(body.razorpay_payment_id)
          const paidAmount = Number(payment.amount ?? 0) / 100
          if (Math.abs(paidAmount - serverTotal) > 1) {
            console.error(`Payment amount mismatch: paid=${paidAmount}, total=${serverTotal}, razorpay_payment_id=${body.razorpay_payment_id}`)
            return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
          }
        } catch (err) {
          console.error('Razorpay payment verification error:', err)
          return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
        }
      }
    }

    // Stock deduction — skip items without inventory records (unlimited stock)
    const deductions: string[] = []
    for (const item of body.items) {
      const { data: invRecord, error: invErr } = await getSupabaseAdmin()
        .from('bahja_inventory')
        .select('stock')
        .eq('product_id', item.id)
        .eq('variant_key', item.variant)
        .maybeSingle()

      if (invErr) console.error('Inventory check error:', invErr)

      if (invRecord) {
        if (invRecord.stock < item.qty) {
          return NextResponse.json({ error: `Insufficient stock for ${item.id} (${item.variant})` }, { status: 409 })
        }
        const { error: deductErr } = await getSupabaseAdmin().rpc('decrement_inventory', {
          p_product_id: item.id,
          p_variant_key: item.variant,
          p_qty: item.qty,
        })
        if (deductErr) {
          // Rollback any successful deductions
          for (const r of deductions) {
            const [rid, rvar, rqty] = r.split('|')
            try {
              await getSupabaseAdmin().rpc('decrement_inventory', {
                p_product_id: rid, p_variant_key: rvar, p_qty: -Number(rqty),
              })
            } catch {} /* best-effort rollback */
          }
          return NextResponse.json({ error: `Insufficient stock for ${item.id} (${item.variant})` }, { status: 409 })
        }
        deductions.push(`${item.id}|${item.variant}|${item.qty}`)
      }
      // No inventory record = product not tracked = unlimited stock
    }

    const { data, error } = await getSupabaseAdmin()
      .from('bahja_orders')
      .insert({
        order_id: body.order_id,
        items: body.items,
        customer_name: sanitize(body.customer_name),
        phone: sanitize(body.phone),
        email: sanitize(body.email) || null,
        address: sanitize(body.address),
        city: sanitize(body.city) || null,
        state: sanitize(body.state) || null,
        pincode: sanitize(body.pincode) || null,
        payment_method: body.payment_method,
        total: serverTotal,
        razorpay_payment_id: body.razorpay_payment_id || null,
        status: 'Confirmed',
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Send WhatsApp alert to team (non-blocking)
    sendNewOrderNotification({
      customerName: body.customer_name,
      phone: body.phone,
      orderId: body.order_id,
      total: computedTotal,
      items: body.items,
    }).catch(console.error)

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('Order creation error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('bahja_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error fetching orders:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
