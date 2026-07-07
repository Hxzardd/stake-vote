'use client'

import { useCallback, useEffect, useState } from 'react'
import type { JsonRpcSigner } from 'ethers'
import { PHASE } from '@/lib/contract/abi'
import { fetchVotingData, type VotingData } from '@/lib/contract/reads'
import { submitVote } from '@/lib/contract/write'

export type VotingMode = 'sandbox' | 'onchain'

export interface VoteReceipt {
  choice: 'yes' | 'no'
  weight: string
  wallet: string
  contractAddress: string | null
  txHash: string | null
  timestamp: number
  onChain: boolean
}

/**
 * Sandbox mode (no deployed contract): the simulation is honest — a fixed,
 * deterministic voting power, only the user's own vote is counted, and the
 * receipt is explicitly flagged as not recorded on chain.
 */
const SANDBOX_USER_POWER = 250n
const SANDBOX_TOTAL_POWER = 1000n

interface ChainSnapshot {
  key: string
  data: VotingData
}

function snapshotKey(address: string, contractAddress: string): string {
  return `${address.toLowerCase()}:${contractAddress.toLowerCase()}`
}

export function useVoting(
  signer: JsonRpcSigner | null,
  address: string | null,
  contractAddress: string | null
) {
  const mode: VotingMode = contractAddress ? 'onchain' : 'sandbox'

  const [chainSnapshot, setChainSnapshot] = useState<ChainSnapshot | null>(null)
  const [sandboxVote, setSandboxVote] = useState<{ wallet: string; choice: 'yes' | 'no' } | null>(null)
  const [receipt, setReceipt] = useState<VoteReceipt | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  // Pure fetch — no setState here. Callers store the result themselves so
  // the effect only touches state in async continuations.
  const fetchSnapshot = useCallback(async (): Promise<ChainSnapshot | null> => {
    if (!signer || !address || !contractAddress) return null
    const key = snapshotKey(address, contractAddress)
    const data = await fetchVotingData(signer, address, contractAddress)
    return { key, data }
  }, [signer, address, contractAddress])

  useEffect(() => {
    let cancelled = false
    fetchSnapshot()
      .then((snapshot) => {
        if (cancelled || !snapshot) return
        setChainSnapshot(snapshot)
        setLastUpdated(Date.now())
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.error('Voting data fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch voting data')
      })
    return () => {
      cancelled = true
    }
  }, [fetchSnapshot])

  // Values derived per wallet+contract so switching accounts never shows
  // stale data from the previous identity.
  const currentKey =
    address && contractAddress ? snapshotKey(address, contractAddress) : null
  const chain = chainSnapshot && chainSnapshot.key === currentKey ? chainSnapshot.data : null

  // Loading = we expect chain data for the current wallet+contract but
  // don't have it yet (and haven't failed).
  const isLoading = currentKey !== null && Boolean(signer) && chain === null && error === null

  const activeSandboxVote =
    mode === 'sandbox' && sandboxVote && sandboxVote.wallet === address ? sandboxVote : null
  const activeReceipt =
    receipt &&
    receipt.wallet === address &&
    receipt.contractAddress === contractAddress
      ? receipt
      : null

  const yesVotes =
    mode === 'sandbox'
      ? activeSandboxVote?.choice === 'yes'
        ? SANDBOX_USER_POWER.toString()
        : '0'
      : (chain?.yesVotes ?? 0n).toString()
  const noVotes =
    mode === 'sandbox'
      ? activeSandboxVote?.choice === 'no'
        ? SANDBOX_USER_POWER.toString()
        : '0'
      : (chain?.noVotes ?? 0n).toString()
  const userStake =
    mode === 'sandbox' ? SANDBOX_USER_POWER.toString() : (chain?.userStake ?? 0n).toString()
  const totalVotingPower =
    mode === 'sandbox'
      ? SANDBOX_TOTAL_POWER.toString()
      : (chain?.totalVotingPower ?? 0n).toString()
  const hasVoted = mode === 'sandbox' ? activeSandboxVote !== null : (chain?.hasVoted ?? false)
  const phase = mode === 'sandbox' ? PHASE.Voting : (chain?.phase ?? PHASE.Created)
  const proposal = mode === 'sandbox' ? '' : (chain?.proposal ?? '')

  const vote = async (support: boolean): Promise<void> => {
    if (!address) {
      setError('Wallet not connected')
      return
    }
    if (hasVoted) {
      setError('You have already voted')
      return
    }

    if (mode === 'sandbox') {
      setIsSubmitting(true)
      setError(null)
      await new Promise((r) => setTimeout(r, 600))
      setSandboxVote({ wallet: address, choice: support ? 'yes' : 'no' })
      setReceipt({
        choice: support ? 'yes' : 'no',
        weight: SANDBOX_USER_POWER.toString(),
        wallet: address,
        contractAddress: null,
        txHash: null,
        timestamp: Date.now(),
        onChain: false,
      })
      setIsSubmitting(false)
      return
    }

    if (!signer || !contractAddress) {
      setError('Wallet not connected')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const txHash = await submitVote(signer, support, contractAddress)
      setReceipt({
        choice: support ? 'yes' : 'no',
        weight: (chain?.userStake ?? 0n).toString(),
        wallet: address,
        contractAddress,
        txHash,
        timestamp: Date.now(),
        onChain: true,
      })
      const snapshot = await fetchSnapshot()
      if (snapshot) {
        setChainSnapshot(snapshot)
        setLastUpdated(Date.now())
      }
    } catch (err) {
      console.error('Vote submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
    } finally {
      setIsSubmitting(false)
    }
  }

  // User-initiated refresh (event handler — stored pending state is fine here).
  const refetch = async (): Promise<void> => {
    setIsRefreshing(true)
    try {
      const snapshot = await fetchSnapshot()
      if (snapshot) {
        setChainSnapshot(snapshot)
        setLastUpdated(Date.now())
        setError(null)
      }
    } catch (err) {
      console.error('Voting data refetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to refetch voting data')
    } finally {
      setIsRefreshing(false)
    }
  }

  return {
    mode,
    proposal,
    yesVotes,
    noVotes,
    userStake,
    totalVotingPower,
    hasVoted,
    phase,
    isLoading,
    isRefreshing,
    isSubmitting,
    error,
    lastUpdated,
    receipt: activeReceipt,
    vote,
    refetch,
  }
}
