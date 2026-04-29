/**
 * Login Page
 * Premium glassmorphism login form matching PETRA's dark theme.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(form);
      login(data.user, data.access_token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0] || 'Login failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #3384ff, transparent)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <span style={{ color: '#f1f5f9' }}>Welcome to </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #3384ff, #d946ef)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PETRA
            </span>
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Sign in to manage and track petitions
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="glass-card p-8 space-y-6"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
              Email Address
            </label>
            <div className="relative">
              <FiMail
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                size={16}
                style={{ color: '#64748b' }}
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field pl-10"
                id="login-email"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
              Password
            </label>
            <div className="relative">
              <FiLock
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                size={16}
                style={{ color: '#64748b' }}
              />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field pl-10"
                id="login-password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base"
            id="login-submit"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <>
                <div
                  className="w-5 h-5 rounded-full animate-spin"
                  style={{
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                  }}
                />
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn />
                Sign In
              </>
            )}
          </button>

          {/* Register Link */}
          <p className="text-center text-sm" style={{ color: '#64748b' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold no-underline"
              style={{ color: '#3384ff' }}
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
