'use client'

import { useEffect, useState } from 'react'
import { fetchVotingData, submitVote } from '@/lib/contract'

interface UseVotingState {
  proposal: string
  yesVotes: number
  noVotes: number
  userStake: number
  hasVoted: boolean
  totalVotingPower: number
  phase: number
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  txHash: string | null
  contractNotConfigured: boolean
}

export function useVoting(signer: any, address: string | null, contractAddress: string | null) {
  const [state, setState] = useState<UseVotingState>({
    proposal: '',
    yesVotes: 0,
    noVotes: 0,
    userStake: 0,
    hasVoted: false,
    totalVotingPower: 0,
    phase: 0,
    isLoading: false,
    isSubmitting: false,
    error: null,
    txHash: null,
    contractNotConfigured: false,
  })

  useEffect(() => {
    if (!signer || !address) {
      setState({
        proposal: '',
        yesVotes: 0,
        noVotes: 0,
        userStake: 0,
        hasVoted: false,
        totalVotingPower: 0,
        phase: 0,
        isLoading: false,
        isSubmitting: false,
        error: null,
        txHash: null,
        contractNotConfigured: false,
      })
      return
    }

    if (!contractAddress || contractAddress === '0x...') {
      setState((prev) => ({
        ...prev,
        yesVotes: 0,
        noVotes: 0,
        totalVotingPower: 1000,
        phase: 0,
        isLoading: false,
        error: null,
        contractNotConfigured: true,
      }))
      return
    }

    const fetchData = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null, contractNotConfigured: false }))
      try {
        const data = await fetchVotingData(signer, address, contractAddress)
        setState((prev) => ({
          ...prev,
          proposal: data.proposal,
          yesVotes: Number(data.yesVotes),
          noVotes: Number(data.noVotes),
          userStake: Number(data.userStake),
          hasVoted: data.hasVoted,
          totalVotingPower: Number(data.totalVotingPower),
          phase: data.phase,
          isLoading: false,
          contractNotConfigured: false,
        }))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch voting data'
        console.error('[v0] Voting data fetch error:', err)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
      }
    }

    fetchData()
  }, [signer, address, contractAddress])

  const vote = async (support: boolean) => {
    if (!signer || !address) {
      setState((prev) => ({
        ...prev,
        error: 'Wallet not connected',
      }))
      return
    }
    if (state.hasVoted) {
      setState((prev) => ({
        ...prev,
        error: 'You have already voted',
      }))
      return
    }

    const isDemo = state.contractNotConfigured || !contractAddress || contractAddress === '0x...'

    if (isDemo) {
      setState((prev) => ({
        ...prev,
        isSubmitting: true,
        error: null,
        txHash: null,
      }))
      await new Promise((r) => setTimeout(r, 600))
      const myWeight = Math.floor(Math.random() * 250) + 100
      const otherWeight = Math.floor(Math.random() * 70) + 10
      setState((prev) => ({
        ...prev,
        yesVotes: support ? prev.yesVotes + myWeight : prev.yesVotes + otherWeight,
        noVotes: !support ? prev.noVotes + myWeight : prev.noVotes + otherWeight,
        hasVoted: true,
        isSubmitting: false,
        txHash: '0x…demo',
        error: null,
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
      txHash: null,
    }))

    try {
      const hash = await submitVote(signer, support, contractAddress)
      setState((prev) => ({
        ...prev,
        hasVoted: true,
        isSubmitting: false,
        txHash: hash,
        yesVotes: support
          ? prev.yesVotes + prev.userStake
          : prev.yesVotes,
        noVotes: !support
          ? prev.noVotes + prev.userStake
          : prev.noVotes,
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit vote'
      console.error('[v0] Vote submission error:', err)
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage,
      }))
    }
  }

  const refetch = async () => {
    if (!signer || !address) return
    if (!contractAddress || contractAddress === '0x...') {
      setState((prev) => ({ ...prev, contractNotConfigured: true, isLoading: false }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null, contractNotConfigured: false }))
    try {
      const data = await fetchVotingData(signer, address, contractAddress)
      setState((prev) => ({
        ...prev,
        proposal: data.proposal,
        yesVotes: Number(data.yesVotes),
        noVotes: Number(data.noVotes),
        userStake: Number(data.userStake),
        hasVoted: data.hasVoted,
        totalVotingPower: Number(data.totalVotingPower),
        isLoading: false,
        contractNotConfigured: false,
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refetch voting data'
      console.error('[v0] Voting data refetch error:', err)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
    }
  }

  return {
    ...state,
    vote,
    refetch,
  }
}
