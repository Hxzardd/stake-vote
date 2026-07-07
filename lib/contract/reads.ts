import { Contract, type Signer } from 'ethers'
import { GOVERNANCE_ABI } from '@/lib/contract/abi'

export interface VotingData {
  proposal: string
  yesVotes: bigint
  noVotes: bigint
  userStake: bigint
  hasVoted: boolean
  totalVotingPower: bigint
  phase: number
}

export function getVotingContract(signer: Signer, contractAddress: string): Contract {
  if (!contractAddress) {
    throw new Error('Contract address not configured')
  }
  return new Contract(contractAddress, GOVERNANCE_ABI, signer)
}

export async function fetchVotingData(
  signer: Signer,
  userAddress: string,
  contractAddress: string
): Promise<VotingData> {
  const contract = getVotingContract(signer, contractAddress)

  const [proposal, [yesVotes, noVotes], userStake, hasVoted, totalVotingPower, phase] =
    await Promise.all([
      contract.proposalDescription(),
      contract.getVoteCounts(),
      contract.getUserVotingPower(userAddress),
      contract.hasVoted(userAddress),
      contract.totalVotingPower(),
      contract.getPhase(),
    ])

  return {
    proposal,
    yesVotes,
    noVotes,
    userStake,
    hasVoted,
    totalVotingPower,
    phase: Number(phase),
  }
}
