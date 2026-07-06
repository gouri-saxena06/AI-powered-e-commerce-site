import React, { useEffect, useState } from 'react';
import client from '../api/client.js';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    client.get('/checkout/orders/mine').then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-2xl font-700 mb-6">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-ink/50">No orders yet.</p>
      ) : (
        <div className="divide-y divide-panel">
          {orders.map((o) => (
            <div key={o.id} className="py-4 flex items-center justify-between">
              <div>
                <p className="font-display font-600">Order #{o.id}</p>
                <p className="text-sm text-ink/50">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                o.status === 'paid' ? 'bg-market-100 text-market-600' : 'bg-panel text-ink/60'
              }`}>
                {o.status}
              </span>
              <span className="font-display font-600">${Number(o.total).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
