'use client'

export type TxState = 'pending' | 'confirming' | 'finalized' | 'failed'

interface TxStatusProps {
  state: TxState
  className?: string
}

const CONFIG: Record<TxState, { label: string; dotColor: string; textColor: string; bg: string; border: string; pulse: boolean }> = {
  pending: {
    label: 'Awaiting confirmation...',
    dotColor: 'var(--tx-pending)',
    textColor: 'var(--tx-pending)',
    bg: 'var(--info-bg)',
    border: '#BFDBFE',
    pulse: true,
  },
  confirming: {
    label: '1 confirmation...',
    dotColor: 'var(--tx-confirming)',
    textColor: 'var(--tx-confirming)',
    bg: 'var(--warning-bg)',
    border: '#FDE68A',
    pulse: false,
  },
  finalized: {
    label: 'Confirmed on Polygon',
    dotColor: 'var(--tx-finalized)',
    textColor: 'var(--tx-finalized)',
    bg: 'var(--success-bg)',
    border: '#86EFAC',
    pulse: false,
  },
  failed: {
    label: 'Transaction reverted',
    dotColor: 'var(--tx-failed)',
    textColor: 'var(--tx-failed)',
    bg: 'var(--error-bg)',
    border: '#FCA5A5',
    pulse: false,
  },
}

export default function TxStatus({ state, className = '' }: TxStatusProps) {
  const c = CONFIG[state]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded border ${className}`}
      style={{ background: c.bg, borderColor: c.border, color: c.textColor }}
    >
      <span
        className={c.pulse ? 'tx-pending-pulse' : ''}
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: c.dotColor,
          flexShrink: 0,
        }}
      />
      {c.label}
    </span>
  )
}
