'use client';

import { FormEvent, useState } from 'react';
import { saveContactMessageDb } from '@/lib/store';
import { toast } from '@/components/Toast';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await saveContactMessageDb({ name, email, subject, message });
      toast('Message sent! We\'ll get back to you soon.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      toast('Failed to send. Please try again.');
    }
  };

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We&rsquo;d love to hear from you</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="c-name">Name *</label>
                    <input id="c-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-email">Email *</label>
                    <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="c-subject">Subject</label>
                  <input id="c-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Bulk order enquiry" />
                </div>
                <div className="form-group">
                  <label htmlFor="c-msg">Message *</label>
                  <textarea id="c-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Send Message →</button>
              </form>
            </div>
            <div>
              <div className="contact-info-card">
                <h3>Get in Touch</h3>
                <div className="ci-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  <div className="ci-text"><strong>WhatsApp</strong>+91 80868 72603</div>
                </div>
                <div className="ci-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <div className="ci-text"><strong>Email</strong>contactbahjahoney@gmail.com</div>
                </div>
                <div className="ci-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <div className="ci-text"><strong>Address</strong>Kondotty, Malappuram, Kerala</div>
                </div>
                <div className="ci-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <div className="ci-text"><strong>Business Hours</strong>Mon–Sat, 9 AM – 7 PM</div>
                </div>
              </div>
              <div style={{ marginTop: 20, textAlign: 'center', background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 12px rgba(58,36,26,0.04)' }}>
                <p style={{ fontSize: 13, color: 'rgba(58,36,26,0.45)', marginBottom: 12 }}>Prefer chatting?</p>
                <a href="https://wa.me/918086872603" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ background: '#25D366' }}>Chat on WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
