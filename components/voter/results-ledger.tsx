'use client'

import { RefreshCw } from 'lucide-react'
import QuorumMeter from '@/components/voter/quorum-meter'
import { formatPower, percentOf, sumPowers } from '@/lib/format'

interface ResultsLedgerProps {
  yesPower: string
  noPower: string
  totalVotingPower: string
  quorumBps: number
  /** Certified verdict from the database once voting ended. */
  certifiedQuorumMet?: boolean | null
  certified: boolean
  refreshedAt: Date | null
  onRefetch?: () => void
  isRefreshing?: boolean
}

/** Tally as an auditable ledger — rows of power figures, not a chart. */
export default function ResultsLedger({
  yesPower,
  noPower,
  totalVotingPower,
  quorumBps,
  certifiedQuorumMet = null,
  certified,
  refreshedAt,
  onRefetch,
  isRefreshing = false,
}: ResultsLedgerProps) {
  const participating = sumPowers(yesPower, noPower)
  const yesPct = percentOf(yesPower, participating)
  const noPct = percentOf(noPower, participating)

  return (
    <section className="animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xs font-semibold tracking-widest"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
        >
          {certified ? 'CERTIFIED RESULT' : 'LIVE TALLY'}
        </h2>
        {onRefetch && !certified && (
          <button
            onClick={onRefetch}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70 disabled:opacity-50"
            style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>

      <dl className="text-sm mb-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <LedgerRow
          label="YES POWER"
          value={formatPower(yesPower)}
          detail={`${yesPct.toFixed(1)}% of cast`}
          color="var(--vote-yes)"
        />
        <LedgerRow
          label="NO POWER"
          value={formatPower(noPower)}
          detail={`${noPct.toFixed(1)}% of cast`}
          color="var(--vote-no)"
        />
        <LedgerRow label="PARTICIPATING POWER" value={formatPower(participating)} />
        <LedgerRow label="ELIGIBLE POWER" value={formatPower(totalVotingPower)} />
      </dl>

      <QuorumMeter
        participating={participating}
        total={totalVotingPower}
        quorumBps={quorumBps}
        certifiedQuorumMet={certifiedQuorumMet}
      />

      {refreshedAt && (
        <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          refreshed {refreshedAt.toLocaleTimeString()}
        </p>
      )}
    </section>
  )
}

function LedgerRow({
  label,
  value,
  detail,
  color,
}: {
  label: string
  value: string
  detail?: string
  color?: string
}) {
  return (
    <div
      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <dt className="flex items-center gap-2">
        {color && (
          <span
            aria-hidden="true"
            style={{ width: '8px', height: '8px', background: color, display: 'inline-block', borderRadius: '1px' }}
          />
        )}
        <span
          className="text-xs font-semibold tracking-widest"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
        >
          {label}
        </span>
      </dt>
      <dd className="flex items-baseline gap-3">
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
          {value}
        </span>
        {detail && (
          <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {detail}
          </span>
        )}
      </dd>
    </div>
  )
}
