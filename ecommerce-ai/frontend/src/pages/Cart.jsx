import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import client from '../api/client.js';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function checkout() {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await client.post('/checkout/create-session', {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed. Check your Stripe key in the backend .env.');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <div className="max-w-3xl mx-auto px-6 py-16 text-ink/50">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-2xl font-700 mb-6">Your cart</h1>
      <div className="divide-y divide-panel">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-4 py-4">
            <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-card object-cover bg-panel" />
            <div className="flex-1">
              <p className="font-display font-600">{product.name}</p>
              <p className="text-sm text-ink/50">${Number(product.price).toFixed(2)} each</p>
            </div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => updateQuantity(product.id, parseInt(e.target.value, 10) || 1)}
              className="w-16 px-2 py-1 border border-panel rounded-card text-sm"
            />
            <span className="w-20 text-right font-display font-600">
              ${(Number(product.price) * quantity).toFixed(2)}
            </span>
            <button onClick={() => removeItem(product.id)} className="text-ink/40 hover:text-red-500 text-sm ml-2">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={clearCart} className="text-sm text-ink/50 hover:text-red-500">Clear cart</button>
        <div className="text-right">
          <p className="text-ink/50 text-sm">Total</p>
          <p className="font-display text-2xl font-700">${total.toFixed(2)}</p>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <button
        onClick={checkout}
        disabled={loading}
        className="w-full mt-6 bg-ink text-paper py-3 rounded-card hover:bg-market-600 transition-colors disabled:opacity-50"
      >
        {loading ? 'Redirecting to Stripe…' : 'Checkout with Stripe'}
      </button>
    </div>
  );
}
