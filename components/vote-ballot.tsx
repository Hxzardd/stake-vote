'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import VotingPowerBadge from '@/components/voting-power-badge'

interface VoteBallotProps {
  isConnected: boolean
  hasVoted: boolean
  userVote: 'yes' | 'no' | null
  userStake: number
  totalVotingPower?: number
  onVote: (direction: 'yes' | 'no') => void
  isLoading?: boolean
  error?: string | null
  phase?: number
  proposalRef?: string
  onConnect?: () => void
}

export default function VoteBallot({
  isConnected,
  hasVoted,
  userVote,
  userStake,
  totalVotingPower,
  onVote,
  isLoading = false,
  error = null,
  phase = 1,
  proposalRef = 'PROP-001',
  onConnect,
}: VoteBallotProps) {
  const [pressing, setPressing] = useState<'yes' | 'no' | null>(null)
  const [justVoted, setJustVoted] = useState(false)

  const handleVote = async (direction: 'yes' | 'no') => {
    if (isLoading || hasVoted) return
    setJustVoted(false)
    await onVote(direction)
    if (!error) setJustVoted(true)
  }

  const isClosed = phase !== 1
  const showStamp = hasVoted || justVoted

  return (
    <div
      className="relative w-full rounded"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-raised)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      {/* Ballot Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.12em' }}
        >
          Official Ballot
        </span>
        <span
          className="text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          {proposalRef}
        </span>
      </div>

      {/* Ballot Body */}
      <div className="px-5 py-4 space-y-3" style={{ position: 'relative' }}>

        {/* Not connected overlay */}
        {!isConnected && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: 'rgba(247,245,241,0.92)', backdropFilter: 'blur(2px)' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Connect wallet to vote
            </p>
            <p className="text-xs mb-4 text-center px-4" style={{ color: 'var(--text-secondary)' }}>
              Your vote will be weighted by your verified stake
            </p>
            {onConnect && (
              <button
                onClick={onConnect}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded transition-all active:scale-[0.97]"
                style={{ background: 'var(--brand-primary)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
              >
                <span style={{ fontSize: '14px' }}>🦊</span>
                Connect Wallet
              </button>
            )}
          </div>
        )}

        {/* Voting closed overlay */}
        {isClosed && isConnected && !hasVoted && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: 'rgba(247,245,241,0.92)', backdropFilter: 'blur(2px)' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Voting is Closed
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              This proposal is no longer accepting votes
            </p>
          </div>
        )}

        {/* IN FAVOR option */}
        <button
          onMouseDown={() => setPressing('yes')}
          onMouseUp={() => setPressing(null)}
          onMouseLeave={() => setPressing(null)}
          onClick={() => handleVote('yes')}
          disabled={isLoading || hasVoted || !isConnected || isClosed}
          className="w-full flex items-start gap-3 px-4 py-3 rounded text-left transition-all disabled:cursor-default"
          style={{
            background: hasVoted && userVote === 'yes' ? 'rgba(31,107,71,0.06)' : pressing === 'yes' ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${hasVoted && userVote === 'yes' ? 'rgba(31,107,71,0.3)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-sm)',
            transform: pressing === 'yes' ? 'scale(0.985)' : 'scale(1)',
            transition: 'all 150ms ease',
            cursor: hasVoted || isLoading || !isConnected || isClosed ? 'default' : 'pointer',
          }}
          aria-label="Vote in favor"
        >
          {/* Checkbox */}
          <span
            className="flex-shrink-0 mt-0.5"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${hasVoted && userVote === 'yes' ? 'var(--vote-yes)' : 'var(--border-strong)'}`,
              background: hasVoted && userVote === 'yes' ? 'var(--vote-yes)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {hasVoted && userVote === 'yes' && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold tracking-wide"
                style={{ color: hasVoted && userVote === 'yes' ? 'var(--vote-yes)' : 'var(--text-primary)', letterSpacing: '0.04em' }}
              >
                IN FAVOR
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Yes</span>
            </div>
            {isConnected && userStake > 0 && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {userStake.toLocaleString()} voting power
              </p>
            )}
          </div>
        </button>

        {/* AGAINST option */}
        <button
          onMouseDown={() => setPressing('no')}
          onMouseUp={() => setPressing(null)}
          onMouseLeave={() => setPressing(null)}
          onClick={() => handleVote('no')}
          disabled={isLoading || hasVoted || !isConnected || isClosed}
          className="w-full flex items-start gap-3 px-4 py-3 rounded text-left transition-all disabled:cursor-default"
          style={{
            background: hasVoted && userVote === 'no' ? 'rgba(139,26,26,0.06)' : pressing === 'no' ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${hasVoted && userVote === 'no' ? 'rgba(139,26,26,0.3)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-sm)',
            transform: pressing === 'no' ? 'scale(0.985)' : 'scale(1)',
            transition: 'all 150ms ease',
            cursor: hasVoted || isLoading || !isConnected || isClosed ? 'default' : 'pointer',
          }}
          aria-label="Vote against"
        >
          {/* Checkbox */}
          <span
            className="flex-shrink-0 mt-0.5"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${hasVoted && userVote === 'no' ? 'var(--vote-no)' : 'var(--border-strong)'}`,
              background: hasVoted && userVote === 'no' ? 'var(--vote-no)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {hasVoted && userVote === 'no' && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold tracking-wide"
                style={{ color: hasVoted && userVote === 'no' ? 'var(--vote-no)' : 'var(--text-primary)', letterSpacing: '0.04em' }}
              >
                AGAINST
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No</span>
            </div>
            {isConnected && userStake > 0 && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {userStake.toLocaleString()} voting power
              </p>
            )}
          </div>
        </button>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Submitting to blockchain...</span>
          </div>
        )}

        {error && (
          <div className="px-3 py-2 rounded text-xs" style={{ background: 'var(--error-bg)', border: '1px solid #FCA5A5', color: 'var(--error)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}
      </div>

      {/* Voting power row */}
      {isConnected && (
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
        >
          <VotingPowerBadge stake={userStake} totalVotingPower={totalVotingPower} variant="compact" />
          {hasVoted && (
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Recorded on-chain
            </span>
          )}
        </div>
      )}

      {/* Footer disclaimer */}
      <div
        className="px-5 py-2.5 text-center"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Submitted votes are final and irreversible
        </p>
      </div>

      {/* Stamp overlay — shown when voted */}
      {showStamp && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-20"
          style={{ background: 'rgba(255,255,255,0.0)' }}
        >
          <div
            className="stamp-overlay"
            style={{
              transform: 'rotate(15deg)',
              border: `3px solid var(--success)`,
              borderRadius: '50%',
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(240,253,244,0.85)',
              boxShadow: '0 0 0 2px rgba(22,101,52,0.15)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-garamond, "EB Garamond", Georgia, serif)',
                fontSize: '1.25rem',
                fontWeight: 500,
                color: 'var(--success)',
                letterSpacing: '0.08em',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              RECORDED
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
