import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    clearCart();
    if (orderId) {
      client.get(`/checkout/orders/${orderId}`).then(({ data }) => setOrder(data)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-market-100 text-market-600 flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
      <h1 className="font-display text-2xl font-700">Payment successful</h1>
      <p className="text-ink/60 mt-2">
        {order ? `Order #${order.order.id} — $${Number(order.order.total).toFixed(2)}` : `Order #${orderId}`}
      </p>
      <Link to="/" className="inline-block mt-8 bg-ink text-paper px-5 py-2.5 rounded-card hover:bg-market-600 transition-colors">
        Continue shopping
      </Link>
    </div>
  );
}
