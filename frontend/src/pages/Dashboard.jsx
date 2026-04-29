/**
 * Dashboard Page
 * Analytics overview with stats cards, charts, and recent petitions table.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { FiFileText, FiClock, FiCheckCircle, FiAlertTriangle, FiSearch } from 'react-icons/fi';
import {
  getDashboardStats,
  getStatusDistribution,
  getPriorityDistribution,
  getAllPetitions,
} from '../services/api';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, truncate } from '../utils/helpers';
import StatusBadge from '../components/Petition/StatusBadge';
import Loader from '../components/common/Loader';

// Chart color palette
const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];
const PRIORITY_COLORS = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [statusDist, setStatusDist] = useState([]);
  const [priorityDist, setPriorityDist] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, statusRes, priorityRes, petitionsRes] = await Promise.all([
        getDashboardStats(),
        getStatusDistribution(),
        getPriorityDistribution(),
        getAllPetitions({ per_page: 50 }),
      ]);
      setStats(statsRes.stats);
      setStatusDist(statusRes.distribution);
      setPriorityDist(priorityRes.distribution);
      setPetitions(petitionsRes.petitions);
    } catch {
      // Backend may not be running
    } finally {
      setLoading(false);
    }
  };

  // Filter petitions
  const filtered = petitions.filter((p) => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Petitions', value: stats?.total || 0, icon: <FiFileText />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Pending', value: stats?.pending || 0, icon: <FiClock />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Resolved', value: stats?.resolved || 0, icon: <FiCheckCircle />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Critical', value: stats?.critical || 0, icon: <FiAlertTriangle />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  ];

  // Custom tooltip for charts
  const ChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="px-3 py-2 rounded-lg text-xs"
          style={{
            background: '#1e293b',
            border: '1px solid rgba(51,132,255,0.2)',
            color: '#e2e8f0',
          }}
        >
          <span className="font-semibold capitalize">
            {payload[0].name?.replace('_', ' ')}
          </span>
          : {payload[0].value}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9' }}
        >
          Dashboard
        </h1>
        <p style={{ color: '#64748b' }}>
          Real-time petition analytics and monitoring overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="glass-card p-5 animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
              {card.label === 'Resolved' && stats?.resolution_rate > 0 && (
                <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                  {stats.resolution_rate}%
                </span>
              )}
            </div>
            <p
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9' }}
            >
              {card.value}
            </p>
            <p className="text-xs" style={{ color: '#64748b' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution Pie Chart */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#e2e8f0' }}
          >
            Status Distribution
          </h3>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusDist.map(d => ({
                    ...d,
                    name: (STATUS_CONFIG[d.status]?.label || d.status),
                  }))}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {statusDist.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color: '#475569' }}>
              No data yet. Submit petitions to see analytics.
            </div>
          )}
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h3
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#e2e8f0' }}
          >
            Priority Distribution
          </h3>
          {priorityDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityDist} barCategoryGap="20%">
                <XAxis
                  dataKey="priority"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityDist.map((entry) => (
                    <Cell
                      key={entry.priority}
                      fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color: '#475569' }}>
              No data yet. Submit petitions to see analytics.
            </div>
          )}
        </div>
      </div>

      {/* Petitions Table */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3
            className="text-lg font-semibold"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#e2e8f0' }}
          >
            All Petitions
          </h3>
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2"
                size={14}
                style={{ color: '#64748b' }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 text-sm"
                style={{ width: '200px' }}
                id="search-petitions"
              />
            </div>
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field text-sm cursor-pointer"
              style={{ width: '150px' }}
              id="filter-status"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr>
                {['ID', 'Title', 'Category', 'Priority', 'Status', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold px-4 py-3"
                    style={{ color: '#64748b' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const priCfg = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <tr
                      key={p.id}
                      className="cursor-pointer transition-colors duration-150"
                      style={{ background: 'rgba(15, 23, 42, 0.3)' }}
                      onClick={() => {}}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.background = 'rgba(51, 132, 255, 0.05)'
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.3)'
                      }
                    >
                      <td className="px-4 py-3 text-sm" style={{ color: '#64748b' }}>
                        #{p.id}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/petition/${p.id}`}
                          className="text-sm font-medium no-underline"
                          style={{ color: '#e2e8f0' }}
                        >
                          {truncate(p.title, 40)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs capitalize px-2 py-1 rounded-lg"
                          style={{
                            background: 'rgba(51,132,255,0.1)',
                            color: '#94a3b8',
                          }}
                        >
                          {(p.category || 'other').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: priCfg.color }}>
                          {priCfg.icon} {priCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>
                        {formatDate(p.created_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm"
                    style={{ color: '#475569' }}
                  >
                    {petitions.length === 0
                      ? 'No petitions yet. Submit one to get started!'
                      : 'No petitions match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
