import { PRODUCTS } from './data';

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
}

const CART_KEY = 'bahja_cart';
const ORDERS_KEY = 'bahja_orders';
const ORDER_KEY = 'bahja_order';
const ORDER_ID_KEY = 'bahja_order_id';
const WISHLIST_KEY = 'bahja_wishlist';
const SUBSCRIBERS_KEY = 'bahja_subscribers';
const CONTACTS_KEY = 'bahja_contacts';

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

export function updateQty(
  cart: CartItem[],
  id: string,
  variant: string,
  delta: number
): CartItem[] {
  return cart.map((item) =>
    item.id === id && item.variant === variant
      ? { ...item, qty: Math.max(1, item.qty + delta) }
      : item
  );
}

export function placeOrder(data: Omit<OrderInfo, 'id' | 'date' | 'items'> & { cart: CartItem[] }): OrderInfo {
  const items: OrderItem[] = data.cart.map((item) => {
    const product = PRODUCTS[item.id];
    const variant = product?.variants[item.variant];
    return {
      id: item.id,
      variant: item.variant,
      qty: item.qty,
      name: product?.name || item.id,
      price: variant?.price || 0,
    };
  });
  const order: OrderInfo = {
    id: 'BHJ' + Date.now().toString(36).toUpperCase(),
    items,
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    payment: data.payment,
    total: data.total,
    date: new Date().toISOString(),
    status: 'Confirmed',
  };
  localStorage.setItem(ORDER_ID_KEY, order.id);
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  const orders: OrderInfo[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  localStorage.removeItem(CART_KEY);
  return order;
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

export function saveSubscriber(email: string): void {
  const subs: string[] = JSON.parse(localStorage.getItem(SUBSCRIBERS_KEY) || '[]');
  if (!subs.includes(email)) subs.push(email);
  localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subs));
}

export function saveContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): void {
  const msgs: typeof data[] = JSON.parse(
    localStorage.getItem(CONTACTS_KEY) || '[]'
  );
  msgs.push({ ...data, ...{ date: new Date().toISOString() } });
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(msgs));
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

export const SHIPPING_THRESHOLD = 400;
export const SHIPPING_FEE = 49;
