import 'server-only'
import { Contract, ContractFactory, JsonRpcProvider, Wallet } from 'ethers'
import { getChainConfig } from '@/lib/config/server'
import artifact from '@/lib/contract/StakeVotingGovernance.json'

/**
 * Admin-side (chairperson) chain access. Runs with ADMIN_PRIVATE_KEY over
 * RPC_URL. The deploy artifact is committed and regenerated with
 * `pnpm build:artifact`.
 */

function getAdminWallet(): Wallet {
  const { rpcUrl, adminPrivateKey } = getChainConfig()
  return new Wallet(adminPrivateKey, new JsonRpcProvider(rpcUrl))
}

function getAdminContract(address: string): Contract {
  return new Contract(address, artifact.abi, getAdminWallet())
}

export async function deployGovernanceContract(quorumBps: number): Promise<string> {
  if (!Number.isInteger(quorumBps) || quorumBps < 1 || quorumBps > 10_000) {
    throw new Error('quorumBps must be an integer between 1 and 10000')
  }
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, getAdminWallet())
  const contract = await factory.deploy(quorumBps)
  await contract.waitForDeployment()
  return contract.getAddress()
}

export interface InitializeVotingResult {
  assigned: number
  skipped: number
  total: number
}

/**
 * Prepares the deployed contract and opens voting:
 * setProposal → assignStake per snapshot row → startVoting.
 *
 * Resumable: already-completed steps are detected on-chain and skipped, so
 * a run that fails mid-loop (RPC hiccup, out of gas) can simply be retried.
 * The DB status must only move to `voting` after this resolves.
 */
export async function initializeVoting(
  contractAddress: string,
  description: string,
  snapshots: { wallet_address: string; stake_amount: string }[]
): Promise<InitializeVotingResult> {
  const contract = getAdminContract(contractAddress)

  const existingDescription: string = await contract.proposalDescription()
  if (existingDescription.length === 0) {
    const tx = await contract.setProposal(description)
    await tx.wait()
  }

  let assigned = 0
  let skipped = 0
  for (const s of snapshots) {
    const amount = BigInt(s.stake_amount)
    if (amount <= 0n) {
      skipped++
      continue
    }
    const alreadyAssigned: bigint = await contract.getUserVotingPower(s.wallet_address)
    if (alreadyAssigned > 0n) {
      skipped++
      continue
    }
    try {
      const tx = await contract.assignStake(s.wallet_address, amount)
      await tx.wait()
      assigned++
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err)
      throw new Error(
        `Stake assignment failed at voter ${s.wallet_address} ` +
          `(${assigned + skipped} of ${snapshots.length} processed). ` +
          `Safe to retry — completed assignments are skipped. Cause: ${reason}`
      )
    }
  }

  const tx = await contract.startVoting()
  await tx.wait()

  return { assigned, skipped, total: snapshots.length }
}

/**
 * Idempotent: if a previous attempt ended voting on-chain but the DB update
 * failed, the retry finds the contract already Ended and just proceeds.
 */
export async function endVotingOnChain(contractAddress: string): Promise<void> {
  const contract = getAdminContract(contractAddress)
  const phase: bigint = await contract.getPhase()
  if (Number(phase) === 2 /* Ended */) return
  const tx = await contract.endVoting()
  await tx.wait()
}

export interface FinalTally {
  yesVotes: string
  noVotes: string
  quorumReached: boolean
  result: 'APPROVED' | 'REJECTED' | 'FAILED_QUORUM'
}

/** Reads the certified outcome. Only valid once the contract phase is Ended. */
export async function readFinalTally(contractAddress: string): Promise<FinalTally> {
  const contract = getAdminContract(contractAddress)
  const [[yesVotes, noVotes], quorumReached, result] = await Promise.all([
    contract.getVoteCounts() as Promise<[bigint, bigint]>,
    contract.quorumReached() as Promise<boolean>,
    contract.result() as Promise<string>,
  ])
  return {
    yesVotes: yesVotes.toString(),
    noVotes: noVotes.toString(),
    quorumReached,
    result: result as FinalTally['result'],
  }
}
