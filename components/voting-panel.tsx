'use client'

import VoteBallot from '@/components/vote-ballot'

interface VotingPanelProps {
  isConnected: boolean
  hasVoted: boolean
  userVote: 'yes' | 'no' | null
  userStake: number
  totalVotingPower?: number
  onVote: (direction: 'yes' | 'no') => void
  isLoading?: boolean
  error?: string | null
  phase?: number
  proposalRef?: string
  onConnect?: () => void
}

export default function VotingPanel(props: VotingPanelProps) {
  return (
    <section>
      <h2
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}
      >
        Cast Your Vote
      </h2>
      <VoteBallot {...props} />
    </section>
  )
}
