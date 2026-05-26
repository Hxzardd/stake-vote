import ProposalStatusBadge from '@/components/proposal-status-badge'

interface ProposalSectionProps {
  title?: string
  description?: string
  quorumBps?: number
  status?: string
  createdAt?: string
  proposalRef?: string
  loading?: boolean
}

export default function ProposalSection({
  title,
  description,
  quorumBps = 0,
  status = '',
  createdAt = '',
  proposalRef = 'PROP-001',
  loading = false,
}: ProposalSectionProps) {
  const quorumPct = quorumBps ? (quorumBps / 100).toFixed(0) + '%' : 'N/A'

  const deadline = createdAt
    ? new Date(new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : 'TBD'

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-3/4" style={{ borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton h-4 w-full" style={{ borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton h-4 w-5/6" style={{ borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton h-4 w-2/3" style={{ borderRadius: 'var(--radius-sm)' }} />
      </div>
    )
  }

  return (
    <div>
      {/* Record line */}
      <div
        className="flex items-center justify-between mb-4"
        style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}
      >
        <span
          className="text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.04em' }}
        >
          RECORD NO: {proposalRef}
        </span>
        <ProposalStatusBadge status={status} />
      </div>

      {/* Title */}
      <h1
        className="mb-4"
        style={{
          fontFamily: 'var(--font-garamond, "EB Garamond", Georgia, serif)',
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 400,
          lineHeight: 1.1,
          color: 'var(--text-primary)',
        }}
      >
        {title || 'Loading Proposal...'}
      </h1>

      {/* Description */}
      <div
        className="mb-6"
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9375rem',
          lineHeight: 1.75,
          whiteSpace: 'pre-wrap',
          maxWidth: '600px',
        }}
      >
        {description || 'Please wait...'}
      </div>

      {/* Meta row */}
      <div
        className="flex flex-wrap gap-6 pt-4 text-sm"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deadline</span>
          <p className="font-medium mt-0.5" style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{deadline}</p>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quorum Required</span>
          <p className="font-medium mt-0.5" style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>{quorumPct}</p>
        </div>
      </div>
    </div>
  )
}
