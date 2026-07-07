import type { ContractTransactionResponse, Signer } from 'ethers'
import { getVotingContract } from '@/lib/contract/reads'

/** Casts a stake-weighted vote and resolves to the confirmed tx hash. */
export async function submitVote(
  signer: Signer,
  support: boolean,
  contractAddress: string
): Promise<string> {
  const contract = getVotingContract(signer, contractAddress)

  const tx: ContractTransactionResponse | null = await contract.vote(support)
  if (!tx) throw new Error('Failed to send transaction')

  const receipt = await tx.wait()
  if (!receipt) throw new Error('Transaction failed')

  return receipt.hash
}
