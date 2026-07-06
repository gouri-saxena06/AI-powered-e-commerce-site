import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="group bg-white rounded-card border border-panel overflow-hidden flex flex-col">
      <Link to={`/products/${product.id}`} className="block aspect-square overflow-hidden bg-panel">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-xs uppercase tracking-wide text-market-600 font-medium">
          {product.category}
        </span>
        <Link to={`/products/${product.id}`} className="font-display font-600 text-ink leading-snug">
          {product.name}
        </Link>
        <p className="text-sm text-ink/60 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-display font-600 text-lg">${Number(product.price).toFixed(2)}</span>
          <button
            onClick={() => addItem(product, 1)}
            className="text-sm bg-ink text-paper px-3 py-1.5 rounded-card hover:bg-market-600 transition-colors"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
