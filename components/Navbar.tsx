'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/lib/store';

export default function Navbar({ cart }: { cart: CartItem[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  const close = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const handleScroll = () => {
      document.querySelector('nav')?.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen, close]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <nav>
        <div className="container">
          <div className="nav-left">
            <Link href="/" className="logo" onClick={close}>
              <img src="/assets/images/logo.png" alt="" height={32} />
              <span>Bahja<span className="logo-dot"></span></span>
            </Link>
            <ul className="nav-links" style={menuOpen ? {
              display: 'flex',
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              flexDirection: 'column',
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              zIndex: 999,
              gap: '18px',
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(58,36,26,0.1)',
            } : {}}>
              <li><Link href="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
              <li><Link href="/shop" className={isActive('/shop') ? 'active' : ''}>Shop</Link></li>
              <li><Link href="/#process" className={isActive('/#process') ? 'active' : ''}>Process</Link></li>
              <li><Link href="/about" className={isActive('/about') ? 'active' : ''}>About</Link></li>
              <li><Link href="/blog" className={isActive('/blog') ? 'active' : ''}>Blog</Link></li>
              <li><Link href="/track" className={isActive('/track') ? 'active' : ''}>Track Order</Link></li>
            </ul>
          </div>
          <div className="nav-right">
            <Link href="/track" className="nav-btn">Track</Link>
            <Link href="/shop" className="nav-btn nav-btn-primary">Shop Now</Link>
            <Link href="/cart" className="cart-wrap" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6.5 17.5h11l2-13h-15l2 13z"/>
                <circle cx="9" cy="21" r="1"/><circle cx="15" cy="21" r="1"/>
              </svg>
              <span className="count" style={{ display: count > 0 ? 'flex' : 'none' }}>{count}</span>
            </Link>
            <button className={`menu-toggle${menuOpen ? ' active' : ''}`} aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>
      {menuOpen && <div className="nav-overlay" onClick={close} />}
    </>
  );
}
