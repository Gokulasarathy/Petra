/**
 * Register Page
 * Premium glassmorphism registration form matching PETRA's dark theme.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data.user, data.access_token);
      toast.success(`Welcome, ${data.user.name}! Account created.`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0] || 'Registration failed.';
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
          background: 'radial-gradient(circle, #d946ef, transparent)',
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
            <span style={{ color: '#f1f5f9' }}>Join </span>
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
            Create your account to submit and track petitions
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="glass-card p-8 space-y-5"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <FiUser
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                size={16}
                style={{ color: '#64748b' }}
              />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-field pl-10"
                id="register-name"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
              Email Address <span style={{ color: '#ef4444' }}>*</span>
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
                id="register-email"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
              Password <span style={{ color: '#ef4444' }}>*</span>
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
                placeholder="Min 6 characters"
                className="input-field pl-10"
                id="register-password"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
              Confirm Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <FiLock
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                size={16}
                style={{ color: '#64748b' }}
              />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="input-field pl-10"
                id="register-confirm-password"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base"
            id="register-submit"
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
                Creating account...
              </>
            ) : (
              <>
                <FiUserPlus />
                Create Account
              </>
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm" style={{ color: '#64748b' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold no-underline"
              style={{ color: '#3384ff' }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
