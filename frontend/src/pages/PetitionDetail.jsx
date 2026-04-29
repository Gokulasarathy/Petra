/**
 * Petition Detail Page
 * Full petition view with AI results, status timeline, and admin controls.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiCpu, FiPaperclip, FiDownload, FiTrash2,
  FiClock, FiCheckCircle, FiAlertTriangle,
} from 'react-icons/fi';
import { getPetition, updatePetitionStatus, deletePetition } from '../services/api';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, formatDateTime, timeAgo,
} from '../utils/helpers';
import StatusBadge from '../components/Petition/StatusBadge';
import Loader from '../components/common/Loader';

const STATUS_OPTIONS = ['submitted', 'under_review', 'in_progress', 'resolved', 'rejected'];

export default function PetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [petition, setPetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    loadPetition();
  }, [id]);

  const loadPetition = async () => {
    setLoading(true);
    try {
      const data = await getPetition(id);
      setPetition(data.petition);
      setNewStatus(data.petition.status);
    } catch {
      toast.error('Petition not found.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === petition.status) return;
    setUpdating(true);
    try {
      await updatePetitionStatus(id, {
        status: newStatus,
        notes: statusNotes,
      });
      toast.success('Status updated successfully!');
      setStatusNotes('');
      loadPetition(); // Refresh
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this petition?')) return;
    try {
      await deletePetition(id);
      toast.success('Petition deleted.');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete petition.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading petition..." />
      </div>
    );
  }

  if (!petition) return null;

  const priority = PRIORITY_CONFIG[petition.priority] || PRIORITY_CONFIG.medium;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm mb-6 no-underline transition-colors duration-200"
        style={{ color: '#64748b' }}
        onMouseEnter={(e) => e.target.style.color = '#3384ff'}
        onMouseLeave={(e) => e.target.style.color = '#64748b'}
      >
        <FiArrowLeft />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="glass-card p-6 mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs" style={{ color: '#64748b' }}>#{petition.id}</span>
              <StatusBadge status={petition.status} />
              <span className="text-xs font-semibold" style={{ color: priority.color }}>
                {priority.icon} {priority.label}
              </span>
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9' }}
            >
              {petition.title}
            </h1>
          </div>
          <button
            onClick={handleDelete}
            className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-transparent border cursor-pointer transition-colors duration-200"
            style={{
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
            id="delete-petition-button"
          >
            <FiTrash2 size={14} />
            Delete
          </button>
        </div>

        <div className="flex gap-4 text-xs" style={{ color: '#64748b' }}>
          <span>Submitted: {formatDateTime(petition.created_at)}</span>
          {petition.submitter_name && <span>By: {petition.submitter_name}</span>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: '#e2e8f0', fontFamily: 'Outfit, sans-serif' }}
            >
              Description
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#94a3b8' }}>
              {petition.description}
            </p>
          </div>

          {/* File Attachment */}
          {petition.file_path && (
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3
                className="text-sm font-semibold mb-3 flex items-center gap-2"
                style={{ color: '#e2e8f0', fontFamily: 'Outfit, sans-serif' }}
              >
                <FiPaperclip size={14} />
                Attachment
              </h3>
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: 'rgba(51, 132, 255, 0.05)',
                  border: '1px solid rgba(51, 132, 255, 0.1)',
                }}
              >
                <span className="text-sm" style={{ color: '#94a3b8' }}>
                  {petition.file_type?.toUpperCase()} file
                </span>
                <a
                  href={`/api/petitions/${petition.id}/file`}
                  className="flex items-center gap-1 text-sm no-underline"
                  style={{ color: '#3384ff' }}
                >
                  <FiDownload size={14} />
                  Download
                </a>
              </div>
            </div>
          )}

          {/* Status Timeline */}
          {petition.status_history && petition.status_history.length > 0 && (
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <h3
                className="text-sm font-semibold mb-4"
                style={{ color: '#e2e8f0', fontFamily: 'Outfit, sans-serif' }}
              >
                Status Timeline
              </h3>
              <div className="space-y-4">
                {petition.status_history.map((log, i) => {
                  const cfg = STATUS_CONFIG[log.new_status] || STATUS_CONFIG.submitted;
                  return (
                    <div key={log.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full mt-1"
                          style={{ background: cfg.color }}
                        />
                        {i < petition.status_history.length - 1 && (
                          <div
                            className="w-px flex-1 mt-1"
                            style={{ background: 'rgba(51,132,255,0.15)' }}
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
                          {log.old_status ? (
                            <>
                              <span className="capitalize">{log.old_status.replace('_', ' ')}</span>
                              {' → '}
                            </>
                          ) : null}
                          <span style={{ color: cfg.color }} className="capitalize">
                            {log.new_status.replace('_', ' ')}
                          </span>
                        </p>
                        {log.notes && (
                          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{log.notes}</p>
                        )}
                        <p className="text-xs mt-1" style={{ color: '#475569' }}>
                          {timeAgo(log.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* AI Classification */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3
              className="text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: '#e2e8f0', fontFamily: 'Outfit, sans-serif' }}
            >
              <FiCpu size={14} style={{ color: '#3384ff' }} />
              AI Analysis
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs" style={{ color: '#64748b' }}>Category</p>
                <p className="text-sm font-semibold capitalize" style={{ color: '#e2e8f0' }}>
                  {(petition.ai_category || petition.category || 'other').replace('_', ' ')}
                </p>
              </div>
              {petition.ai_confidence != null && (
                <div>
                  <p className="text-xs mb-1" style={{ color: '#64748b' }}>Confidence</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ background: 'rgba(51,132,255,0.1)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(petition.ai_confidence * 100)}%`,
                          background: 'linear-gradient(90deg, #3384ff, #d946ef)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>
                      {Math.round(petition.ai_confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs" style={{ color: '#64748b' }}>Priority Score</p>
                <p className="text-lg font-bold" style={{ color: priority.color }}>
                  {petition.priority_score} <span className="text-xs font-normal" style={{ color: '#64748b' }}>/ 100</span>
                </p>
              </div>
            </div>
          </div>

          {/* Admin Controls — Update Status */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: '#e2e8f0', fontFamily: 'Outfit, sans-serif' }}
            >
              Update Status
            </h3>
            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="input-field text-sm cursor-pointer"
                id="status-select"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s]?.label || s}
                  </option>
                ))}
              </select>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add notes (optional)..."
                className="input-field text-sm"
                rows={3}
                style={{ resize: 'vertical' }}
                id="status-notes"
              />
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === petition.status}
                className="btn-primary w-full justify-center"
                style={{ opacity: (updating || newStatus === petition.status) ? 0.5 : 1 }}
                id="update-status-button"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
