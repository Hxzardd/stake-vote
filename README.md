# StakeVote

On-chain corporate governance for stake-weighted voting. Proposals live in a Supabase database; votes are cast and permanently recorded on Polygon Amoy via a Solidity smart contract. The admin panel manages the full proposal lifecycle — from creation through snapshot, deployment, and result finalization.

## Stack

- **Frontend** — Next.js 15 App Router, TypeScript, Tailwind CSS 4
- **Design** — Archival Civic aesthetic: EB Garamond, Inter, JetBrains Mono
- **Chain** — Polygon Amoy (testnet), ethers.js v6, MetaMask
- **Database** — Supabase (proposals, snapshots, voter registry)
- **Contract** — `StakeVotingGovernance.sol` — stake-weighted, single-vote, quorum-enforced

## How it works

### Proposal lifecycle (admin panel)

```
Draft → Snapshot Taken → Contract Deployed → Voting Active → Results Final
```

1. **Create** — admin enters title, description, quorum threshold (basis points)
2. **Snapshot** — locks stakeholder balances at a point in time; no stake changes after this affect the vote
3. **Deploy** — contract is deployed to Polygon Amoy with the snapshotted voter list and stake weights
4. **Vote** — shareholders connect MetaMask and cast a stake-weighted yes/no vote; each address can vote once
5. **End** — admin closes voting; results are permanently on-chain

### Voter flow

1. Shareholder visits the voter page
2. Connects MetaMask (Polygon Amoy network)
3. Sees their voting power (from the snapshot)
4. Casts vote — transaction is submitted on-chain, stamped "RECORDED"
5. Results update in real-time from contract state

## Vendor integration: mapping off-chain accounts to on-chain wallets

A real deployment (e.g. a fund administrator running a shareholder vote) would bridge their cap table to the chain as follows:

**1. Announce a registration deadline**

Before the snapshot, shareholders are notified to register their wallet address by a cutoff date.

**2. Wallet self-registration (signature-based, free)**

Each shareholder visits a registration portal, connects their MetaMask, and signs an off-chain message. The signature proves control of that address without spending gas. The vendor's back-office system records the `(investorId → address)` mapping.

**3. Off-chain verification**

The vendor cross-references each registered address against their cap table — name, share count, KYC status. This step lives entirely off-chain.

**4. Snapshot**

The admin triggers the snapshot. Your verified `(address → stakeBalance)` map is sealed. Latecomers are excluded.

**5. Contract deploy with voter list**

The constructor receives `address[] voters, uint256[] stakes` — the exact list from the verified snapshot. From here, the vote is fully trustless.

**Custodied shareholders** (held through brokers or DTCC) can't self-register. Vendors like Broadridge solve this by running a single custodian wallet that votes aggregated shares on behalf of those holders — a deliberate centralization tradeoff that mirrors how paper proxy voting already works.

## Local setup

```bash
pnpm install
cp .env.example .env.local   # fill in SUPABASE_URL, SUPABASE_ANON_KEY, PRIVATE_KEY
pnpm dev
```

Admin panel: `http://localhost:3000/admin`
Voter page: `http://localhost:3000`

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `DEPLOYER_PRIVATE_KEY` | Private key used to deploy contracts (server-side only) |
| `RPC_URL` | Polygon Amoy RPC endpoint |

## Demo mode

If no contract is deployed yet, the app falls back to demo mode — simulated votes, no wallet required. Useful for previewing the UI before any chain setup.
