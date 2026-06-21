'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        toast('Invalid password');
        setLoading(false);
        return;
      }
      router.push('/admin');
    } catch {
      toast('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Admin Login</h1>
        </div>
      </div>
      <div className="section">
        <div className="container" style={{ maxWidth: 400, margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px rgba(58,36,26,0.06)' }}>
            <div className="form-group">
              <label htmlFor="admin-pwd">Admin Password</label>
              <input id="admin-pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Verifying…' : 'Login →'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
