'use client';

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VotingPanelProps {
  isConnected: boolean
  hasVoted: boolean
  userVote: 'yes' | 'no' | null
  userStake: number
  onVote: (direction: 'yes' | 'no') => void
  isLoading?: boolean
  error?: string | null
  phase?: number
}

export default function VotingPanel({
  isConnected,
  hasVoted,
  userVote,
  userStake,
  onVote,
  isLoading = false,
  error = null,
  phase = 1,
}: VotingPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Vote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isConnected ? (
          <>
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground">Your Voting Power</p>
              <p className="text-2xl font-bold text-primary">{userStake} tokens</p>
              <p className="text-xs text-muted-foreground mt-2">
                Based on your current stake in the organization
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </div>
            )}

            {phase !== 1 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-amber-900">Voting is Closed</p>
                <p className="text-xs text-amber-800 mt-1">This proposal is not currently in the voting phase.</p>
              </div>
            ) : !hasVoted ? (
              <div className="space-y-3">
                <Button
                  onClick={() => onVote('yes')}
                  disabled={isLoading}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 font-semibold disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Vote Yes'}
                </Button>
                <Button
                  onClick={() => onVote('no')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 font-semibold disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Vote No'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900">
                    ✓ Vote Recorded
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    {userVote 
                      ? `You voted ${userVote === 'yes' ? 'Yes' : 'No'} with ${userStake} voting power`
                      : `You have successfully voted with ${userStake} voting power`}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Your vote has been immutably recorded on the blockchain
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4 text-center py-6">
            <p className="text-foreground font-medium">Connect Your Wallet to Vote</p>
            <p className="text-sm text-muted-foreground">
              Connect MetaMask to view your voting power and participate in
              stake-weighted voting
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
