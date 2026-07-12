'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';

interface Variant {
  label: string;
  weight: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  type: string;
  slug: string;
  image: string;
  rating: number;
  description: string;
  variantOrder: string[];
  variants: Record<string, Variant>;
  active: boolean;
  created_at: string;
}

const defaultProduct = (): Partial<Product> => ({
  id: '',
  name: '',
  type: 'wild',
  slug: '',
  image: '',
  rating: 5.0,
  description: '',
  variantOrder: ['250g', '500g'],
  variants: { '250g': { label: '250g', weight: '250g', price: 399, stock: 0 }, '500g': { label: '500g', weight: '500g', price: 699, stock: 0 } },
  active: true,
});

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});

  const fetchProducts = () => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => { setProducts(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openEdit = (p: Product) => { setEditing(p); setForm({ ...p }); };
  const openAdd = () => { setAdding(true); setForm(defaultProduct()); };

  const saveProduct = async () => {
    const isNew = !form.id || !products.find((p) => p.id === form.id);
    const url = isNew ? '/api/products' : `/api/products/${form.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast(isNew ? 'Product created' : 'Product updated');
      setEditing(null); setAdding(false); fetchProducts();
    } catch (err: any) {
      toast(err.message || 'Failed to save product');
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, active: !p.active }),
      });
      if (!res.ok) throw new Error();
      toast(p.active ? 'Deactivated' : 'Activated');
      fetchProducts();
    } catch { toast('Failed to update'); }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>Loading products…</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={openAdd} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>+ Add Product</button>
      </div>

      {products.length === 0
        ? <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>No products yet.</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {products.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 10, padding: '12px 18px', boxShadow: '0 1px 4px rgba(58,36,26,0.05)', opacity: p.active ? 1 : 0.45 }}>
                <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'contain', background: '#f9f6ef' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#3A241A' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(58,36,26,0.4)', marginTop: 1 }}>{p.type} · {Object.keys(p.variants).length} variants{Object.values(p.variants).some((v: Variant) => v.stock <= 5 && v.stock >= 0) && <span style={{ color: '#dc2626', marginLeft: 6 }}>· Low stock!</span>}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 10, background: p.active ? '#e8f5e9' : '#fce4ec', color: p.active ? '#2e7d32' : '#c62828' }}>{p.active ? 'Active' : 'Inactive'}</span>
                <button onClick={() => toggleActive(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#8B7355', padding: '4px 8px' }}>{p.active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => openEdit(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#eab704', fontWeight: 600, padding: '4px 8px' }}>Edit</button>
              </div>
            ))}
          </div>
      }

      {(editing || adding) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => { setEditing(null); setAdding(false); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3A241A', marginBottom: 20 }}>{adding ? 'Add Product' : 'Edit Product'}</h3>

            <div className="form-group"><label>ID (slug-like)</label><input type="text" value={form.id || ''} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={!adding} /></div>
            <div className="form-group"><label>Name</label><input type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Slug</label><input type="text" value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="form-group"><label>Type</label>
              <select value={form.type || 'wild'} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(58,36,26,0.12)', fontSize: 14, background: '#fff' }}>
                <option value="wild">Wild</option>
                <option value="medicinal">Medicinal</option>
              </select>
            </div>
            <div className="form-group"><label>Image URL</label><input type="text" value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="form-group"><label>Rating</label><input type="number" step="0.1" min="0" max="5" value={form.rating || 5} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Description</label><textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-group"><label>Variant Order (comma-separated)</label><input type="text" value={(form.variantOrder || []).join(', ')} onChange={(e) => setForm({ ...form, variantOrder: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></div>

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3A241A', display: 'block', marginBottom: 8 }}>Variants</label>
              {Object.entries(form.variants || {}).map(([key, v]) => (
                <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(58,36,26,0.12)', fontSize: 13 }} type="text" value={v.label} placeholder="Label" onChange={(e) => setForm({ ...form, variants: { ...form.variants, [key]: { ...v, label: e.target.value } } })} />
                  <input style={{ width: 70, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(58,36,26,0.12)', fontSize: 13 }} type="text" value={v.weight} placeholder="Weight" onChange={(e) => setForm({ ...form, variants: { ...form.variants, [key]: { ...v, weight: e.target.value } } })} />
                  <input style={{ width: 80, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(58,36,26,0.12)', fontSize: 13 }} type="number" value={v.price} placeholder="Price" onChange={(e) => setForm({ ...form, variants: { ...form.variants, [key]: { ...v, price: parseInt(e.target.value) || 0 } } })} />
                  <input style={{ width: 65, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(58,36,26,0.12)', fontSize: 13 }} type="number" value={v.stock ?? 0} placeholder="Stock" onChange={(e) => setForm({ ...form, variants: { ...form.variants, [key]: { ...v, stock: parseInt(e.target.value) || 0 } } })} />
                </div>
              ))}
              <button onClick={() => { const k = `variant_${Date.now()}`; setForm({ ...form, variants: { ...form.variants, [k]: { label: '', weight: '', price: 0, stock: 0 } } }); }} style={{ padding: '6px 14px', border: '1px dashed rgba(58,36,26,0.2)', borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: 12, color: '#8B7355' }}>+ Add variant</button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={saveProduct} className="btn btn-primary" style={{ flex: 1 }}>{adding ? 'Create Product' : 'Save Changes'}</button>
              <button onClick={() => { setEditing(null); setAdding(false); }} style={{ padding: '10px 20px', border: '1px solid rgba(58,36,26,0.12)', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#3A241A' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
