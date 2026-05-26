import VoteResultsBar from '@/components/vote-results-bar'

interface ResultsSectionProps {
  yesVotes: number
  noVotes: number
  yesPercentage: number
  noPercentage: number
  participation: number
  quorumBps?: number
  totalVotingPower?: number
  loading?: boolean
}

export default function ResultsSection({
  yesVotes,
  noVotes,
  yesPercentage,
  noPercentage,
  participation,
  quorumBps = 0,
  totalVotingPower = 0,
  loading = false,
}: ResultsSectionProps) {
  return (
    <section>
      <h2
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}
      >
        Live Results
      </h2>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-2 w-full" />
          <div className="skeleton h-2 w-full" />
          <div className="skeleton h-10 w-full mt-4" />
        </div>
      ) : (
        <VoteResultsBar
          yesVotes={yesVotes}
          noVotes={noVotes}
          yesPercentage={yesPercentage}
          noPercentage={noPercentage}
          participation={participation}
          quorumBps={quorumBps}
          totalVotingPower={totalVotingPower}
        />
      )}
    </section>
  )
}
