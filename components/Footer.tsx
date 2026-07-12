'use client';

import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer>
      <NewsletterForm />
      <div className="f-main">
        <div className="container">
          <div className="f-brand">
            <img src="/assets/images/logo-footer.png" alt="Bahja" className="f-logo" />
            <p>Bahja&apos;s ethical beekeeping brings you pure, raw honey in its most natural form: from beehive to bottle.</p>
            <div className="f-tags">
              <span>Pure</span><span>Raw</span><span>Natural</span>
            </div>
            <div className="f-social">
              <a href="https://instagram.com/bahjahoney" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://facebook.com/bahjahoney" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://youtube.com/@bahjahoney" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
              <a href="https://twitter.com/bahjahoney" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>
          <div className="f-links">
            <h5>Shop</h5>
            <ul>
              <li><Link href="/shop">All Honey</Link></li>
              <li><Link href="/shop">Gift Sets</Link></li>
              <li><Link href="/contact">Bulk Order</Link></li>
            </ul>
          </div>
          <div className="f-links">
            <h5>Links</h5>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/#process">Our Process</Link></li>
              <li><Link href="/#reviews">Reviews</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/certificate">FSSAI Certificate</Link></li>
            </ul>
          </div>
          <div className="f-contact">
            <h5>Contact</h5>
            <p><strong>WhatsApp:</strong> +91 80868 72603</p>
            <p><strong>Email:</strong> contactbahjahoney@gmail.com</p>
            <p>Kondotty, Malappuram, Kerala</p>
          </div>
        </div>
      </div>
      <div className="f-bottom">
        <div className="container">
          <p>&copy; 2025 Bahja Pure Honey. All rights reserved.</p>
          <div className="f-bottom-links">
            <Link href="/track">Track Order</Link>
            <Link href="/returns">Returns &amp; Cancellations</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
