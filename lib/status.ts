/**
 * Client-safe proposal types and the official status vocabulary. Every
 * surface (voter, admin) renders lifecycle state through this module so the
 * wording stays consistent.
 */

export type ProposalStatus = 'draft' | 'snapshot_taken' | 'deployed' | 'voting' | 'ended'

export type DisplayState = 'voting' | 'deployed' | 'ended' | 'preparing'

/** Shape returned by GET /api/active-proposal. */
export interface ActiveProposal {
  id: string
  title: string
  description: string
  quorum_bps: number
  contract_address: string | null
  status: ProposalStatus
  yes_power: string | null
  no_power: string | null
  quorum_met: boolean | null
  ended_at: string | null
  created_at: string
  updated_at: string
  displayState: DisplayState
}

export interface StatusMeta {
  /** Official label, e.g. "SNAPSHOT SEALED" */
  label: string
  color: string
  bg: string
}

const STATUS_META: Record<ProposalStatus, StatusMeta> = {
  draft: { label: 'DRAFT', color: '#52525B', bg: '#F4F4F5' },
  snapshot_taken: { label: 'SNAPSHOT SEALED', color: '#1B3F8A', bg: '#EFF6FF' },
  deployed: { label: 'CONTRACT DEPLOYED', color: '#92400E', bg: '#FFFBEB' },
  voting: { label: 'VOTING OPEN', color: '#1F6B47', bg: '#F0FDF4' },
  ended: { label: 'RESULT CERTIFIED', color: '#18181B', bg: '#EDEAE5' },
}

export function statusMeta(status: ProposalStatus): StatusMeta {
  return STATUS_META[status] ?? STATUS_META.draft
}

export function quorumVerdictLabel(met: boolean): string {
  return met ? 'QUORUM MET' : 'QUORUM NOT MET'
}

/** Derives the document reference shown on the dossier, e.g. PROP-2026-07. */
export function proposalRef(id?: string, createdAt?: string): string {
  if (createdAt) {
    const d = new Date(createdAt)
    return `PROP-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  if (id) return `PROP-${id.slice(0, 6).toUpperCase()}`
  return 'PROP-SANDBOX'
}
