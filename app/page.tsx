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

function deriveProposalRef(id?: string, createdAt?: string): string {
  if (createdAt) {
    const d = new Date(createdAt)
    return `PROP-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  if (id) return `PROP-${id.slice(0, 6).toUpperCase()}`
  return 'PROP-001'
}

export default function Home() {
  const web3 = useWeb3()

  const [activeProposal, setActiveProposal] = useState<ActiveProposal | null>(null)
  const [loadingProposal, setLoadingProposal] = useState(true)

  useEffect(() => {
    fetch('/api/active-proposal')
      .then(res => res.json())
      .then(data => { if (!data.error) setActiveProposal(data) })
      .catch(() => {})
      .finally(() => setLoadingProposal(false))
  }, [])

  const contractAddress = activeProposal?.contract_address || null
  const voting = useVoting(web3.signer, web3.address, contractAddress)

  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null)

  const handleVote = async (direction: 'yes' | 'no') => {
    if (voting.isSubmitting) return
    await voting.vote(direction === 'yes')
    if (!voting.error) setUserVote(direction)
  }

  const totalVotes = voting.yesVotes + voting.noVotes
  const yesPercentage = totalVotes > 0 ? (voting.yesVotes / totalVotes) * 100 : 0
  const noPercentage = totalVotes > 0 ? (voting.noVotes / totalVotes) * 100 : 0
  const participation = voting.totalVotingPower > 0 ? (totalVotes / voting.totalVotingPower) * 100 : 0
  const proposalRef = deriveProposalRef(activeProposal?.id, activeProposal?.created_at)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header
        isConnected={web3.isConnected}
        isConnecting={web3.isConnecting}
        address={web3.address}
        wrongNetwork={web3.wrongNetwork}
        onConnect={web3.connect}
        onDisconnect={web3.disconnect}
        onSwitchNetwork={web3.switchChain}
      />

      {/* Wrong network banner */}
      {web3.wrongNetwork && (
        <div
          className="fixed top-[56px] left-0 right-0 z-40 px-6 py-2.5 flex items-center justify-between animate-slide-in"
          style={{ background: 'var(--error-bg)', borderBottom: '1px solid #FCA5A5' }}
        >
          <p className="text-sm" style={{ color: 'var(--error)' }}>
            <span className="font-semibold">Wrong Network —</span> Switch to Polygon Amoy (80002) to vote
          </p>
          <button
            onClick={web3.switchChain}
            className="text-sm font-semibold px-3 py-1 rounded transition-all hover:opacity-80"
            style={{ background: 'var(--error)', color: '#fff', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}
          >
            Switch Network
          </button>
        </div>
      )}

      {/* Page body */}
      <div
        className="mx-auto px-5"
        style={{
          maxWidth: '680px',
          paddingTop: web3.wrongNetwork ? '112px' : '88px',
          paddingBottom: '80px',
        }}
      >
        {/* No proposal state */}
        {!loadingProposal && !activeProposal && (
          <div
            className="mb-8 px-4 py-3 rounded text-sm animate-slide-in"
            style={{ background: 'var(--warning-bg)', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', color: 'var(--warning)' }}
          >
            <span className="font-semibold">No active proposal —</span> Visit the admin panel to create and deploy one.
          </div>
        )}

        {/* ACT 1: Proposal */}
        <ProposalSection
          title={activeProposal?.title}
          description={activeProposal?.description || voting.proposal}
          quorumBps={activeProposal?.quorum_bps}
          status={activeProposal?.status}
          createdAt={activeProposal?.created_at}
          proposalRef={proposalRef}
          loading={loadingProposal}
        />

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '40px 0' }} />

        {/* ACT 2: Vote */}
        <VotingPanel
          isConnected={web3.isConnected}
          hasVoted={voting.hasVoted}
          userVote={userVote}
          userStake={voting.userStake}
          totalVotingPower={voting.totalVotingPower}
          onVote={handleVote}
          isLoading={voting.isSubmitting}
          error={voting.error || web3.error}
          phase={voting.phase}
          proposalRef={proposalRef}
          onConnect={web3.connect}
        />

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '40px 0' }} />

        {/* ACT 3: Results */}
        <ResultsSection
          yesVotes={voting.yesVotes}
          noVotes={voting.noVotes}
          yesPercentage={yesPercentage}
          noPercentage={noPercentage}
          participation={participation}
          quorumBps={activeProposal?.quorum_bps}
          totalVotingPower={voting.totalVotingPower}
          loading={voting.isLoading && !voting.yesVotes && !voting.noVotes}
        />

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '40px 0' }} />

        {/* Verification */}
        <VerificationSection
          contractAddress={contractAddress}
          txHash={voting.txHash}
          chainId={80002}
        />

        {/* Footer */}
        <p
          className="text-center mt-16 text-xs"
          style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}
        >
          Votes are immutably recorded on Polygon Amoy · Every transaction is publicly auditable
        </p>
      </div>
    </main>
  )
}
