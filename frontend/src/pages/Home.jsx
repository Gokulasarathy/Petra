/**
 * Home Page
 * Hero section, feature cards, and statistics counter.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSend, FiBarChart2, FiCpu, FiShield, FiGlobe, FiTrendingUp } from 'react-icons/fi';
import { getDashboardStats } from '../services/api';

const features = [
  {
    icon: <FiSend size={28} />,
    title: 'Submit Petitions',
    desc: 'Submit petitions with text descriptions and file attachments. Support for PDF documents and audio recordings.',
    gradient: 'linear-gradient(135deg, #3384ff, #1b64f5)',
  },
  {
    icon: <FiCpu size={28} />,
    title: 'AI Classification',
    desc: 'Automatic NLP-powered classification of petitions into categories with confidence scoring and sentiment analysis.',
    gradient: 'linear-gradient(135deg, #d946ef, #a21caf)',
  },
  {
    icon: <FiTrendingUp size={28} />,
    title: 'Priority Scoring',
    desc: 'Intelligent priority assignment based on category severity, urgency keywords, and sentiment intensity.',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  {
    icon: <FiBarChart2 size={28} />,
    title: 'Live Dashboard',
    desc: 'Real-time analytics with status distribution charts, priority insights, and submission timeline trends.',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  {
    icon: <FiShield size={28} />,
    title: 'Status Tracking',
    desc: 'Full audit trail for every petition — track status changes from submission to resolution with timestamps.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  },
  {
    icon: <FiGlobe size={28} />,
    title: 'Cloud Ready',
    desc: 'Built for Azure deployment with App Service, Blob Storage, and Azure SQL support out of the box.',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  },
];

export default function Home() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data.stats))
      .catch(() => {}); // Silently fail if backend not running
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(51, 132, 255, 0.15), transparent)',
          }}
        />
        <div
          className="absolute top-1/4 -left-32 w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #3384ff, transparent)',
            filter: 'blur(60px)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #d946ef, transparent)',
            filter: 'blur(80px)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 animate-fade-in"
            style={{
              background: 'rgba(51, 132, 255, 0.1)',
              border: '1px solid rgba(51, 132, 255, 0.2)',
              color: '#3384ff',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: '#10b981',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            />
            AI-Powered Petition Management
          </div>

          {/* Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up"
            style={{
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.1,
            }}
          >
            <span style={{ color: '#f1f5f9' }}>Manage Petitions</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #3384ff, #d946ef)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              with Intelligence
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{
              color: '#94a3b8',
              animationDelay: '0.1s',
              lineHeight: 1.7,
            }}
          >
            PETRA uses AI to automatically classify, prioritize, and track citizen petitions.
            From submission to resolution — every step monitored in real-time.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Link to="/submit" className="btn-primary text-base px-8 py-3 no-underline">
              <FiSend />
              Submit a Petition
            </Link>
            <Link to="/dashboard" className="btn-secondary text-base px-8 py-3 no-underline">
              <FiBarChart2 />
              View Dashboard
            </Link>
          </div>

          {/* Live Stats Counter */}
          <div
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            {[
              { value: stats.total, label: 'Total Petitions' },
              { value: stats.resolved, label: 'Resolved' },
              { value: stats.pending, label: 'Pending' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-3xl font-bold mb-1"
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    background: 'linear-gradient(135deg, #3384ff, #d946ef)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: '#64748b' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9' }}
          >
            Everything You Need
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#64748b' }}>
            A complete petition management ecosystem powered by artificial intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-card-hover p-6"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4"
                style={{ background: feature.gradient }}
              >
                {feature.icon}
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: '#e2e8f0', fontFamily: 'Outfit, sans-serif' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-center py-8"
        style={{ borderTop: '1px solid rgba(51, 132, 255, 0.08)' }}
      >
        <p className="text-sm" style={{ color: '#475569' }}>
          © {new Date().getFullYear()} PETRA — Cloud-Based Petition Management System
        </p>
      </footer>
    </div>
  );
}
