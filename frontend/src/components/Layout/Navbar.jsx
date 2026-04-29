/**
 * Navbar Component
 * Main navigation bar with glassmorphism styling, responsive design, and auth controls.
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { FiSend, FiBarChart2, FiHome, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home', icon: <FiHome /> },
  { to: '/submit', label: 'Submit Petition', icon: <FiSend />, requiresAuth: true },
  { to: '/dashboard', label: 'Dashboard', icon: <FiBarChart2 /> },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  // Filter nav links based on auth state
  const visibleLinks = navLinks.filter(link => !link.requiresAuth || isAuthenticated);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(51, 132, 255, 0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #3384ff, #d946ef)',
              }}
            >
              P
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                fontFamily: 'Outfit, sans-serif',
                background: 'linear-gradient(135deg, #3384ff, #d946ef)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PETRA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 no-underline"
                  style={{
                    color: isActive ? '#3384ff' : '#94a3b8',
                    background: isActive ? 'rgba(51, 132, 255, 0.1)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.target.style.color = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.target.style.color = '#94a3b8';
                  }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}

            {/* Auth Section */}
            <div
              className="ml-3 pl-3 flex items-center gap-2"
              style={{ borderLeft: '1px solid rgba(51, 132, 255, 0.15)' }}
            >
              {isAuthenticated ? (
                <>
                  {/* User badge */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
                    style={{
                      background: 'rgba(51, 132, 255, 0.08)',
                      border: '1px solid rgba(51, 132, 255, 0.15)',
                      color: '#94a3b8',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #3384ff, #d946ef)',
                        fontSize: '10px',
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ color: '#e2e8f0' }}>{user?.name}</span>
                  </div>
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-transparent border-none cursor-pointer transition-all duration-200"
                    style={{ color: '#64748b' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                    id="logout-button"
                  >
                    <FiLogOut size={14} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium no-underline transition-all duration-200"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <FiLogIn size={14} />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-xs px-4 py-2 no-underline"
                  >
                    <FiUser size={14} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-2xl bg-transparent border-none cursor-pointer"
            style={{ color: '#94a3b8' }}
            onClick={() => setIsOpen(!isOpen)}
            id="mobile-menu-button"
          >
            {isOpen ? <HiX /> : <HiOutlineMenuAlt3 />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="md:hidden animate-slide-up"
          style={{
            background: 'rgba(2, 6, 23, 0.95)',
            borderTop: '1px solid rgba(51, 132, 255, 0.1)',
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {visibleLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline"
                  style={{
                    color: isActive ? '#3384ff' : '#94a3b8',
                    background: isActive ? 'rgba(51, 132, 255, 0.1)' : 'transparent',
                  }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile Auth */}
            <div style={{ borderTop: '1px solid rgba(51, 132, 255, 0.1)', paddingTop: '8px', marginTop: '8px' }}>
              {isAuthenticated ? (
                <>
                  <div
                    className="flex items-center gap-2 px-4 py-3 text-sm"
                    style={{ color: '#94a3b8' }}
                  >
                    <FiUser size={14} style={{ color: '#3384ff' }} />
                    <span style={{ color: '#e2e8f0' }}>{user?.name}</span>
                    <span className="text-xs" style={{ color: '#475569' }}>({user?.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full bg-transparent border-none cursor-pointer text-left"
                    style={{ color: '#ef4444' }}
                  >
                    <FiLogOut size={14} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline"
                    style={{ color: '#94a3b8' }}
                  >
                    <FiLogIn size={14} />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline"
                    style={{ color: '#3384ff' }}
                  >
                    <FiUser size={14} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
