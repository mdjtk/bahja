import { fetchWithAuth } from './fetch-with-auth';

export interface CartItem {
  id: string;
  variant: string;
  qty: number;
}

export interface OrderItem {
  id: string;
  variant: string;
  qty: number;
  name: string;
  price: number;
}

export interface OrderInfo {
  id: string;
  items: OrderItem[];
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  payment?: string;
  total?: number;
  date: string;
  status?: string;
  razorpayPaymentId?: string;
}

const CART_KEY = 'bahja_cart';
const ORDERS_KEY = 'bahja_orders';
const ORDER_KEY = 'bahja_order';
const ORDER_ID_KEY = 'bahja_order_id';
const WISHLIST_KEY = 'bahja_wishlist';
const PHONE_KEY = 'bahja_phone';

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

export function addToCart(cart: CartItem[], id: string, variant: string): CartItem[] {
  const existing = cart.find((item) => item.id === id && item.variant === variant);
  if (existing) {
    return cart.map((item) =>
      item.id === id && item.variant === variant
        ? { ...item, qty: item.qty + 1 }
        : item
    );
  }
  return [...cart, { id, variant, qty: 1 }];
}

export function addToCartWithQty(cart: CartItem[], id: string, variant: string, qty: number): CartItem[] {
  const existing = cart.find((item) => item.id === id && item.variant === variant);
  if (existing) {
    return cart.map((item) =>
      item.id === id && item.variant === variant
        ? { ...item, qty: item.qty + qty }
        : item
    );
  }
  return [...cart, { id, variant, qty }];
}

export function removeFromCart(cart: CartItem[], id: string, variant: string): CartItem[] {
  return cart.filter((item) => !(item.id === id && item.variant === variant));
}

export function updateQty(cart: CartItem[], id: string, variant: string, delta: number): CartItem[] {
  return cart.map((item) =>
    item.id === id && item.variant === variant
      ? { ...item, qty: Math.max(1, item.qty + delta) }
      : item
  );
}

export async function placeOrderDb(data: {
  name: string; phone: string; email?: string;
  address: string; city?: string; state?: string; pincode?: string;
  payment: string; cart: CartItem[]; total: number;
  razorpayPaymentId?: string;
  productsMap?: Record<string, { name: string; variants: Record<string, { price: number }> }>;
}): Promise<OrderInfo> {
  const items: OrderItem[] = data.cart.map((item) => {
    const product = data.productsMap?.[item.id];
    const variant = product?.variants[item.variant];
    return {
      id: item.id,
      variant: item.variant,
      qty: item.qty,
      name: product?.name || item.id,
      price: variant?.price || 0,
    };
  });

  const total = data.total;

  const orderId = 'BHJ-' + crypto.randomUUID().slice(0, 8).toUpperCase();

  const payload = {
    order_id: orderId,
    items,
    customer_name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    payment_method: data.payment,
    total,
    razorpay_payment_id: data.razorpayPaymentId,
  };

  const res = await fetchWithAuth('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.error(`[placeOrderDb] ${res.status} ${res.statusText}:`, errBody);
    throw new Error(`Failed to place order (${res.status})`);
  }

  const order: OrderInfo = {
    id: orderId,
    items,
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    payment: data.payment,
    total,
    date: new Date().toISOString(),
    status: 'Confirmed',
    razorpayPaymentId: data.razorpayPaymentId,
  };

  localStorage.setItem(ORDER_ID_KEY, orderId);
  const orders: OrderInfo[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  localStorage.removeItem(CART_KEY);

  return order;
}

export async function getOrderByIdDb(id: string): Promise<OrderInfo | undefined> {
  try {
    const stored = localStorage.getItem(ORDER_KEY);
    if (stored) {
      const order: OrderInfo = JSON.parse(stored);
      if (order.id === id) return order;
    }
    const localOrders = getAllOrders();
    const local = localOrders.find((o) => o.id === id);
    if (local) return local;

    const res = await fetchWithAuth(`/api/orders/${encodeURIComponent(id)}`);
    if (!res.ok) return undefined;
    const dbOrder = await res.json();
    return {
      id: dbOrder.order_id,
      items: dbOrder.items,
      name: dbOrder.customer_name || '',
      phone: dbOrder.phone || '',
      email: dbOrder.email || '',
      address: dbOrder.address || '',
      city: dbOrder.city || '',
      state: dbOrder.state || '',
      pincode: dbOrder.pincode || '',
      payment: dbOrder.payment_method,
      total: dbOrder.total,
      date: dbOrder.created_at,
      status: dbOrder.status,
      razorpayPaymentId: dbOrder.razorpay_payment_id,
    };
  } catch {
    return undefined;
  }
}

export async function getAllOrdersDb(): Promise<OrderInfo[]> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) return getAllOrders();
    const dbOrders = await res.json();
    return dbOrders.map((o: any) => ({
      id: o.order_id,
      items: o.items,
      name: o.customer_name,
      phone: o.phone,
      email: o.email,
      address: o.address,
      city: o.city,
      state: o.state,
      pincode: o.pincode,
      payment: o.payment_method,
      total: o.total,
      date: o.created_at,
      status: o.status,
      razorpayPaymentId: o.razorpay_payment_id,
    }));
  } catch {
    return getAllOrders();
  }
}



export function getOrderById(id: string): OrderInfo | undefined {
  try {
    const stored = localStorage.getItem(ORDER_KEY);
    if (stored) {
      const order: OrderInfo = JSON.parse(stored);
      if (order.id === id) return order;
    }
    const orders = getAllOrders();
    return orders.find((o) => o.id === id) || undefined;
  } catch {
    return undefined;
  }
}

export function getAllOrders(): OrderInfo[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLastOrderId(): string | null {
  const orders = getAllOrders();
  if (orders.length > 0) {
    return orders[orders.length - 1].id;
  }
  return localStorage.getItem(ORDER_ID_KEY);
}

export async function saveSubscriberDb(email: string): Promise<void> {
  await fetch('/api/subscribers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function saveContactMessageDb(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
  await fetch('/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function saveSubscriber(email: string): void {
  const subs: string[] = JSON.parse(localStorage.getItem('bahja_subscribers') || '[]');
  if (!subs.includes(email)) subs.push(email);
  localStorage.setItem('bahja_subscribers', JSON.stringify(subs));
}

export function saveContactMessage(data: { name: string; email: string; subject: string; message: string }): void {
  const msgs: typeof data[] = JSON.parse(localStorage.getItem('bahja_contacts') || '[]');
  msgs.push({ ...data, ...{ date: new Date().toISOString() } });
  localStorage.setItem('bahja_contacts', JSON.stringify(msgs));
}

export function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleWishlist(id: string): string[] {
  const wishlist = loadWishlist();
  const idx = wishlist.indexOf(id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push(id);
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  window.dispatchEvent(new Event('wishlist-update'));
  return [...wishlist];
}

export function savePhoneLocal(phone: string): void {
  try { localStorage.setItem(PHONE_KEY, phone) } catch {}
}

export function getPhoneLocal(): string {
  try { return localStorage.getItem(PHONE_KEY) || '' } catch { return '' }
}

export const SHIPPING_THRESHOLD = 400;
export const SHIPPING_FEE = 49;
