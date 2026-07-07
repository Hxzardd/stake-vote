# StakeVote

On-chain corporate governance for stake-weighted voting. Proposals live in Postgres; votes are cast and permanently recorded on Polygon Amoy via a Solidity smart contract. The admin panel manages the full proposal lifecycle — from draft filing through snapshot, deployment, voting, and result certification.

## Stack

- **Frontend** — Next.js 16 App Router, TypeScript, Tailwind CSS 4
- **Design** — Institutional Web3 Governance Terminal: EB Garamond, Inter, JetBrains Mono
- **Chain** — Polygon Amoy (testnet), ethers.js v6, MetaMask
- **Database** — Postgres via `pg` (`DATABASE_URL` — any provider works: Neon, Supabase, local)
- **Contract** — `contracts/StakeVotingGovernance.sol` — stake-weighted, single-vote, quorum-enforced (Foundry)

## How it works

### Proposal lifecycle (admin panel)

```
DRAFT → SNAPSHOT SEALED → CONTRACT DEPLOYED → VOTING OPEN → VOTING CLOSED → RESULT CERTIFIED
```

1. **File** — admin enters title, description, quorum threshold (basis points); validated server-side
2. **Snapshot** — seals stakeholder balances at a point in time; immutable once taken
3. **Deploy** — `StakeVotingGovernance` is deployed to Polygon Amoy with the quorum threshold (guarded against double-deploys)
4. **Start voting** — the sealed snapshot is written on-chain (`setProposal` → `assignStake` per wallet → `startVoting`); the step is resumable — already-assigned wallets are skipped on retry
5. **Vote** — shareholders connect MetaMask and cast a stake-weighted yes/no vote; one vote per address
6. **End** — admin closes voting; the certified tally (yes/no power, quorum verdict) is read from the contract and stored in the database

Every lifecycle action is authenticated (`requireAdmin` inside the server action, not just the route middleware), status-guarded (`SELECT … FOR UPDATE`), and reports success/failure inline in the cockpit UI.

### Voter flow

1. Shareholder visits the voter page
2. Connects MetaMask (Polygon Amoy — a NETWORK MISMATCH state offers a switch button)
3. Sees their exact voting power from the sealed snapshot (WALLET INELIGIBLE if not on it)
4. Casts a vote — the transaction is confirmed on-chain and a durable VoteReceipt is issued with the tx hash and a Polygonscan link
5. The results ledger shows yes/no power, participation, and a quorum meter, live from contract state

### Sandbox mode

With an empty database (no proposals), the app runs in **SANDBOX MODE** — clearly bannered, with a fixed deterministic voting power and no blockchain transactions. Sandbox receipts are stamped `NOT RECORDED ON CHAIN`. This exists to preview the interface before any chain or database setup; it is never silently mixed with real voting.

## Local setup

```bash
pnpm install
cp .env.example .env.local   # fill in the variables below

# create the schema (any Postgres)
psql "$DATABASE_URL" -f db/schema/001_initial.sql
psql "$DATABASE_URL" -f db/schema/002_result_columns.sql

# seed three dev stakeholders with holdings
pnpm db:seed

pnpm dev
```

- Voter page: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin` — Basic Auth, username `admin`, password `ADMIN_PASSWORD`

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (server-only) |
| `RPC_URL` | Polygon Amoy JSON-RPC endpoint (server-only) |
| `ADMIN_PRIVATE_KEY` | Chairperson wallet key used to deploy contracts and run lifecycle transactions; needs Amoy test POL (server-only) |
| `ADMIN_PASSWORD` | Basic Auth password for `/admin` and all admin server actions |
| `NEXT_PUBLIC_CHAIN_ID` | Chain the voter UI expects (80002 = Polygon Amoy) |

Server-side variables are validated with zod on first use (`lib/config/server.ts`).

## Contract development

The contract is built and tested with Foundry:

```bash
forge install foundry-rs/forge-std   # once, after cloning
forge build
forge test -vv
```

The app deploys the contract at runtime from a committed artifact (`lib/contract/StakeVotingGovernance.json`, abi + bytecode). After changing the contract, regenerate it:

```bash
pnpm build:artifact   # solc 0.8.28, optimizer 200 runs — matches foundry.toml
```

Note: the constructor takes only the quorum threshold. Voter stakes are assigned after deployment via `assignStake` (chairperson-only, Created phase), which is what makes the start-voting step resumable.

## Vendor integration: mapping off-chain accounts to on-chain wallets

A real deployment (e.g. a fund administrator running a shareholder vote) would bridge their cap table to the chain as follows:

**1. Announce a registration deadline** — before the snapshot, shareholders are notified to register a wallet address by a cutoff date.

**2. Wallet self-registration (signature-based, free)** — each shareholder connects MetaMask on a registration portal and signs an off-chain message, proving control of the address without spending gas. The back-office records the `(investorId → address)` mapping.

**3. Off-chain verification** — the vendor cross-references each registered address against the cap table: name, share count, KYC status.

**4. Snapshot** — the admin triggers the snapshot; the verified `(address → stakeBalance)` map is sealed. Latecomers are excluded.

**5. On-chain stake assignment** — the start-voting step writes the sealed ledger to the contract via `assignStake`. From here, the vote is fully trustless.

**Custodied shareholders** (held through brokers or DTCC) can't self-register. Vendors like Broadridge solve this by running a single custodian wallet that votes aggregated shares on behalf of those holders — a deliberate centralization tradeoff that mirrors how paper proxy voting already works.

## Repository layout

```
app/            voter page, admin cockpit, active-proposal API route
components/     voter/ (dossier, terminal, ledger, receipt) · admin/ (rail, forms) · shared/
db/             SQL schema + dev seed
hooks/          use-web3 (wallet), use-voting (bigint-safe tallies, sandbox)
lib/            config (zod env) · auth · db (pool, repositories) · contract (abi, reads, write, admin signer) · admin actions
contracts/      StakeVotingGovernance.sol (+ script/, test/ — Foundry)
scripts/        build-artifact.mjs (solc → deploy artifact)
```
