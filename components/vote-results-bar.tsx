'use client'

import { useEffect, useState } from 'react'

interface VoteResultsBarProps {
  yesVotes: number
  noVotes: number
  yesPercentage: number
  noPercentage: number
  participation: number
  quorumBps?: number
  totalVotingPower?: number
}

export default function VoteResultsBar({
  yesVotes,
  noVotes,
  yesPercentage,
  noPercentage,
  participation,
  quorumBps = 0,
  totalVotingPower = 0,
}: VoteResultsBarProps) {
  const [animated, setAnimated] = useState(false)
  const totalVotes = yesVotes + noVotes
  const quorumPct = quorumBps / 100

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div className="space-y-5">
      {/* IN FAVOR bar */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: 'var(--vote-yes)', letterSpacing: '0.06em' }}
          >
            IN FAVOR
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {yesVotes.toLocaleString()} <span style={{ color: 'var(--text-muted)' }}>({yesPercentage.toFixed(1)}%)</span>
          </span>
        </div>
        <div
          className="relative h-2 rounded-sm overflow-visible"
          style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}
        >
          <div
            className="h-full rounded-sm"
            style={{
              width: animated ? `${yesPercentage}%` : '0%',
              background: 'var(--vote-yes)',
              borderRadius: 'var(--radius-sm)',
              transition: 'width 600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              minWidth: yesVotes > 0 ? '4px' : '0',
            }}
          />
          {/* Quorum marker */}
          {quorumPct > 0 && quorumPct < 100 && (
            <div
              className="absolute top-[-4px] bottom-[-4px] w-px"
              style={{
                left: `${quorumPct}%`,
                background: 'var(--border-strong)',
              }}
              title={`Quorum: ${quorumPct}%`}
            >
              <span
                className="absolute -top-5 -translate-x-1/2 text-xs whitespace-nowrap"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}
              >
                Q
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AGAINST bar */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: 'var(--vote-no)', letterSpacing: '0.06em' }}
          >
            AGAINST
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {noVotes.toLocaleString()} <span style={{ color: 'var(--text-muted)' }}>({noPercentage.toFixed(1)}%)</span>
          </span>
        </div>
        <div
          className="relative h-2 rounded-sm overflow-visible"
          style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}
        >
          <div
            className="h-full rounded-sm"
            style={{
              width: animated ? `${noPercentage}%` : '0%',
              background: 'var(--vote-no)',
              borderRadius: 'var(--radius-sm)',
              transition: 'width 600ms cubic-bezier(0.0, 0.0, 0.2, 1) 100ms',
              minWidth: noVotes > 0 ? '4px' : '0',
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-4 pt-4"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
            Total Votes
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
            {totalVotes.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
            Participation
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.125rem', color: participation >= quorumPct ? 'var(--success)' : 'var(--text-primary)' }}>
            {participation.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
            Quorum
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.125rem', color: participation >= quorumPct ? 'var(--success)' : 'var(--warning)' }}>
            {quorumPct > 0 ? `${quorumPct.toFixed(0)}%` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
