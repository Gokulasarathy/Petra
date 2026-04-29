/**
 * Utility helper functions for PETRA frontend
 */

/**
 * Format a date string to a readable locale format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date string to include time
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
};

/**
 * Map status to display-friendly info
 */
export const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  under_review: { label: 'Under Review', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  in_progress: { label: 'In Progress', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  resolved: { label: 'Resolved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

/**
 * Map priority to display-friendly info
 */
export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: '🔴' },
  high: { label: 'High', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: '🟠' },
  medium: { label: 'Medium', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: '🔵' },
  low: { label: 'Low', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: '🟢' },
};

/**
 * Available petition categories
 */
export const CATEGORIES = [
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'corruption', label: 'Corruption' },
  { value: 'public_safety', label: 'Public Safety' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'environment', label: 'Environment' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' },
];

/**
 * Truncate text to a max length
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
