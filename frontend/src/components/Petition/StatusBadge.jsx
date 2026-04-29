/**
 * StatusBadge Component
 * Displays petition status with color-coded styling.
 */
import { STATUS_CONFIG } from '../../utils/helpers';

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}22`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: config.color }}
      />
      {config.label}
    </span>
  );
}
