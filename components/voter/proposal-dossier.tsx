'use client'

import AddressDisplay from '@/components/shared/address-display'
import StatusBadge from '@/components/shared/status-badge'
import { bpsToPercent } from '@/lib/format'
import type { ActiveProposal } from '@/lib/status'

interface ProposalDossierProps {
  proposal: ActiveProposal | null
  sandbox: boolean
  loading: boolean
  proposalRef: string
}

const SANDBOX_TITLE = 'Sample Governance Proposal'
const SANDBOX_DESCRIPTION =
  'This is a sandbox preview. No proposal has been created in the database yet — ' +
  'connect a wallet and cast a simulated vote to explore the interface. Nothing ' +
  'will be submitted to the blockchain. To run a real election, open the admin ' +
  'panel and take a proposal through its lifecycle.'

/** The proposal as a legal record: reference strip, stamped status, ledger metadata. */
export default function ProposalDossier({
  proposal,
  sandbox,
  loading,
  proposalRef,
}: ProposalDossierProps) {
  if (loading) {
    return (
      <section aria-busy="true" className="animate-slide-in">
        <div className="skeleton mb-4" style={{ height: '14px', width: '160px' }} />
        <div className="skeleton mb-3" style={{ height: '36px', width: '80%' }} />
        <div className="skeleton" style={{ height: '72px', width: '100%' }} />
      </section>
    )
  }

  const title = proposal?.title ?? SANDBOX_TITLE
  const description = proposal?.description ?? SANDBOX_DESCRIPTION

  return (
    <section className="animate-slide-in">
      {/* Reference strip */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-5"
        style={{ borderBottom: '2px solid var(--text-primary)' }}
      >
        <span
          className="text-xs font-semibold tracking-widest"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}
        >
          {proposalRef}
        </span>
        {proposal ? (
          <StatusBadge status={proposal.status} />
        ) : (
          sandbox && (
            <span
              className="inline-flex items-center px-2 py-0.5 text-xs font-semibold tracking-widest"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--warning)',
                background: 'var(--warning-bg)',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.08em',
              }}
            >
              SANDBOX MODE
            </span>
          )
        )}
      </div>

      {/* Title */}
      <h1
        className="font-garamond mb-4"
        style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
          lineHeight: 1.2,
          color: 'var(--text-primary)',
          fontWeight: 500,
        }}
      >
        {title}
      </h1>

      {/* Description */}
      <p
        className="whitespace-pre-wrap mb-6"
        style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '65ch' }}
      >
        {description}
      </p>

      {/* Metadata ledger */}
      <dl
        className="text-sm"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <MetaRow label="QUORUM THRESHOLD">
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {proposal ? `${bpsToPercent(proposal.quorum_bps)} of eligible power` : '40% of eligible power (sample)'}
          </span>
        </MetaRow>
        {proposal?.created_at && (
          <MetaRow label="FILED">
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {new Date(proposal.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </MetaRow>
        )}
        <MetaRow label="CONTRACT">
          {proposal?.contract_address ? (
            <AddressDisplay address={proposal.contract_address} showExplorer />
          ) : (
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {sandbox ? 'none — sandbox' : 'not yet deployed'}
            </span>
          )}
        </MetaRow>
        <MetaRow label="NETWORK">
          <span style={{ fontFamily: 'var(--font-mono)' }}>Polygon Amoy (80002)</span>
        </MetaRow>
      </dl>
    </section>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <dt
        className="text-xs font-semibold tracking-widest"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
      >
        {label}
      </dt>
      <dd style={{ color: 'var(--text-primary)' }}>{children}</dd>
    </div>
  )
}
