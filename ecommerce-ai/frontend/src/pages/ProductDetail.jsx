import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    client.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  if (!product) return <div className="max-w-4xl mx-auto px-6 py-16 text-ink/50">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid sm:grid-cols-2 gap-10">
      <div className="aspect-square bg-panel rounded-card overflow-hidden">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div>
        <span className="text-xs uppercase tracking-wide text-market-600 font-medium">{product.category}</span>
        <h1 className="font-display text-3xl font-700 mt-2">{product.name}</h1>
        <p className="text-ink/60 mt-4 leading-relaxed">{product.description}</p>
        <div className="font-display text-2xl font-700 mt-6">${Number(product.price).toFixed(2)}</div>
        <p className="text-sm text-ink/50 mt-1">{product.stock} in stock</p>

        <div className="flex items-center gap-3 mt-6">
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-20 px-3 py-2 border border-panel rounded-card text-sm"
          />
          <button
            onClick={() => { addItem(product, qty); navigate('/cart'); }}
            className="bg-ink text-paper px-5 py-2.5 rounded-card hover:bg-market-600 transition-colors"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
