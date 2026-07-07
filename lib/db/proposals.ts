import 'server-only'
import type { PoolClient } from 'pg'
import { withClient } from '@/lib/db/pool'

export type ProposalStatus = 'draft' | 'snapshot_taken' | 'deployed' | 'voting' | 'ended'

export interface ProposalRow {
  id: string
  title: string
  description: string
  quorum_bps: number
  contract_address: string | null
  status: ProposalStatus
  yes_power: string | null
  no_power: string | null
  quorum_met: boolean | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

const PROPOSAL_COLUMNS = `
  id, title, description, quorum_bps, contract_address, status,
  yes_power::text AS yes_power, no_power::text AS no_power, quorum_met,
  ended_at, created_at, updated_at
`

export async function listProposals(): Promise<ProposalRow[]> {
  return withClient(async (client) => {
    const res = await client.query<ProposalRow>(
      `SELECT ${PROPOSAL_COLUMNS} FROM proposals ORDER BY created_at DESC`
    )
    return res.rows
  })
}

/**
 * Loads a proposal inside an open client, optionally locking the row
 * (SELECT … FOR UPDATE) so concurrent lifecycle actions serialize.
 */
export async function getProposalWith(
  client: PoolClient,
  proposalId: string,
  opts: { forUpdate?: boolean } = {}
): Promise<ProposalRow | null> {
  const res = await client.query<ProposalRow>(
    `SELECT ${PROPOSAL_COLUMNS} FROM proposals WHERE id = $1${opts.forUpdate ? ' FOR UPDATE' : ''}`,
    [proposalId]
  )
  return res.rows[0] ?? null
}

export async function insertProposal(input: {
  title: string
  description: string
  quorumBps: number
}): Promise<ProposalRow> {
  return withClient(async (client) => {
    const res = await client.query<ProposalRow>(
      `INSERT INTO proposals (title, description, quorum_bps, status)
       VALUES ($1, $2, $3, 'draft')
       RETURNING ${PROPOSAL_COLUMNS}`,
      [input.title, input.description, input.quorumBps]
    )
    return res.rows[0]
  })
}

/**
 * The proposal the voter page should show. Priority: a live proposal
 * (voting or deployed), else the most recent finished one, else whatever
 * is furthest along in preparation.
 */
export async function getActiveProposal(): Promise<ProposalRow | null> {
  return withClient(async (client) => {
    const res = await client.query<ProposalRow>(
      `SELECT ${PROPOSAL_COLUMNS}
       FROM proposals
       ORDER BY
         CASE
           WHEN status IN ('voting', 'deployed') THEN 0
           WHEN status = 'ended' THEN 1
           ELSE 2
         END,
         created_at DESC
       LIMIT 1`
    )
    return res.rows[0] ?? null
  })
}
