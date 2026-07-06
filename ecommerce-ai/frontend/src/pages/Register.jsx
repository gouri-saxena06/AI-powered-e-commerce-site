import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-700 mb-6">Create an account</h1>
      <p className="text-xs text-ink/50 mb-4">The first account created becomes an admin automatically — handy for local setup.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-panel rounded-card text-sm"
        />
        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-panel rounded-card text-sm"
        />
        <input
          type="password" required placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-panel rounded-card text-sm"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-ink text-paper py-2.5 rounded-card hover:bg-market-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-ink/50 mt-4">
        Already have an account? <Link to="/login" className="text-market-600 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
