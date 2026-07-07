import { NextResponse } from 'next/server'
import { getActiveProposal, type ProposalRow } from '@/lib/db/proposals'

export type DisplayState = 'voting' | 'deployed' | 'ended' | 'preparing'

export interface ActiveProposalResponse extends ProposalRow {
  displayState: DisplayState
}

function toDisplayState(status: ProposalRow['status']): DisplayState {
  switch (status) {
    case 'voting':
      return 'voting'
    case 'deployed':
      return 'deployed'
    case 'ended':
      return 'ended'
    default:
      return 'preparing'
  }
}

/**
 * The proposal the voter page should show. Priority: live (voting/deployed),
 * else the most recent certified result, else whatever is in preparation.
 * 404 only when the database has no proposals at all (→ sandbox mode).
 */
export async function GET() {
  try {
    const proposal = await getActiveProposal()
    if (!proposal) {
      return NextResponse.json({ error: 'No proposal found' }, { status: 404 })
    }
    const body: ActiveProposalResponse = {
      ...proposal,
      displayState: toDisplayState(proposal.status),
    }
    return NextResponse.json(body)
  } catch (error) {
    console.error('Error fetching active proposal:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
