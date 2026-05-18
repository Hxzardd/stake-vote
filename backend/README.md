# Governance Backend (Off-Chain)

Backend for **StakeVotingGovernance**: database, snapshot job, and contract interaction. Corporate governance only; no tokens, no on-chain identity.

## Trust boundaries

- **Off-chain:** identity (users), KYC, live holdings, proposals metadata, **immutable** stake snapshots.
- **On-chain:** contract address, proposal text, wallet → stake (from snapshot), vote counts. No user identity on-chain.
- **Admin:** backend uses `ADMIN_PRIVATE_KEY` to deploy and call setProposal / assignStake / startVoting / endVoting. Stake is never computed on-chain.

## Setup

1. **PostgreSQL:** create DB and run schema/seeds.
   ```bash
   createdb vote_governance
   cd backend && pnpm install && pnpm build
   pnpm run db:migrate
   pnpm run db:seed:dev # To insert mock users/wallets for dev testing
   ```
   (Schema file: `schema/001_initial.sql`.)

2. **Env:** copy `.env.example` to `.env`, set `DATABASE_URL`, `RPC_URL`, `ADMIN_PRIVATE_KEY`. For deploy, run `forge build` in repo root and set `CONTRACT_ARTIFACT_PATH` to `../out/StakeVotingGovernance.sol/StakeVotingGovernance.json` if needed.

## Workflow

1. **Create proposal** (in DB): insert into `proposals` (title, description, quorum_bps, status = `draft`).
2. **Snapshot:** at cutoff time run snapshot job. Reads live `holdings`, aggregates stake per user, maps to primary `wallets`, writes **immutable** `stake_snapshots`; proposal status → `snapshot_taken`.
3. **Deploy contract:** `pnpm run proposal:deploy -- <proposal_id>`. Deploys StakeVotingGovernance(quorumBps), saves contract_address; status → `deployed`.
4. **Start voting:** `pnpm run proposal:start-voting -- <proposal_id>`. Calls setProposal, assignStake for each snapshot row, startVoting(); status → `voting`.
5. **Voters** use frontend/DApp to call `vote(bool)`.
6. **End voting:** `pnpm run proposal:end-voting -- <proposal_id>`. Calls endVoting(); status → `ended`.
7. **Result:** `pnpm run proposal:result -- <proposal_id>` to read result(), quorumReached(), getVoteCounts().

## Commands

| Command | Usage |
|--------|--------|
| `pnpm run db:migrate` | Apply schema (001_initial.sql). |
| `pnpm run snapshot -- <proposal_id> [cutoff_iso]` | Run snapshot for proposal; optional cutoff (default: now). |
| `pnpm run proposal:deploy -- <proposal_id>` | Deploy contract (proposal must be snapshot_taken). |
| `pnpm run proposal:start-voting -- <proposal_id>` | setProposal + assignStake + startVoting (proposal must be deployed). |
| `pnpm run proposal:end-voting -- <proposal_id>` | endVoting (proposal must be voting). |
| `pnpm run proposal:result -- <proposal_id>` | Read result, quorum, vote counts. |

## Snapshot (cron)

Run at fixed cutoff (e.g. 00:00 UTC):

```bash
pnpm run snapshot -- <proposal_id> 2025-02-05T00:00:00Z
```

Stake formula: `stake = sum(equity_units)` per user at cutoff; assigned to that user’s primary wallet. Only users with `is_primary = true` and positive stake are snapshotted.
