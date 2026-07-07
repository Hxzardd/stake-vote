'use client'

import { percentOf } from '@/lib/format'
import { quorumVerdictLabel } from '@/lib/status'

interface QuorumMeterProps {
  /** Sum of votes cast (yes + no), decimal string. */
  participating: string
  /** Total eligible voting power, decimal string. */
  total: string
  quorumBps: number
  /** Certified verdict once voting ended; null while live. */
  certifiedQuorumMet?: boolean | null
}

/** Participation bar with the quorum threshold marked on it. */
export default function QuorumMeter({
  participating,
  total,
  quorumBps,
  certifiedQuorumMet = null,
}: QuorumMeterProps) {
  const participationPct = percentOf(participating, total)
  const thresholdPct = quorumBps / 100
  const liveQuorumMet = participationPct >= thresholdPct && total !== '0'
  const quorumMet = certifiedQuorumMet ?? liveQuorumMet

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-xs font-semibold tracking-widest"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
        >
          PARTICIPATION
        </span>
        <span
          className="text-xs font-semibold tracking-widest"
          style={{
            fontFamily: 'var(--font-mono)',
            color: quorumMet ? 'var(--success)' : 'var(--text-secondary)',
            letterSpacing: '0.06em',
          }}
        >
          {quorumVerdictLabel(quorumMet)}
        </span>
      </div>

      <div
        className="relative w-full"
        role="progressbar"
        aria-valuenow={Math.round(participationPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Participation ${participationPct.toFixed(1)}% of eligible power; quorum threshold ${thresholdPct}%`}
        style={{
          height: '10px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'visible',
        }}
      >
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: `${Math.min(participationPct, 100)}%`,
            background: quorumMet ? 'var(--brand-secondary)' : 'var(--brand-primary)',
            borderRadius: 'var(--radius-sm)',
            transition: 'width var(--duration-slow) var(--ease-out)',
          }}
        />
        {/* Threshold marker */}
        <div
          className="absolute top-[-3px]"
          style={{
            left: `${Math.min(thresholdPct, 100)}%`,
            width: '2px',
            height: '16px',
            background: 'var(--text-primary)',
          }}
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{participationPct.toFixed(1)}% cast</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>threshold {thresholdPct}%</span>
      </div>
    </div>
  )
}
