'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadCart, saveCart, CartItem } from '@/lib/store';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ToastProvider from '@/components/Toast';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(loadCart());
  }, []);

  useEffect(() => {
    const handleStorage = () => setCart(loadCart());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cart-update', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cart-update', handleStorage);
    };
  }, []);

  const handleCartUpdate = useCallback((updated: CartItem[]) => {
    saveCart(updated);
    setCart(updated);
    window.dispatchEvent(new Event('cart-update'));
  }, []);

  return (
    <ToastProvider>
      <AnnouncementBar />
      <Navbar cart={cart} />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </ToastProvider>
  );
}
