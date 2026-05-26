import { getProposals, createProposal, runSnapshot, deployContract, startVoting, endVoting } from '@/lib/admin/actions'

type Proposal = {
  id: string
  title: string
  description: string
  status: string
  quorum_bps: number
  contract_address?: string
  created_at: string
}

type WorkflowStep = {
  num: number
  label: string
  status: 'done' | 'active' | 'pending'
  action?: React.ReactNode
}

function getSteps(p: Proposal): WorkflowStep[] {
  const s = p.status
  return [
    {
      num: 1,
      label: 'Proposal Created',
      status: 'done',
    },
    {
      num: 2,
      label: 'Stake Snapshot',
      status: s === 'draft' ? 'active' : s !== 'draft' ? 'done' : 'pending',
      action: s === 'draft' ? (
        <form action={async () => { 'use server'; await runSnapshot(p.id) }}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: 'var(--brand-primary)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
          >
            Run Snapshot
          </button>
        </form>
      ) : undefined,
    },
    {
      num: 3,
      label: 'Contract Deployed',
      status: ['snapshot_taken'].includes(s) ? 'active' : ['deployed', 'voting', 'ended'].includes(s) ? 'done' : 'pending',
      action: s === 'snapshot_taken' ? (
        <form action={async () => { 'use server'; await deployContract(p.id) }}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: '#7C3AED', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
          >
            Deploy Contract
          </button>
        </form>
      ) : undefined,
    },
    {
      num: 4,
      label: 'Voting Active',
      status: s === 'deployed' ? 'active' : s === 'voting' ? 'active' : s === 'ended' ? 'done' : 'pending',
      action: s === 'deployed' ? (
        <form action={async () => { 'use server'; await startVoting(p.id) }}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: 'var(--success)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
          >
            Start Voting
          </button>
        </form>
      ) : s === 'voting' ? (
        <form action={async () => { 'use server'; await endVoting(p.id) }}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: 'var(--error)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
          >
            End Voting
          </button>
        </form>
      ) : undefined,
    },
    {
      num: 5,
      label: 'Results Final',
      status: s === 'ended' ? 'done' : 'pending',
    },
  ]
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#A1A1AA',
  snapshot_taken: '#1D4ED8',
  deployed: '#D97706',
  voting: '#059669',
  ended: '#52525B',
}

