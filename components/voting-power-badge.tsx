import TokenAmount from '@/components/token-amount'

interface VotingPowerBadgeProps {
  stake: number
  totalVotingPower?: number
  variant?: 'compact' | 'expanded'
  className?: string
}

export default function VotingPowerBadge({
  stake,
  totalVotingPower,
  variant = 'compact',
  className = '',
}: VotingPowerBadgeProps) {
  const pct = totalVotingPower && totalVotingPower > 0
    ? ((stake / totalVotingPower) * 100).toFixed(2)
    : null

  if (stake === 0) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border ${className}`}
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border-default)',
          color: 'var(--text-muted)',
        }}
      >
        No Voting Power
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border ${className}`}
        style={{
          background: 'var(--info-bg)',
          borderColor: '#BFDBFE',
          color: 'var(--info)',
        }}
      >
        <span style={{ fontSize: '10px' }}>⚡</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
          {stake.toLocaleString()} VP
        </span>
      </span>
    )
  }

  return (
    <div
      className={`p-4 rounded border ${className}`}
      style={{ background: 'var(--info-bg)', borderColor: '#BFDBFE' }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Your Voting Power
      </p>
      <TokenAmount amount={stake} size="lg" />
      {pct !== null && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {pct}% of total
        </p>
      )}
    </div>
  )
}
