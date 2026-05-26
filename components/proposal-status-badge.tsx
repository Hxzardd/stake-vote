type ProposalStatus = 'voting' | 'ended' | 'deployed' | 'snapshot_taken' | 'draft' | string

interface ProposalStatusBadgeProps {
  status?: ProposalStatus
  className?: string
}

const STATUS_CONFIG: Record<string, { label: string; dotColor: string; bg: string; border: string; textColor: string; pulse: boolean }> = {
  voting: {
    label: 'VOTING LIVE',
    dotColor: 'var(--success)',
    bg: 'var(--success-bg)',
    border: '#86EFAC',
    textColor: 'var(--success)',
    pulse: true,
  },
  ended: {
    label: 'VOTING CLOSED',
    dotColor: 'var(--text-muted)',
    bg: 'var(--bg-elevated)',
    border: 'var(--border-default)',
    textColor: 'var(--text-secondary)',
    pulse: false,
  },
  deployed: {
    label: 'AWAITING START',
    dotColor: 'var(--tx-confirming)',
    bg: 'var(--warning-bg)',
    border: '#FDE68A',
    textColor: 'var(--warning)',
    pulse: false,
  },
  snapshot_taken: {
    label: 'SNAPSHOT TAKEN',
    dotColor: 'var(--info)',
    bg: 'var(--info-bg)',
    border: '#BFDBFE',
    textColor: 'var(--info)',
    pulse: false,
  },
  draft: {
    label: 'DRAFT',
    dotColor: 'var(--text-muted)',
    bg: 'var(--bg-elevated)',
    border: 'var(--border-default)',
    textColor: 'var(--text-muted)',
    pulse: false,
  },
}

export default function ProposalStatusBadge({ status = '', className = '' }: ProposalStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN',
    dotColor: 'var(--text-muted)',
    bg: 'var(--bg-elevated)',
    border: 'var(--border-default)',
    textColor: 'var(--text-muted)',
    pulse: false,
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border tracking-wide ${className}`}
      style={{ background: config.bg, borderColor: config.border, color: config.textColor, letterSpacing: '0.06em' }}
    >
      <span
        className={config.pulse ? 'tx-pending-pulse' : ''}
        style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: config.dotColor, flexShrink: 0 }}
      />
      {config.label}
    </span>
  )
}
