import { BrowserProvider, Contract, ContractTransactionResponse } from 'ethers'

export const CONTRACT_ABI = [
  'function proposalDescription() view returns (string)',
  'function getVoteCounts() view returns (uint256, uint256)',
  'function getUserVotingPower(address) view returns (uint256)',
  'function hasVoted(address) view returns (bool)',
  'function totalVotingPower() view returns (uint256)',
  'function getPhase() view returns (uint8)',
  'function vote(bool support)',
]

export interface VotingData {
  proposal: string
  yesVotes: bigint
  noVotes: bigint
  userStake: bigint
  hasVoted: boolean
  totalVotingPower: bigint
  phase: number
}

export async function getVotingContract(signer: any, contractAddress: string) {
  if (!contractAddress || contractAddress === '0x...') {
    throw new Error('Contract address not configured')
  }
  return new Contract(contractAddress, CONTRACT_ABI, signer)
}

const EMPTY_VOTING_DATA: VotingData = {
  proposal: '',
  yesVotes: 0n,
  noVotes: 0n,
  userStake: 0n,
  hasVoted: false,
  totalVotingPower: 0n,
  phase: 0,
}

export async function fetchVotingData(
  signer: any,
  userAddress: string,
  contractAddress: string
): Promise<VotingData> {
  if (!contractAddress || contractAddress === '0x...') {
    return EMPTY_VOTING_DATA
  }
  const contract = await getVotingContract(signer, contractAddress)

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

export async function submitVote(
  signer: any,
  support: boolean,
  contractAddress: string
): Promise<string> {
  const contract = await getVotingContract(signer, contractAddress)

  const tx: ContractTransactionResponse | null = await contract.vote(support)
  if (!tx) throw new Error('Failed to send transaction')

  const receipt = await tx.wait()
  if (!receipt) throw new Error('Transaction failed')

  return receipt.hash
}