export default async function AdminPage() {
  const proposals = await getProposals() as Proposal[]

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F11', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Admin Header */}
      <header style={{ background: 'var(--bg-inverse, #18181B)', borderBottom: '1px solid #27272A', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="flex items-center justify-between px-6 py-3" style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="2" fill="var(--brand-primary, #1B3F8A)" />
              <rect x="6" y="7" width="10" height="1.5" fill="white" opacity="0.9" />
              <rect x="6" y="11" width="16" height="1.5" fill="white" opacity="0.9" />
              <rect x="6" y="15" width="13" height="1.5" fill="white" opacity="0.9" />
              <rect x="19" y="15" width="3" height="7" fill="var(--brand-secondary, #1F6B47)" rx="1" />
            </svg>
            <span className="font-semibold text-sm" style={{ color: '#FAFAFA' }}>StakeVote Admin</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#27272A', color: '#71717A', fontFamily: 'var(--font-mono, monospace)' }}>
              Election Management Console
            </span>
          </div>
          <a
            href="/"
            className="text-xs hover:underline"
            style={{ color: '#71717A' }}
          >
            ← Voter view
          </a>
        </div>
      </header>

      <div className="flex" style={{ maxWidth: '1140px', margin: '0 auto', minHeight: 'calc(100vh - 52px)' }}>

        {/* Sidebar */}
        <aside
          style={{
            width: '260px',
            flexShrink: 0,
            borderRight: '1px solid #27272A',
            padding: '24px 0',
            background: '#0F0F11',
          }}
        >
          {/* Create form */}
          <div className="px-4 mb-6">
            <p className="text-xs font-semibold mb-3 tracking-widest" style={{ color: '#52525B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              New Proposal
            </p>
            <form action={async (formData) => {
              'use server'
              const title = formData.get('title') as string
              const desc = formData.get('description') as string
              const quorum = parseInt(formData.get('quorum') as string)
              await createProposal(title, desc, quorum)
            }} className="space-y-2.5">
              <input
                name="title"
                placeholder="Title"
                required
                className="w-full text-sm px-3 py-2 rounded outline-none transition-all"
                style={{
                  background: '#18181B',
                  border: '1px solid #27272A',
                  color: '#FAFAFA',
                  borderRadius: 'var(--radius-sm, 2px)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
              <textarea
                name="description"
                placeholder="Description"
                required
                rows={3}
                className="w-full text-sm px-3 py-2 rounded resize-none outline-none transition-all"
                style={{
                  background: '#18181B',
                  border: '1px solid #27272A',
                  color: '#FAFAFA',
                  borderRadius: 'var(--radius-sm, 2px)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
              <input
                name="quorum"
                type="number"
                placeholder="Quorum BPS (e.g. 4000)"
                defaultValue={4000}
                required
                className="w-full text-sm px-3 py-2 rounded outline-none"
                style={{
                  background: '#18181B',
                  border: '1px solid #27272A',
                  color: '#FAFAFA',
                  borderRadius: 'var(--radius-sm, 2px)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.8125rem',
                }}
              />
              <button
                type="submit"
                className="w-full text-sm font-semibold py-2 rounded transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'var(--brand-primary, #1B3F8A)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm, 2px)' }}
              >
                + Create
              </button>
            </form>
          </div>

          <div style={{ height: '1px', background: '#27272A', margin: '0 16px 16px' }} />

          {/* Proposal list */}
          <div className="px-2">
            <p className="text-xs font-semibold mb-2 px-2 tracking-widest" style={{ color: '#52525B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Proposals
            </p>
            {proposals.length === 0 && (
              <p className="text-xs px-2" style={{ color: '#52525B' }}>No proposals yet</p>
            )}
            {proposals.map((p) => (
              <div
                key={p.id}
                className="px-3 py-2.5 rounded mb-1 cursor-pointer"
                style={{ borderRadius: 'var(--radius-sm, 2px)', background: '#18181B', border: '1px solid #27272A' }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: STATUS_COLORS[p.status] ?? '#52525B',
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                  <span className="text-xs font-medium truncate" style={{ color: '#FAFAFA', maxWidth: '170px' }}>{p.title}</span>
                </div>
                <span className="text-xs" style={{ fontFamily: 'var(--font-mono, monospace)', color: '#52525B', paddingLeft: '15px', display: 'block' }}>
                  {p.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
          {proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: '#52525B' }}>
              <p className="text-lg font-medium mb-2" style={{ color: '#A1A1AA' }}>No proposals</p>
              <p className="text-sm">Create your first proposal using the form on the left.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {proposals.map((p) => {
                const steps = getSteps(p)
                return (
                  <div
                    key={p.id}
                    className="rounded"
                    style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: 'var(--radius-md, 4px)', overflow: 'hidden' }}
                  >
                    {/* Proposal card header */}
                    <div className="px-6 py-4" style={{ borderBottom: '1px solid #27272A' }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold mb-1" style={{ color: '#FAFAFA', fontSize: '1rem' }}>{p.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: '#71717A' }}>
                            <span style={{ fontFamily: 'var(--font-mono, monospace)', background: '#27272A', padding: '2px 6px', borderRadius: '2px', color: STATUS_COLORS[p.status] ?? '#71717A' }}>
                              {p.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                              Quorum: {(p.quorum_bps / 100).toFixed(0)}%
                            </span>
                            <span>
                              {new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {p.contract_address && (
                        <div className="mt-3 flex items-center gap-2">
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                          <span className="text-xs" style={{ color: '#71717A' }}>Contract: </span>
                          <a
                            href={`https://amoy.polygonscan.com/address/${p.contract_address}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs hover:underline"
                            style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--brand-primary, #1B3F8A)' }}
                          >
                            {p.contract_address.slice(0, 10)}...{p.contract_address.slice(-8)}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="px-6 py-3" style={{ borderBottom: '1px solid #27272A' }}>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: '#A1A1AA', lineHeight: 1.6 }}>{p.description}</p>
                    </div>

                    {/* Workflow stepper */}
                    <div className="px-6 py-5">
                      <p className="text-xs font-semibold mb-4 tracking-widest" style={{ color: '#52525B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Workflow
                      </p>
                      <div className="space-y-2">
                        {steps.map((step) => (
                          <div
                            key={step.num}
                            className="flex items-center gap-3 px-3 py-2.5 rounded"
                            style={{
                              borderRadius: 'var(--radius-sm, 2px)',
                              background: step.status === 'active' ? 'rgba(27,63,138,0.12)' : 'transparent',
                              border: step.status === 'active' ? '1px solid rgba(27,63,138,0.3)' : '1px solid transparent',
                            }}
                          >
                            {/* Step indicator */}
                            <span
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: '10px',
                                fontWeight: 700,
                                background: step.status === 'done' ? '#059669' : step.status === 'active' ? 'var(--brand-primary, #1B3F8A)' : '#27272A',
                                color: step.status === 'pending' ? '#52525B' : '#fff',
                              }}
                            >
                              {step.status === 'done' ? '✓' : step.num}
                            </span>

                            <span
                              className="text-sm flex-1"
                              style={{
                                color: step.status === 'done' ? '#71717A' : step.status === 'active' ? '#FAFAFA' : '#52525B',
                                textDecoration: step.status === 'done' ? 'line-through' : 'none',
                              }}
                            >
                              {step.label}
                            </span>

                            {step.action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
