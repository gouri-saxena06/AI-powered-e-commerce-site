import React, { useEffect, useState } from 'react';
import client from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    client.get('/products', { params })
      .then(({ data }) => setProducts(data))
      .finally(() => setLoading(false));
  }, [category, search]);

  const categories = ['electronics', 'home', 'apparel', 'accessories'];

  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <span className="text-market-600 text-sm font-medium uppercase tracking-wide">AI-assisted shopping</span>
        <h1 className="font-display text-4xl sm:text-5xl font-700 text-ink mt-2 max-w-xl leading-tight">
          Find the right thing, faster — with a little help from AI.
        </h1>
        <p className="text-ink/60 mt-4 max-w-lg">
          Browse the catalog, or tap the ✦ assistant in the corner to ask for a
          recommendation grounded in what's actually in stock.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="px-4 py-2 rounded-card border border-panel text-sm w-56 focus:outline-none focus:ring-2 focus:ring-market-400"
          />
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-card text-sm ${category === '' ? 'bg-ink text-paper' : 'bg-panel text-ink/70'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-card text-sm capitalize ${category === c ? 'bg-ink text-paper' : 'bg-panel text-ink/70'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="text-ink/50 text-sm">No products found. Try the admin dashboard to add some, or run the seed script.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
