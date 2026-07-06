import React, { useEffect, useState } from 'react';
import client from '../api/client.js';

const emptyForm = { name: '', description: '', price: '', image_url: '', category: 'general', stock: 0 };

export default function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  function loadProducts() {
    client.get('/products').then(({ data }) => setProducts(data));
  }
  function loadOrders() {
    client.get('/checkout/orders/all').then(({ data }) => setOrders(data));
  }

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function generateDescription() {
    if (!form.name) return;
    setAiLoading(true);
    try {
      const { data } = await client.post('/ai/generate-description', {
        name: form.name, category: form.category, keywords: aiKeywords,
      });
      updateField('description', data.description);
    } catch (err) {
      alert('AI description generation failed. Check your Gemini API key.');
    } finally {
      setAiLoading(false);
    }
  }

  async function submitProduct(e) {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) || 0 };
    if (editingId) {
      await client.put(`/products/${editingId}`, payload);
    } else {
      await client.post('/products', payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    loadProducts();
  }

  function editProduct(p) {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description, price: p.price,
      image_url: p.image_url, category: p.category, stock: p.stock,
    });
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    await client.delete(`/products/${id}`);
    loadProducts();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-700 mb-6">Admin dashboard</h1>

      <div className="flex gap-2 mb-8">
        {['products', 'orders'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-card text-sm capitalize ${tab === t ? 'bg-ink text-paper' : 'bg-panel text-ink/70'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="grid sm:grid-cols-2 gap-10">
          <form onSubmit={submitProduct} className="space-y-3 bg-white border border-panel rounded-card p-5">
            <h2 className="font-display font-600 mb-2">{editingId ? 'Edit product' : 'New product'}</h2>
            <input placeholder="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-panel rounded-card text-sm" required />

            <div className="flex gap-2">
              <input placeholder="AI keywords (optional)" value={aiKeywords} onChange={(e) => setAiKeywords(e.target.value)}
                className="flex-1 px-3 py-2 border border-panel rounded-card text-sm" />
              <button type="button" onClick={generateDescription} disabled={aiLoading}
                className="text-sm bg-amber-500 text-white px-3 py-2 rounded-card hover:bg-amber-600 disabled:opacity-50 whitespace-nowrap">
                {aiLoading ? 'Writing…' : '✦ AI write'}
              </button>
            </div>

            <textarea placeholder="Description" value={form.description} onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-3 py-2 border border-panel rounded-card text-sm" rows={3} required />
            <div className="flex gap-2">
              <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => updateField('price', e.target.value)}
                className="w-1/2 px-3 py-2 border border-panel rounded-card text-sm" required />
              <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => updateField('stock', e.target.value)}
                className="w-1/2 px-3 py-2 border border-panel rounded-card text-sm" />
            </div>
            <input placeholder="Category" value={form.category} onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-3 py-2 border border-panel rounded-card text-sm" />
            <input placeholder="Image URL" value={form.image_url} onChange={(e) => updateField('image_url', e.target.value)}
              className="w-full px-3 py-2 border border-panel rounded-card text-sm" />

            <div className="flex gap-2 pt-2">
              <button className="flex-1 bg-ink text-paper py-2 rounded-card hover:bg-market-600 transition-colors">
                {editingId ? 'Save changes' : 'Create product'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}
                  className="px-4 py-2 rounded-card border border-panel text-sm">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3 max-h-[32rem] overflow-y-auto">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white border border-panel rounded-card p-3">
                <img src={p.image_url} className="w-12 h-12 rounded-card object-cover bg-panel" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-ink/50">${Number(p.price).toFixed(2)} · {p.stock} in stock</p>
                </div>
                <button onClick={() => editProduct(p)} className="text-xs text-market-600 font-medium">Edit</button>
                <button onClick={() => deleteProduct(p.id)} className="text-xs text-red-500 font-medium">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="divide-y divide-panel bg-white border border-panel rounded-card">
          {orders.length === 0 ? (
            <p className="p-5 text-ink/50 text-sm">No orders yet.</p>
          ) : orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-5 py-3">
              <span className="font-medium text-sm">Order #{o.id}</span>
              <span className="text-xs text-ink/50">{new Date(o.created_at).toLocaleString()}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                o.status === 'paid' ? 'bg-market-100 text-market-600' : 'bg-panel text-ink/60'
              }`}>{o.status}</span>
              <span className="font-display font-600 text-sm">${Number(o.total).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
