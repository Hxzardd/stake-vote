'use client'

import { Loader2 } from 'lucide-react'
import AddressDisplay from '@/components/shared/address-display'
import { formatPower, percentOf } from '@/lib/format'
import { CHAIN_NAME } from '@/lib/config/client'

export type TerminalState =
  | 'loading'
  | 'disconnected'
  | 'network-mismatch'
  | 'not-open'
  | 'ineligible'
  | 'open'
  | 'voted'
  | 'closed'

interface VotingTerminalProps {
  state: TerminalState
  mode: 'sandbox' | 'onchain'
  address: string | null
  isConnecting: boolean
  userStake: string
  totalVotingPower: string
  /** Official status label shown while voting is not open (e.g. SNAPSHOT SEALED). */
  statusLabel?: string
  error: string | null
  isSubmitting: boolean
  onConnect: () => void
  onSwitchNetwork: () => void
  onVote: (support: boolean) => void
}

/**
 * Terminal-style vote panel: every state has a name, every row is a fact.
 * wallet → network → eligibility → voting power → action.
 */
export default function VotingTerminal({
  state,
  mode,
  address,
  isConnecting,
  userStake,
  totalVotingPower,
  statusLabel,
  error,
  isSubmitting,
  onConnect,
  onSwitchNetwork,
  onVote,
}: VotingTerminalProps) {
  const powerPct = percentOf(userStake, totalVotingPower)

  return (
    <section
      aria-label="Voting terminal"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-raised)',
        overflow: 'hidden',
      }}
    >
      <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span
          className="text-xs font-semibold tracking-widest"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
        >
          VOTING TERMINAL
        </span>
      </div>

      {/* Fact rows */}
      <div className="px-5 py-4 space-y-3 text-sm" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <TerminalRow label="WALLET">
          {address ? (
            <AddressDisplay address={address} showCopy={false} />
          ) : (
            <Value muted>not connected</Value>
          )}
        </TerminalRow>

        <TerminalRow label="NETWORK">
          {state === 'network-mismatch' ? (
            <Value color="var(--error)">NETWORK MISMATCH</Value>
          ) : address ? (
            <Value color="var(--success)">{CHAIN_NAME}</Value>
          ) : (
            <Value muted>—</Value>
          )}
        </TerminalRow>

        <TerminalRow label="ELIGIBILITY">
          {state === 'ineligible' ? (
            <Value color="var(--error)">WALLET INELIGIBLE</Value>
          ) : state === 'loading' ? (
            <Value muted>checking…</Value>
          ) : address && state !== 'network-mismatch' ? (
            <Value color="var(--success)">{mode === 'sandbox' ? 'SANDBOX VOTER' : 'ON SNAPSHOT'}</Value>
          ) : (
            <Value muted>—</Value>
          )}
        </TerminalRow>

        <TerminalRow label="VOTING POWER">
          {address && state !== 'network-mismatch' && state !== 'loading' && state !== 'ineligible' ? (
            <span>
              <Value>{formatPower(userStake)}</Value>
              <span className="text-xs ml-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {powerPct.toFixed(1)}% of total
              </span>
            </span>
          ) : (
            <Value muted>—</Value>
          )}
        </TerminalRow>
      </div>

      {/* Action zone */}
      <div className="px-5 py-4">
        {state === 'loading' && (
          <StateBanner color="var(--text-secondary)" bg="var(--bg-elevated)">
            <Loader2 size={13} className="animate-spin inline mr-1.5" />
            READING CONTRACT STATE
          </StateBanner>
        )}

        {state === 'disconnected' && (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              background: 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
            }}
          >
            {isConnecting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Connecting…
              </>
            ) : (
              'Connect Wallet to Vote'
            )}
          </button>
        )}

        {state === 'network-mismatch' && (
          <div className="space-y-2.5">
            <StateBanner color="var(--error)" bg="var(--error-bg)">
              NETWORK MISMATCH — SWITCH TO {CHAIN_NAME.toUpperCase()}
            </StateBanner>
            <button
              onClick={onSwitchNetwork}
              className="w-full py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
              style={{
                background: 'var(--error)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              Switch Network
            </button>
          </div>
        )}

        {state === 'not-open' && (
          <StateBanner color="var(--info)" bg="var(--info-bg)">
            VOTING NOT OPEN{statusLabel ? ` — ${statusLabel}` : ''}
          </StateBanner>
        )}

        {state === 'ineligible' && (
          <StateBanner color="var(--error)" bg="var(--error-bg)">
            WALLET INELIGIBLE — NOT ON THE SEALED SNAPSHOT
          </StateBanner>
        )}

        {state === 'closed' && (
          <StateBanner color="var(--text-secondary)" bg="var(--bg-elevated)">
            VOTING CLOSED
          </StateBanner>
        )}

        {state === 'voted' && (
          <StateBanner color="var(--success)" bg="var(--success-bg)">
            ✓ VOTE RECORDED
          </StateBanner>
        )}

        {state === 'open' && (
          <div className="space-y-2.5">
            <StateBanner color="var(--success)" bg="var(--success-bg)">
              VOTING OPEN
            </StateBanner>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onVote(true)}
                disabled={isSubmitting}
                className="py-3 text-sm font-semibold tracking-widest transition-all active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: 'var(--vote-yes)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  letterSpacing: '0.08em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin inline" /> : 'VOTE YES'}
              </button>
              <button
                onClick={() => onVote(false)}
                disabled={isSubmitting}
                className="py-3 text-sm font-semibold tracking-widest transition-all active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: 'var(--vote-no)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  letterSpacing: '0.08em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin inline" /> : 'VOTE NO'}
              </button>
            </div>
            {isSubmitting && (
              <p className="text-xs tx-pending-pulse" style={{ fontFamily: 'var(--font-mono)' }}>
                {mode === 'onchain'
                  ? 'Awaiting wallet confirmation and network finality…'
                  : 'Simulating vote…'}
              </p>
            )}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              One vote per wallet. Your full voting power is applied to your choice
              {mode === 'onchain' ? ' and permanently recorded.' : ' — sandbox only.'}
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-3 text-xs px-3 py-2"
            style={{
              color: 'var(--error)',
              background: 'var(--error-bg)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              wordBreak: 'break-word',
            }}
          >
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

function TerminalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <span
        className="text-xs font-semibold tracking-widest"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
      >
        {label}
      </span>
      <span>{children}</span>
    </div>
  )
}

function Value({
  children,
  muted = false,
  color,
}: {
  children: React.ReactNode
  muted?: boolean
  color?: string
}) {
  return (
    <span
      className={color ? 'text-xs font-semibold tracking-widest' : undefined}
      style={{
        fontFamily: 'var(--font-mono)',
        color: color ?? (muted ? 'var(--text-muted)' : 'var(--text-primary)'),
        letterSpacing: color ? '0.06em' : undefined,
      }}
    >
      {children}
    </span>
  )
}

function StateBanner({
  children,
  color,
  bg,
}: {
  children: React.ReactNode
  color: string
  bg: string
}) {
  return (
    <p
      className="text-xs font-semibold tracking-widest px-3 py-2 text-center"
      style={{
        fontFamily: 'var(--font-mono)',
        color,
        background: bg,
        borderRadius: 'var(--radius-sm)',
        letterSpacing: '0.08em',
      }}
    >
      {children}
    </p>
  )
}
