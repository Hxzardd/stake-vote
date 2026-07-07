/**
 * Minimal ABI for client-side reads and voting. The full ABI + bytecode
 * used for deployment lives in the committed artifact
 * (lib/contract/StakeVotingGovernance.json, regenerate with `pnpm build:artifact`).
 */
export const GOVERNANCE_ABI = [
  'function proposalDescription() view returns (string)',
  'function getVoteCounts() view returns (uint256, uint256)',
  'function getUserVotingPower(address) view returns (uint256)',
  'function hasVoted(address) view returns (bool)',
  'function totalVotingPower() view returns (uint256)',
  'function getPhase() view returns (uint8)',
  'function quorumReached() view returns (bool)',
  'function vote(bool support)',
] as const

/** Mirrors the contract's Phase enum. */
export const PHASE = {
  Created: 0,
  Voting: 1,
  Ended: 2,
} as const

export type Phase = (typeof PHASE)[keyof typeof PHASE]
