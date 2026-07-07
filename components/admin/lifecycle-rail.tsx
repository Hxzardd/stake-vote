import LifecycleAction from '@/components/admin/lifecycle-action'
import { deployContract, endVoting, runSnapshot, startVoting } from '@/lib/admin/actions'
import type { ProposalRow } from '@/lib/db/proposals'
import { formatPower } from '@/lib/format'
import { quorumVerdictLabel } from '@/lib/status'

type StepState = 'done' | 'active' | 'pending'

interface Step {
  label: string
  precondition: string
  state: StepState
  action?: React.ReactNode
  detail?: React.ReactNode
}

/**
 * The proposal lifecycle as a six-step state machine. Exactly one step is
 * actionable at a time; each action reports pending/error inline.
 */
export default function LifecycleRail({ proposal }: { proposal: ProposalRow }) {
  const s = proposal.status
  const reached = (states: ProposalRow['status'][]) => states.includes(s)

  const steps: Step[] = [
    {
      label: 'DRAFT CREATED',
      precondition: 'Filed in the proposal register',
      state: 'done',
      detail: (
        <Timestamp value={proposal.created_at} />
      ),
    },
    {
      label: 'SNAPSHOT SEALED',
      precondition: 'Locks stakeholder balances — immutable once taken',
      state: s === 'draft' ? 'active' : 'done',
      action:
        s === 'draft' ? (
          <LifecycleAction
            label="Run Snapshot"
            pendingLabel="Sealing…"
            variant="primary"
            action={runSnapshot.bind(null, proposal.id)}
          />
        ) : undefined,
    },
    {
      label: 'CONTRACT DEPLOYED',
      precondition: 'Deploys StakeVotingGovernance to Polygon Amoy',
      state: s === 'snapshot_taken' ? 'active' : reached(['deployed', 'voting', 'ended']) ? 'done' : 'pending',
      action:
        s === 'snapshot_taken' ? (
          <LifecycleAction
            label="Deploy Contract"
            pendingLabel="Deploying…"
            variant="deploy"
            action={deployContract.bind(null, proposal.id)}
          />
        ) : undefined,
      detail: proposal.contract_address ? (
        <a
          href={`https://amoy.polygonscan.com/address/${proposal.contract_address}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs hover:underline"
          style={{ fontFamily: 'var(--font-mono, monospace)', color: '#60A5FA' }}
        >
          {proposal.contract_address.slice(0, 10)}…{proposal.contract_address.slice(-8)}
        </a>
      ) : undefined,
    },
    {
      label: 'VOTING OPEN',
      precondition: 'Assigns snapshot stakes on-chain and opens the ballot',
      state: s === 'deployed' ? 'active' : reached(['voting', 'ended']) ? 'done' : 'pending',
      action:
        s === 'deployed' ? (
          <LifecycleAction
            label="Start Voting"
            pendingLabel="Assigning stakes…"
            variant="success"
            action={startVoting.bind(null, proposal.id)}
          />
        ) : undefined,
    },
    {
      label: 'VOTING CLOSED',
      precondition: 'Ends the ballot on-chain — permanent',
      state: s === 'voting' ? 'active' : s === 'ended' ? 'done' : 'pending',
      action:
        s === 'voting' ? (
          <LifecycleAction
            label="End Voting"
            pendingLabel="Closing…"
            variant="danger"
            action={endVoting.bind(null, proposal.id)}
          />
        ) : undefined,
    },
    {
      label: 'RESULT CERTIFIED',
      precondition: 'Final tally read from the contract and stored',
      state: s === 'ended' ? 'done' : 'pending',
      detail:
        s === 'ended' && proposal.yes_power !== null ? (
          <div className="text-xs space-y-0.5" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
            <p style={{ color: '#34D399' }}>YES {formatPower(proposal.yes_power)}</p>
            <p style={{ color: '#F87171' }}>NO {formatPower(proposal.no_power ?? '0')}</p>
            <p style={{ color: proposal.quorum_met ? '#34D399' : '#FBBF24' }}>
              {quorumVerdictLabel(Boolean(proposal.quorum_met))}
            </p>
            {proposal.ended_at && <Timestamp value={proposal.ended_at} />}
          </div>
        ) : undefined,
    },
  ]

  return (
    <div className="space-y-1.5">
      {steps.map((step, i) => (
        <div
          key={step.label}
          className="flex items-start gap-3 px-3 py-2.5 rounded"
          style={{
            borderRadius: 'var(--radius-sm, 2px)',
            background: step.state === 'active' ? 'rgba(27,63,138,0.15)' : 'transparent',
            border: step.state === 'active' ? '1px solid rgba(96,165,250,0.35)' : '1px solid transparent',
          }}
        >
          <span
            aria-hidden="true"
            className="flex items-center justify-center shrink-0 mt-0.5"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              fontSize: '10px',
              fontWeight: 700,
              background: step.state === 'done' ? '#059669' : step.state === 'active' ? 'var(--brand-primary, #1B3F8A)' : '#27272A',
              color: step.state === 'pending' ? '#52525B' : '#fff',
            }}
          >
            {step.state === 'done' ? '✓' : i + 1}
          </span>

          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold tracking-widest"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.08em',
                color: step.state === 'done' ? '#71717A' : step.state === 'active' ? '#FAFAFA' : '#52525B',
              }}
            >
              {step.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>
              {step.precondition}
            </p>
            {step.detail && <div className="mt-1">{step.detail}</div>}
          </div>

          {step.action}
        </div>
      ))}
    </div>
  )
}

function Timestamp({ value }: { value: string }) {
  return (
    <span className="text-xs" style={{ fontFamily: 'var(--font-mono, monospace)', color: '#52525B' }}>
      {new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </span>
  )
}
