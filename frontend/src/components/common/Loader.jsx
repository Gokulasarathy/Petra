/**
 * Loader Component
 * Animated loading spinner with PETRA branding.
 */
export default function Loader({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: { spinner: 24, border: 3 },
    md: { spinner: 40, border: 4 },
    lg: { spinner: 56, border: 5 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className="rounded-full animate-spin"
        style={{
          width: s.spinner,
          height: s.spinner,
          border: `${s.border}px solid rgba(51, 132, 255, 0.15)`,
          borderTopColor: '#3384ff',
        }}
      />
      {text && (
        <span className="text-sm" style={{ color: '#64748b' }}>
          {text}
        </span>
      )}
    </div>
  );
}
