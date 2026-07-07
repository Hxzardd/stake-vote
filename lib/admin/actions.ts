'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { withTransaction } from '@/lib/db/pool'
import {
  getProposalWith,
  insertProposal,
  listProposals,
  type ProposalRow,
} from '@/lib/db/proposals'
import {
  computeSnapshotRows,
  getSnapshotRows,
  hasSnapshot,
  insertSnapshotRows,
} from '@/lib/db/snapshots'
import {
  deployGovernanceContract,
  endVotingOnChain,
  initializeVoting,
  readFinalTally,
} from '@/lib/contract/server'

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

function toError(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Unexpected error'
}

/**
 * Every action authenticates itself: the /admin middleware only covers page
 * routes, while server actions are addressable by action ID from anywhere.
 */
async function guarded(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    await requireAdmin()
    return await fn()
  } catch (err) {
    console.error('[admin action]', err)
    return { ok: false, error: toError(err) }
  }
}

export async function getProposals(): Promise<ProposalRow[]> {
  await requireAdmin()
  return listProposals()
}

const createProposalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(10_000, 'Description must be at most 10,000 characters'),
  quorumBps: z
    .number()
    .int('Quorum must be a whole number of basis points')
    .min(1, 'Quorum must be at least 1 bps')
    .max(10_000, 'Quorum cannot exceed 10000 bps (100%)'),
})

export async function createProposal(
  title: string,
  description: string,
  quorumBps: number
): Promise<ActionResult> {
  return guarded(async () => {
    const parsed = createProposalSchema.safeParse({ title, description, quorumBps })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? 'form')
        fieldErrors[field] ??= issue.message
      }
      return { ok: false, error: 'Validation failed', fieldErrors }
    }

    const proposal = await insertProposal(parsed.data)
    revalidatePath('/admin')
    return { ok: true, message: `Draft created (${proposal.id.slice(0, 8)})` }
  })
}

export async function runSnapshot(proposalId: string): Promise<ActionResult> {
  return guarded(async () => {
    const result = await withTransaction(async (client) => {
      const proposal = await getProposalWith(client, proposalId, { forUpdate: true })
      if (!proposal) throw new Error('Proposal not found')
      if (proposal.status !== 'draft') {
        throw new Error(
          `Snapshot requires status draft (current: ${proposal.status}). Snapshots are immutable.`
        )
      }
      if (await hasSnapshot(client, proposalId)) {
        throw new Error('Snapshot already exists for this proposal. Snapshots are immutable.')
      }

      const rows = await computeSnapshotRows(client, new Date())
      if (rows.length === 0) {
        throw new Error(
          'No eligible stakeholders: need users with a primary wallet and positive holdings. Run `pnpm db:seed` for dev data.'
        )
      }

      await insertSnapshotRows(client, proposalId, rows)
      await client.query(
        `UPDATE proposals SET status = 'snapshot_taken', updated_at = now() WHERE id = $1`,
        [proposalId]
      )
      return rows.length
    })

    revalidatePath('/admin')
    return { ok: true, message: `Snapshot sealed: ${result} wallets` }
  })
}

export async function deployContract(proposalId: string): Promise<ActionResult> {
  return guarded(async () => {
    const address = await withTransaction(async (client) => {
      // Row lock serializes double-clicks: the second call waits, re-reads
      // the deployed state, and fails the guard instead of deploying twice.
      const proposal = await getProposalWith(client, proposalId, { forUpdate: true })
      if (!proposal) throw new Error('Proposal not found')
      if (proposal.status !== 'snapshot_taken') {
        throw new Error(`Deploy requires status snapshot_taken (current: ${proposal.status}).`)
      }
      if (proposal.contract_address) {
        throw new Error(`Contract already deployed at ${proposal.contract_address}.`)
      }

      const deployedAddress = await deployGovernanceContract(proposal.quorum_bps)
      await client.query(
        `UPDATE proposals SET contract_address = $1, status = 'deployed', updated_at = now() WHERE id = $2`,
        [deployedAddress, proposalId]
      )
      return deployedAddress
    })

    revalidatePath('/admin')
    return { ok: true, message: `Contract deployed at ${address}` }
  })
}

export async function startVoting(proposalId: string): Promise<ActionResult> {
  return guarded(async () => {
    const summary = await withTransaction(async (client) => {
      const proposal = await getProposalWith(client, proposalId, { forUpdate: true })
      if (!proposal) throw new Error('Proposal not found')
      if (proposal.status !== 'deployed') {
        throw new Error(`Start voting requires status deployed (current: ${proposal.status}).`)
      }
      if (!proposal.contract_address) throw new Error('Proposal has no contract address')

      const snapshots = await getSnapshotRows(client, proposalId)
      if (snapshots.length === 0) throw new Error('No stake snapshot rows for this proposal')

      // Status only becomes `voting` after every on-chain step confirms;
      // a mid-loop failure leaves it `deployed` and the action retryable.
      const result = await initializeVoting(
        proposal.contract_address,
        proposal.description,
        snapshots
      )

      await client.query(
        `UPDATE proposals SET status = 'voting', updated_at = now() WHERE id = $1`,
        [proposalId]
      )
      return result
    })

    revalidatePath('/admin')
    return {
      ok: true,
      message: `Voting open: ${summary.assigned} stakes assigned, ${summary.skipped} skipped, ${summary.total} total`,
    }
  })
}

export async function endVoting(proposalId: string): Promise<ActionResult> {
  return guarded(async () => {
    const tally = await withTransaction(async (client) => {
      const proposal = await getProposalWith(client, proposalId, { forUpdate: true })
      if (!proposal) throw new Error('Proposal not found')
      if (proposal.status !== 'voting') {
        throw new Error(`End voting requires status voting (current: ${proposal.status}).`)
      }
      if (!proposal.contract_address) throw new Error('Proposal has no contract address')

      await endVotingOnChain(proposal.contract_address)
      const finalTally = await readFinalTally(proposal.contract_address)

      await client.query(
        `UPDATE proposals
         SET status = 'ended', yes_power = $1, no_power = $2, quorum_met = $3,
             ended_at = now(), updated_at = now()
         WHERE id = $4`,
        [finalTally.yesVotes, finalTally.noVotes, finalTally.quorumReached, proposalId]
      )
      return finalTally
    })

    revalidatePath('/admin')
    return {
      ok: true,
      message: `Result certified: ${tally.result} (yes ${tally.yesVotes} / no ${tally.noVotes}, quorum ${tally.quorumReached ? 'met' : 'not met'})`,
    }
  })
}
