import 'server-only'
import type { PoolClient } from 'pg'
import { withClient } from '@/lib/db/pool'

export interface SnapshotRow {
  wallet_address: string
  stake_amount: string
}

export async function hasSnapshot(client: PoolClient, proposalId: string): Promise<boolean> {
  const res = await client.query(
    `SELECT 1 FROM stake_snapshots WHERE proposal_id = $1 LIMIT 1`,
    [proposalId]
  )
  return res.rows.length > 0
}

/**
 * Computes each user's stake at the cutoff and returns the wallet→stake
 * rows to be sealed. Only users with a primary wallet and positive stake
 * are eligible.
 */
export async function computeSnapshotRows(
  client: PoolClient,
  cutoffAt: Date
): Promise<SnapshotRow[]> {
  const stakePerUser = await client.query<{ user_id: string; total_stake: string }>(
    `SELECT h.user_id, SUM(h.equity_units)::text AS total_stake
     FROM holdings h
     WHERE h.effective_at <= $1
     GROUP BY h.user_id
     HAVING SUM(h.equity_units) > 0`,
    [cutoffAt]
  )
  if (stakePerUser.rows.length === 0) return []

  const userIds = stakePerUser.rows.map((r) => r.user_id)
  const wallets = await client.query<{ user_id: string; address: string }>(
    `SELECT user_id, address FROM wallets
     WHERE user_id = ANY($1) AND is_primary = true`,
    [userIds]
  )
  const walletByUser = new Map(wallets.rows.map((r) => [r.user_id, r.address]))

  const rows: SnapshotRow[] = []
  for (const row of stakePerUser.rows) {
    const wallet = walletByUser.get(row.user_id)
    if (!wallet) continue
    rows.push({ wallet_address: wallet, stake_amount: row.total_stake })
  }
  return rows
}

export async function insertSnapshotRows(
  client: PoolClient,
  proposalId: string,
  rows: SnapshotRow[]
): Promise<void> {
  for (const r of rows) {
    await client.query(
      `INSERT INTO stake_snapshots (proposal_id, wallet_address, stake_amount) VALUES ($1, $2, $3)`,
      [proposalId, r.wallet_address, r.stake_amount]
    )
  }
}

export async function getSnapshotLedger(
  proposalId: string
): Promise<{ rows: SnapshotRow[]; totalStake: string }> {
  return withClient(async (client) => {
    const res = await client.query<SnapshotRow>(
      `SELECT wallet_address, stake_amount::text AS stake_amount
       FROM stake_snapshots
       WHERE proposal_id = $1
       ORDER BY stake_amount DESC, wallet_address`,
      [proposalId]
    )
    let total = 0n
    for (const row of res.rows) total += BigInt(row.stake_amount)
    return { rows: res.rows, totalStake: total.toString() }
  })
}

export async function getSnapshotRows(
  client: PoolClient,
  proposalId: string
): Promise<SnapshotRow[]> {
  const res = await client.query<SnapshotRow>(
    `SELECT wallet_address, stake_amount::text AS stake_amount
     FROM stake_snapshots
     WHERE proposal_id = $1
     ORDER BY wallet_address`,
    [proposalId]
  )
  return res.rows
}
