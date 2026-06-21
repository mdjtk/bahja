'use client';

import { FormEvent } from 'react';
import { saveSubscriberDb } from '@/lib/store';
import { toast } from './Toast';

export default function NewsletterForm() {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input[type="email"]') as HTMLInputElement;
    if (!input?.value) return;
    try {
      await saveSubscriberDb(input.value);
      form.reset();
      toast('Welcome to the Bahja family!');
    } catch {
      toast('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="f-newsletter">
      <div className="container">
        <div className="nl-text">
          <h3>Join our hive</h3>
          <p>Be the first to know about new harvests, beekeeping stories, and exclusive offers.</p>
        </div>
        <form className="nl-form" onSubmit={handleSubmit}>
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
}
