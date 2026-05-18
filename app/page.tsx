'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/header'
import ProposalSection from '@/components/proposal-section'
import VotingPanel from '@/components/voting-panel'
import ResultsSection from '@/components/results-section'
import VerificationSection from '@/components/verification-section'
import { useWeb3 } from '@/hooks/useWeb3'
import { useVoting } from '@/hooks/useVoting'

interface ActiveProposal {
  id: string
  title: string
  description: string
  contract_address: string
  status: string
  quorum_bps?: number
  created_at?: string
}

export default function Home() {
  const web3 = useWeb3()
  
  const [activeProposal, setActiveProposal] = useState<ActiveProposal | null>(null)
  const [loadingProposal, setLoadingProposal] = useState(true)

  useEffect(() => {
    fetch('/api/active-proposal')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setActiveProposal(data)
      })
      .catch(console.error)
      .finally(() => setLoadingProposal(false))
  }, [])

  const contractAddress = activeProposal?.contract_address || null
  const voting = useVoting(web3.signer, web3.address, contractAddress)
  
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null)

  // Format wallet address for display
  const formatAddress = (address: string | null) => {
    if (!address) return null
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleConnectWallet = async () => {
    await web3.connect()
  }

  const handleDisconnectWallet = async () => {
    await web3.disconnect()
    setUserVote(null)
  }

  const handleVote = async (direction: 'yes' | 'no') => {
    if (voting.isSubmitting) return
    
    const support = direction === 'yes'
    await voting.vote(support)
    
    if (!voting.error && voting.txHash) {
      setUserVote(direction)
    }
  }

  const totalVotes = voting.yesVotes + voting.noVotes
  const yesPercentage =
    totalVotes > 0 ? (voting.yesVotes / totalVotes) * 100 : 0
  const noPercentage =
    totalVotes > 0 ? (voting.noVotes / totalVotes) * 100 : 0
  const participation =
    voting.totalVotingPower > 0
      ? (totalVotes / voting.totalVotingPower) * 100
      : 0

  return (
    <main className="min-h-screen bg-background">
      <Header
        isConnected={web3.isConnected}
        walletAddress={formatAddress(web3.address)}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />

      <div className="max-w-4xl mx-auto px-6 py-16">
        {web3.wrongNetwork && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            <p className="font-medium">Wrong Network</p>
            <p className="mt-1 text-sm">
              Please switch to the configured network (Polygon Amoy Testnet) to use this application.
            </p>
            <button
              onClick={web3.switchChain}
              className="mt-3 rounded bg-red-100 px-3 py-1.5 text-sm font-medium hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70"
            >
              Switch Network
            </button>
          </div>
        )}
        {!loadingProposal && !activeProposal && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-medium">No active proposal found</p>
            <p className="mt-1 text-sm">
              There are no deployed proposals in the database. Please visit the admin panel to deploy one.
            </p>
          </div>
        )}
        
        <ProposalSection 
          title={activeProposal?.title}
          description={activeProposal?.description || voting.proposal}
          quorumBps={activeProposal?.quorum_bps}
          status={activeProposal?.status}
          createdAt={activeProposal?.created_at}
        />

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <VotingPanel
            isConnected={web3.isConnected}
            hasVoted={voting.hasVoted}
            userVote={userVote}
            userStake={voting.userStake}
            onVote={handleVote}
            isLoading={voting.isSubmitting}
            error={voting.error || web3.error}
            phase={voting.phase}
          />

          <ResultsSection
            yesVotes={voting.yesVotes}
            noVotes={voting.noVotes}
            yesPercentage={yesPercentage}
            noPercentage={noPercentage}
            participation={participation}
          />
        </div>

        <VerificationSection />
      </div>
    </main>
  )
}
