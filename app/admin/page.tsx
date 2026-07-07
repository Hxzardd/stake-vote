import Link from 'next/link'
import CreateProposalForm from '@/components/admin/create-proposal-form'
import ProposalCard from '@/components/admin/proposal-card'
import { getProposals } from '@/lib/admin/actions'
import { statusMeta } from '@/lib/status'

export const dynamic = 'force-dynamic'

const STATUS_DOT: Record<string, string> = {
  draft: '#A1A1AA',
  snapshot_taken: '#60A5FA',
  deployed: '#FBBF24',
  voting: '#34D399',
  ended: '#52525B',
}

export default async function AdminPage() {
  const proposals = await getProposals()

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0F0F11', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      {/* Admin header */}
      <header
        className="sticky top-0 z-50"
        style={{ background: '#18181B', borderBottom: '1px solid #27272A' }}
      >
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 mx-auto"
          style={{ maxWidth: '1140px' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0">
              <rect width="28" height="28" rx="2" fill="var(--brand-primary, #1B3F8A)" />
              <rect x="6" y="7" width="10" height="1.5" fill="white" opacity="0.9" />
              <rect x="6" y="11" width="16" height="1.5" fill="white" opacity="0.9" />
              <rect x="6" y="15" width="13" height="1.5" fill="white" opacity="0.9" />
              <rect x="19" y="15" width="3" height="7" fill="var(--brand-secondary, #1F6B47)" rx="1" />
            </svg>
            <span className="font-semibold text-sm" style={{ color: '#FAFAFA' }}>
              StakeVote Admin
            </span>
            <span
              className="hidden sm:inline text-xs px-2 py-0.5 rounded"
              style={{ background: '#27272A', color: '#71717A', fontFamily: 'var(--font-mono, monospace)' }}
            >
              Lifecycle Cockpit
            </span>
          </div>
          <Link href="/" className="text-xs hover:underline shrink-0" style={{ color: '#71717A' }}>
            ← Voter view
          </Link>
        </div>
      </header>

      <div
        className="flex flex-col lg:flex-row mx-auto"
        style={{ maxWidth: '1140px', minHeight: 'calc(100vh - 52px)' }}
      >
        {/* Sidebar */}
        <aside
          className="w-full lg:w-[280px] shrink-0 py-6 lg:border-r"
          style={{ borderColor: '#27272A', background: '#0F0F11' }}
        >
          <div className="px-4 mb-6">
            <p
              className="text-xs font-semibold mb-3 tracking-widest"
              style={{ color: '#52525B', letterSpacing: '0.1em' }}
            >
              FILE NEW PROPOSAL
            </p>
            <CreateProposalForm />
          </div>

          <div style={{ height: '1px', background: '#27272A', margin: '0 16px 16px' }} />

          {/* Register */}
          <div className="px-2">
            <p
              className="text-xs font-semibold mb-2 px-2 tracking-widest"
              style={{ color: '#52525B', letterSpacing: '0.1em' }}
            >
              PROPOSAL REGISTER
            </p>
            {proposals.length === 0 && (
              <p className="text-xs px-2" style={{ color: '#52525B' }}>
                No proposals filed
              </p>
            )}
            {proposals.map((p) => (
              <div
                key={p.id}
                className="px-3 py-2.5 rounded mb-1"
                style={{
                  borderRadius: 'var(--radius-sm, 2px)',
                  background: '#18181B',
                  border: '1px solid #27272A',
                }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="shrink-0 inline-block"
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: STATUS_DOT[p.status] ?? '#52525B',
                    }}
                  />
                  <span className="text-xs font-medium truncate" style={{ color: '#FAFAFA' }}>
                    {p.title}
                  </span>
                </div>
                <span
                  className="text-xs block"
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#52525B',
                    paddingLeft: '15px',
                  }}
                >
                  {statusMeta(p.status).label.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 overflow-y-auto">
          {proposals.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full min-h-[300px]"
              style={{ color: '#52525B' }}
            >
              <p className="text-lg font-medium mb-2" style={{ color: '#A1A1AA' }}>
                No proposals
              </p>
              <p className="text-sm">File your first proposal using the form.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {proposals.map((p) => (
                <ProposalCard key={p.id} proposal={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
