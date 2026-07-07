'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/voter/header'
import ModeBanner from '@/components/shared/mode-banner'
import ProposalDossier from '@/components/voter/proposal-dossier'
import ResultsLedger from '@/components/voter/results-ledger'
import VoteReceipt from '@/components/voter/vote-receipt'
import VotingTerminal, { type TerminalState } from '@/components/voter/voting-terminal'
import { useWeb3 } from '@/hooks/use-web3'
import { useVoting } from '@/hooks/use-voting'
import { proposalRef, statusMeta, type ActiveProposal } from '@/lib/status'

const SANDBOX_QUORUM_BPS = 4000

export default function Home() {
  const web3 = useWeb3()

  const [activeProposal, setActiveProposal] = useState<ActiveProposal | null>(null)
  const [loadingProposal, setLoadingProposal] = useState(true)

  useEffect(() => {
    fetch('/api/active-proposal')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setActiveProposal(data as ActiveProposal)
      })
      .catch(() => {})
      .finally(() => setLoadingProposal(false))
  }, [])

  const sandbox = !loadingProposal && !activeProposal
  const contractAddress = activeProposal?.contract_address ?? null
  const voting = useVoting(web3.signer, web3.address, contractAddress)

  const refNumber = proposalRef(activeProposal?.id, activeProposal?.created_at)
  const quorumBps = activeProposal?.quorum_bps ?? SANDBOX_QUORUM_BPS

  // Certified DB result wins over live chain reads once voting ended.
  const certified =
    activeProposal?.status === 'ended' && activeProposal.yes_power !== null
  const yesPower = certified ? activeProposal!.yes_power! : voting.yesVotes
  const noPower = certified ? activeProposal!.no_power! : voting.noVotes
  const certifiedQuorumMet = certified ? activeProposal!.quorum_met : null

  const terminalState = deriveTerminalState({
    loadingProposal,
    sandbox,
    activeProposal,
    isConnected: web3.isConnected,
    wrongNetwork: web3.wrongNetwork,
    votingIsLoading: voting.isLoading,
    userStake: voting.userStake,
    hasVoted: voting.hasVoted,
  })

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Header
        isConnected={web3.isConnected}
        isConnecting={web3.isConnecting}
        address={web3.address}
        wrongNetwork={web3.wrongNetwork}
        onConnect={web3.connect}
        onDisconnect={web3.disconnect}
        onSwitchNetwork={web3.switchChain}
      />

      {!loadingProposal && <ModeBanner mode={sandbox ? 'sandbox' : 'onchain'} />}

      <div className="mx-auto px-4 sm:px-6 py-8 lg:py-12" style={{ maxWidth: '1140px' }}>
        <div className="grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1fr)_400px] items-start">
          {/* Left: the record */}
          <div className="min-w-0">
            <ProposalDossier
              proposal={activeProposal}
              sandbox={sandbox}
              loading={loadingProposal}
              proposalRef={refNumber}
            />

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '40px 0' }} />

            <ResultsLedger
              yesPower={yesPower}
              noPower={noPower}
              totalVotingPower={voting.totalVotingPower}
              quorumBps={quorumBps}
              certifiedQuorumMet={certifiedQuorumMet}
              certified={certified}
              refreshedAt={voting.lastUpdated ? new Date(voting.lastUpdated) : null}
              onRefetch={voting.refetch}
              isRefreshing={voting.isRefreshing}
            />
          </div>

          {/* Right: the terminal */}
          <div className="lg:sticky lg:top-[72px] space-y-5">
            <VotingTerminal
              state={terminalState}
              mode={sandbox ? 'sandbox' : 'onchain'}
              address={web3.address}
              isConnecting={web3.isConnecting}
              userStake={voting.userStake}
              totalVotingPower={voting.totalVotingPower}
              statusLabel={
                activeProposal && activeProposal.status !== 'voting'
                  ? statusMeta(activeProposal.status).label
                  : undefined
              }
              error={voting.error || web3.error}
              isSubmitting={voting.isSubmitting}
              onConnect={web3.connect}
              onSwitchNetwork={web3.switchChain}
              onVote={(support) => voting.vote(support)}
            />

            {voting.receipt && <VoteReceipt receipt={voting.receipt} proposalRef={refNumber} />}
          </div>
        </div>

        <p
          className="text-center mt-16 text-xs"
          style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}
        >
          {sandbox
            ? 'Sandbox preview · nothing here touches the blockchain'
            : 'Votes are immutably recorded on Polygon Amoy · Every transaction is publicly auditable'}
        </p>
      </div>
    </main>
  )
}

function deriveTerminalState(input: {
  loadingProposal: boolean
  sandbox: boolean
  activeProposal: ActiveProposal | null
  isConnected: boolean
  wrongNetwork: boolean
  votingIsLoading: boolean
  userStake: string
  hasVoted: boolean
}): TerminalState {
  const {
    loadingProposal,
    sandbox,
    activeProposal,
    isConnected,
    wrongNetwork,
    votingIsLoading,
    userStake,
    hasVoted,
  } = input

  if (loadingProposal) return 'loading'
  if (!isConnected) return 'disconnected'
  if (wrongNetwork) return 'network-mismatch'
  if (sandbox) return hasVoted ? 'voted' : 'open'

  const status = activeProposal!.status
  if (status === 'draft' || status === 'snapshot_taken' || status === 'deployed') {
    return 'not-open'
  }
  if (votingIsLoading) return 'loading'
  if (status === 'ended') return 'closed'
  // status === 'voting'
  if (userStake === '0') return 'ineligible'
  if (hasVoted) return 'voted'
  return 'open'
}
