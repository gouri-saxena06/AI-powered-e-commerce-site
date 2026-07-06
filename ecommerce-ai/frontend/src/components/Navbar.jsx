import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-panel">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-700 tracking-tight text-ink">
          market<span className="text-market-500">flow</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-ink/70 hover:text-market-600">Admin</Link>
          )}
          {user && (
            <Link to="/orders" className="text-ink/70 hover:text-market-600">Orders</Link>
          )}
          <Link to="/cart" className="relative text-ink/70 hover:text-market-600">
            Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-amber-500 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-ink/70 hover:text-market-600"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-ink text-paper px-4 py-2 rounded-card hover:bg-market-600 transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
