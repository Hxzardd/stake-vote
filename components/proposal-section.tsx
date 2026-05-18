import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProposalSectionProps {
  title?: string
  description?: string
  quorumBps?: number
  status?: string
  createdAt?: string
}

export default function ProposalSection({ 
  title = '', 
  description = '', 
  quorumBps = 0, 
  status = '', 
  createdAt = ''
}: ProposalSectionProps) {
  
  const displayTitle = title || 'Loading Proposal...'
  const displayDescription = description || 'Please wait...'
  const quorumPercentage = quorumBps ? (quorumBps / 100).toFixed(0) + '%' : 'N/A'
  
  // Format the deadline as 7 days after creation (just an example calculation)
  const deadline = createdAt 
    ? new Date(new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBD'
    
  // Format status cleanly
  const displayStatus = status === 'voting' ? 'Voting Live' : 
                        status === 'ended' ? 'Voting Closed' : 
                        status === 'deployed' ? 'Awaiting Start' :
                        status ? status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {displayTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {displayDescription}
        </p>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Voting Deadline</p>
            <p className="font-semibold text-foreground">{deadline}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quorum Required</p>
            <p className="font-semibold text-foreground">{quorumPercentage}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold text-accent">{displayStatus}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
