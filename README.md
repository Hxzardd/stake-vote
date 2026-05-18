# StakeVote: Blockchain Governance Application

StakeVote is designed to mirror real-world corporate governance rather than pure token-based on-chain models. Voting power is tied to verified stakeholder ownership, with stake validated off-chain and voting enforcement handled on-chain through immutable smart contracts. By decentralizing vote execution and tallying—while keeping real-world verification where it belongs—the system ensures transparent, weighted, and tamper-proof decision-making without unnecessary complexity.

I originally developed StakeVote during a hackathon to better understand the mechanics of on-chain governance. While Decentralized Autonomous Organizations (DAOs) are common, building a hybrid system from the ground up provided valuable insight into the underlying logic required to execute these processes securely.

This document outlines the logic, architectural decisions, and technical implementation details of the finalized application.

---

## Architectural Logic and Implementation

### 1. The Core Objective
The primary goal was to create a voting platform where influence is proportional to stake. In traditional web2 systems, voting can be susceptible to manipulation. By moving the voting process to the blockchain, we ensure that every vote is immutable and transparent. In this system, if a stakeholder holds 5,000 tokens, their vote carries a weight of 5,000.

### 2. Smart Contract Design
The core logic resides in a custom Solidity contract, `StakeVotingGovernance.sol`. 

Key design considerations included:
- **State Machine Implementation:** A proposal requires distinct lifecycle phases (`Created`, `Voting`, `Ended`) to enforce strict temporal bounds on voting activity.
- **Vote Integrity:** To prevent double-voting, the contract utilizes a mapping (`mapping(address => bool) public hasVoted`) ensuring that once a vote is cast, the stakeholder's decision is permanently locked.
- **Access Control:** Critical state transitions, such as assigning stake and advancing proposal phases, are restricted via a `chairperson` modifier to maintain administrative security.

### 3. Technology Stack
The application was built using a modern, scalable stack intended for eventual production deployment:
* **Frontend:** Next.js (React) combined with TailwindCSS for the user interface.
* **Backend:** Next.js Server Actions interacting with a Neon Serverless PostgreSQL database. 
* **Blockchain Infrastructure:** Polygon Amoy Testnet, chosen for its efficiency during the testing phase.
* **Web3 Integration:** `ethers.js` facilitates communication between the frontend client, MetaMask, and the deployed smart contracts.

### 4. Admin Panel Integration
Initially, contract deployment and snapshot execution were handled via isolated Node.js CLI scripts. This approach proved difficult to manage and scale.

The solution was to integrate an Admin Panel directly into the Next.js application. By porting the CLI scripts into Next.js Server Actions, the application now features a secure `/admin` route. When executing a deployment, the server securely accesses the administrative private key (isolated within `.env.local` to prevent client-side exposure) to compile and deploy the contract to the Polygon Amoy network. The newly generated contract address is then automatically recorded in the PostgreSQL database.

The public-facing frontend then queries the database to identify the most recent active proposal and dynamically binds the user interface to that specific smart contract, creating a seamless synchronization between off-chain data and on-chain state.

---

## Local Setup and Installation

To run this project locally, follow the steps below:

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd stake-vote
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory. You will need a Neon Postgres database connection, an Alchemy RPC URL for the Polygon Amoy network, and a test wallet private key.

```env
DATABASE_URL="postgresql://<user>:<password>@<your-neon-host>/neondb?sslmode=require"
RPC_URL="https://polygon-amoy.g.alchemy.com/v2/<your-alchemy-key>"
ADMIN_PRIVATE_KEY="0xYourPrivateKeyHere"
NEXT_PUBLIC_CHAIN_ID=80002
ADMIN_PASSWORD="your-secure-password"
```

### 3. Start the Development Server
```bash
npm run dev
```
- Navigate to `http://localhost:3000` to view the voter interface.
- Navigate to `http://localhost:3000/admin` to access the Admin Panel (Authenticate using the username `admin` and the password defined in your environment variables).

---

## Future Enhancements & To-Dos

While the core end-to-end pipeline is functional, there are several upgrades planned for full production readiness:

- [ ] **Partial Voting Power:** Upgrade the `StakeVotingGovernance.sol` contract to allow users to specify the exact amount of stake they wish to cast, rather than defaulting to 100% of their balance. (Requires local Foundry environment for compilation).
- [ ] **Automated Cron Snapshots:** Transition the manual "Run Snapshot" button in the Admin Panel into a scheduled cron job (e.g., using Vercel Cron) to strictly enforce off-chain stake cutoffs at predetermined timestamps.
- [ ] **Decentralized Storage:** Migrate proposal descriptions from the centralized PostgreSQL database to IPFS to ensure true end-to-end immutability.
- [ ] **Mainnet Migration:** Transition the infrastructure from the Polygon Amoy Testnet to Polygon Mainnet for live, real-value governance.

---

## Deployment to Vercel

1. Push code to GitHub.
2. Import repository into Vercel.
3. Add all variables from `.env.local` to Vercel Environment Variables.
4. Deploy.
