/**
 * Submit Petition Page
 * Full petition submission form with file upload, category selection,
 * and AI classification results display.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSend, FiCheckCircle, FiCpu, FiAlertTriangle } from 'react-icons/fi';
import { createPetition } from '../services/api';
import { CATEGORIES, PRIORITY_CONFIG } from '../utils/helpers';
import FileUpload from '../components/common/FileUpload';
import Loader from '../components/common/Loader';

export default function SubmitPetition() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    file: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (file) => {
    setForm({ ...form, file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in the title and description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      if (form.category) formData.append('category', form.category);
      if (form.file) formData.append('file', form.file);

      const data = await createPetition(formData);
      setResult(data);
      setShowResult(true);
      toast.success('Petition submitted successfully!');
    } catch (err) {
      const message = err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to submit petition.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show AI classification result after submission
  if (showResult && result) {
    const priority = PRIORITY_CONFIG[result.petition.priority] || PRIORITY_CONFIG.medium;
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="glass-card p-8 text-center animate-slide-up">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16, 185, 129, 0.15)' }}
          >
            <FiCheckCircle size={32} style={{ color: '#10b981' }} />
          </div>

          <h2
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9' }}
          >
            Petition Submitted!
          </h2>
          <p className="text-sm mb-8" style={{ color: '#94a3b8' }}>
            Your petition has been received and classified by our AI engine.
          </p>

          {/* AI Classification Results */}
          <div
            className="rounded-xl p-6 mb-6 text-left"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 132, 255, 0.1)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <FiCpu style={{ color: '#3384ff' }} />
              <span className="text-sm font-semibold" style={{ color: '#3384ff' }}>
                AI Analysis Results
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: '#64748b' }}>Category</p>
                <p className="text-sm font-semibold capitalize" style={{ color: '#e2e8f0' }}>
                  {result.ai_classification.category.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#64748b' }}>Confidence</p>
                <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                  {Math.round(result.ai_classification.confidence * 100)}%
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#64748b' }}>Priority</p>
                <p className="text-sm font-semibold" style={{ color: priority.color }}>
                  {priority.icon} {priority.label}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#64748b' }}>Priority Score</p>
                <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                  {result.priority_analysis.score} / 100
                </p>
              </div>
            </div>

            {/* Score Breakdown */}
            {result.priority_analysis.breakdown && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(51, 132, 255, 0.1)' }}>
                <p className="text-xs mb-2" style={{ color: '#64748b' }}>Score Breakdown</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(result.priority_analysis.breakdown).map(([key, val]) => (
                    <span
                      key={key}
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{
                        background: 'rgba(51, 132, 255, 0.1)',
                        color: '#94a3b8',
                      }}
                    >
                      {key}: +{val}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setShowResult(false);
                setResult(null);
                setForm({ title: '', description: '', category: '', file: null });
              }}
              className="btn-secondary"
            >
              Submit Another
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="mb-8 animate-slide-up">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9' }}
        >
          Submit a Petition
        </h1>
        <p style={{ color: '#64748b' }}>
          Describe your concern in detail. Our AI will automatically classify and prioritize it.
        </p>
      </div>

      {/* Petition Form */}
      <form
        onSubmit={handleSubmit}
        className="glass-card p-6 sm:p-8 space-y-6 animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
            Petition Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Urgent road repair needed on Main Street"
            className="input-field"
            id="petition-title"
            maxLength={200}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
            Category <span className="text-xs" style={{ color: '#64748b' }}>(optional — AI will classify automatically)</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input-field"
            id="petition-category"
            style={{ cursor: 'pointer' }}
          >
            <option value="">Let AI decide...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
            Description <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail. Include location, severity, duration, and any other relevant information..."
            className="input-field"
            id="petition-description"
            rows={6}
            style={{ resize: 'vertical', minHeight: '120px' }}
          />
          <p className="text-xs mt-1" style={{ color: '#475569' }}>
            {form.description.length} characters • More detail helps AI classify and prioritize better.
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
            Attachment <span className="text-xs" style={{ color: '#64748b' }}>(optional)</span>
          </label>
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* AI Notice */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: 'rgba(51, 132, 255, 0.05)',
            border: '1px solid rgba(51, 132, 255, 0.1)',
          }}
        >
          <FiCpu className="mt-0.5 shrink-0" style={{ color: '#3384ff' }} />
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            Upon submission, PETRA's AI engine will analyze your petition text to automatically
            determine its category and assign a priority score based on urgency, severity, and sentiment.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center py-3.5 text-base"
          id="submit-petition-button"
          style={{ opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? (
            <>
              <div
                className="w-5 h-5 rounded-full animate-spin"
                style={{
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                }}
              />
              Analyzing & Submitting...
            </>
          ) : (
            <>
              <FiSend />
              Submit Petition
            </>
          )}
        </button>
      </form>
    </div>
  );
}
