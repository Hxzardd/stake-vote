import LifecycleRail from '@/components/admin/lifecycle-rail'
import SnapshotLedger from '@/components/admin/snapshot-ledger'
import type { ProposalRow } from '@/lib/db/proposals'
import { bpsToPercent } from '@/lib/format'
import { statusMeta } from '@/lib/status'

/** Dark-theme status accents for the cockpit. */
const STATUS_ACCENT: Record<ProposalRow['status'], string> = {
  draft: '#A1A1AA',
  snapshot_taken: '#60A5FA',
  deployed: '#FBBF24',
  voting: '#34D399',
  ended: '#A1A1AA',
}

export default function ProposalCard({ proposal }: { proposal: ProposalRow }) {
  const accent = STATUS_ACCENT[proposal.status]

  return (
    <article
      className="rounded"
      style={{
        background: '#18181B',
        border: '1px solid #27272A',
        borderRadius: 'var(--radius-md, 4px)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-4" style={{ borderBottom: '1px solid #27272A' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold mb-1" style={{ color: '#FAFAFA', fontSize: '1rem' }}>
              {proposal.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: '#71717A' }}>
              <span
                className="font-semibold tracking-widest"
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  background: '#27272A',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  color: accent,
                  letterSpacing: '0.06em',
                }}
              >
                {statusMeta(proposal.status).label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                Quorum: {bpsToPercent(proposal.quorum_bps)}
              </span>
              <span>
                {new Date(proposal.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 sm:px-6 py-3" style={{ borderBottom: '1px solid #27272A' }}>
        <p className="text-sm whitespace-pre-wrap" style={{ color: '#A1A1AA', lineHeight: 1.6 }}>
          {proposal.description}
        </p>
      </div>

      {/* Lifecycle */}
      <div className="px-4 sm:px-6 py-5">
        <p
          className="text-xs font-semibold mb-4 tracking-widest"
          style={{ color: '#52525B', letterSpacing: '0.1em' }}
        >
          LIFECYCLE
        </p>
        <LifecycleRail proposal={proposal} />
      </div>

      {/* Snapshot ledger (present from snapshot_taken onwards) */}
      {proposal.status !== 'draft' && (
        <div className="px-4 sm:px-6 pb-5">
          <SnapshotLedger proposalId={proposal.id} />
        </div>
      )}
    </article>
  )
}
