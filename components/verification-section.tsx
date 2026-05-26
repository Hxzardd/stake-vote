import AddressDisplay from '@/components/address-display'
import TxHashDisplay from '@/components/tx-hash-display'

interface VerificationSectionProps {
  contractAddress?: string | null
  txHash?: string | null
  chainId?: number
}

export default function VerificationSection({
  contractAddress,
  txHash,
  chainId = 80002,
}: VerificationSectionProps) {
  const isConfigured = !!contractAddress && contractAddress !== '0x...'

  return (
    <section>
      <h2
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}
      >
        On-Chain Verification
      </h2>

      <div
        className="p-4 rounded"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {isConfigured ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Smart Contract
                </p>
                <AddressDisplay
                  address={contractAddress!}
                  showCopy
                  showExplorer
                  truncate={false}
                />
              </div>
              {txHash && txHash !== '0x…demo' && (
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Your Transaction
                  </p>
                  <TxHashDisplay hash={txHash} state="finalized" />
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-2 pt-3"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', flexShrink: 0 }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                This vote is recorded on Polygon Amoy (Chain ID: {chainId})
              </p>
              <a
                href={`https://amoy.polygonscan.com/address/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-xs font-medium whitespace-nowrap hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                View on PolygonScan →
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--tx-confirming)', display: 'inline-block', flexShrink: 0, marginTop: '6px' }} />
              <p>Contract not yet deployed. Once voting begins, the on-chain contract address will appear here.</p>
            </div>
            <div className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                Votes weighted by verified stakeholder balance
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                Results cryptographically verifiable in real-time
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                Transactions permanent and tamper-proof
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
