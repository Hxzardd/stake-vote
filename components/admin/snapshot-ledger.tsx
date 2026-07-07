import { getSnapshotLedger } from '@/lib/db/snapshots'
import { formatPower, percentOf } from '@/lib/format'

/** The sealed snapshot as an auditable table: wallet, stake, share of total. */
export default async function SnapshotLedger({ proposalId }: { proposalId: string }) {
  const { rows, totalStake } = await getSnapshotLedger(proposalId)
  if (rows.length === 0) return null

  return (
    <details className="group">
      <summary
        className="cursor-pointer text-xs font-semibold tracking-widest list-none select-none"
        style={{ color: '#52525B', letterSpacing: '0.1em' }}
      >
        <span className="group-open:hidden">▸</span>
        <span className="hidden group-open:inline">▾</span>{' '}
        SNAPSHOT LEDGER — {rows.length} WALLETS · {formatPower(totalStake)} TOTAL POWER
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #27272A' }}>
              <Th align="left">#</Th>
              <Th align="left">WALLET</Th>
              <Th align="right">STAKE</Th>
              <Th align="right">% OF TOTAL</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.wallet_address} style={{ borderBottom: '1px solid #1F1F23' }}>
                <Td>{i + 1}</Td>
                <Td>
                  <span style={{ wordBreak: 'break-all' }}>{row.wallet_address}</span>
                </Td>
                <Td align="right">{formatPower(row.stake_amount)}</Td>
                <Td align="right">{percentOf(row.stake_amount, totalStake).toFixed(1)}%</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

function Th({ children, align }: { children: React.ReactNode; align: 'left' | 'right' }) {
  return (
    <th
      className="py-2 pr-4 font-semibold tracking-widest"
      style={{ color: '#52525B', textAlign: align, letterSpacing: '0.08em' }}
    >
      {children}
    </th>
  )
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td
      className="py-2 pr-4"
      style={{ color: '#A1A1AA', fontFamily: 'var(--font-mono, monospace)', textAlign: align }}
    >
      {children}
    </td>
  )
}
