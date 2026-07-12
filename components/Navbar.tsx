'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { CartItem } from '@/lib/store'
import { useAuth } from './AuthProvider'
import { toast } from './Toast'

export default function Navbar({ cart }: { cart: CartItem[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path))

  const close = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    const handleScroll = () => {
      document.querySelector('nav')?.classList.toggle('scrolled', window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen, close])

  useEffect(() => {
    close()
    setAccountOpen(false)
  }, [pathname, close])

  useEffect(() => {
    if (!accountOpen) return
    const handleClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAccountOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [accountOpen])

  const count = cart.reduce((sum, item) => sum + item.qty, 0)

  const handleLogout = async () => {
    setAccountOpen(false)
    await signOut()
    toast('Logged out')
    router.push('/')
  }

  return (
    <>
      <nav>
        <div className="container">
          <div className="nav-left">
            <Link href="/" className="logo" onClick={close}>
              <img src="/assets/images/logo.png" alt="Bahja" height={32} />
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
              <li><Link href="/my-orders" className={isActive('/my-orders') ? 'active' : ''}>My Orders</Link></li>
              {menuOpen && (
                <>
                  <li style={{ width: '100%', height: 1, background: 'rgba(58,36,26,0.08)', margin: '4px 0' }} />
                  <li>{user ? (
                    <Link href="/account" onClick={close} style={{ fontSize: 13, color: 'rgba(58,36,26,0.65)' }}>My Account</Link>
                  ) : (
                    <Link href="/auth/login?redirect=/account" onClick={close} style={{ fontSize: 13, color: 'rgba(58,36,26,0.65)' }}>Sign In</Link>
                  )}</li>
                  {user && <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(58,36,26,0.5)', fontFamily: 'inherit' }}>Logout</button></li>}
                </>
              )}
            </ul>
          </div>
          <div className="nav-right">
            <Link href="/shop" className="nav-btn nav-btn-primary">Shop Now</Link>
            <div className="account-wrap" ref={accountRef}>
              <button className="account-btn" aria-label="Account" onClick={() => setAccountOpen((v) => !v)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              {accountOpen && (
                <div className="account-dropdown">
                  {user ? (
                    <>
                      <Link href="/account" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>My Account</Link>
                      <Link href="/my-orders" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>My Orders</Link>
                      <div className="account-dropdown-divider" />
                      <button className="account-dropdown-item account-dropdown-logout" onClick={handleLogout}>Logout</button>
                    </>
                  ) : (
                    <Link href="/auth/login?redirect=/account" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>Sign In</Link>
                  )}
                </div>
              )}
            </div>
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
  )
}
