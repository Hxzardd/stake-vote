import { statusMeta, type ProposalStatus } from '@/lib/status'

interface StatusBadgeProps {
  status: ProposalStatus
  className?: string
}

/** Stamped, mono status label — the same vocabulary on every surface. */
export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const meta = statusMeta(status)
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold tracking-widest ${className}`}
      style={{
        fontFamily: 'var(--font-mono)',
        color: meta.color,
        background: meta.bg,
        border: `1px solid ${meta.color}33`,
        borderRadius: 'var(--radius-sm)',
        letterSpacing: '0.08em',
      }}
    >
      {meta.label}
    </span>
  )
}
