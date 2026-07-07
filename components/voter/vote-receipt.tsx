'use client'

import AddressDisplay from '@/components/shared/address-display'
import TxHashDisplay from '@/components/shared/tx-hash-display'
import { formatPower } from '@/lib/format'
import type { VoteReceipt as Receipt } from '@/hooks/use-voting'

interface VoteReceiptProps {
  receipt: Receipt
  proposalRef: string
}

/** Durable certification of a cast vote — restrained, receipt-like. */
export default function VoteReceipt({ receipt, proposalRef }: VoteReceiptProps) {
  const choiceColor = receipt.choice === 'yes' ? 'var(--vote-yes)' : 'var(--vote-no)'

  return (
    <section
      className="animate-scale-up"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-raised)',
        overflow: 'hidden',
      }}
    >
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px dashed var(--border-default)' }}
      >
        <span
          className="text-xs font-semibold tracking-widest"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
        >
          VOTE RECEIPT
        </span>
        <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {proposalRef}
        </span>
      </div>

      <dl className="px-5 py-4 space-y-2.5 text-sm">
        <ReceiptRow label="CHOICE">
          <span
            className="font-semibold tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: choiceColor, letterSpacing: '0.06em' }}
          >
            {receipt.choice.toUpperCase()}
          </span>
        </ReceiptRow>
        <ReceiptRow label="WEIGHT">
          <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPower(receipt.weight)}</span>
        </ReceiptRow>
        <ReceiptRow label="WALLET">
          <AddressDisplay address={receipt.wallet} />
        </ReceiptRow>
        {receipt.contractAddress && (
          <ReceiptRow label="CONTRACT">
            <AddressDisplay address={receipt.contractAddress} showExplorer />
          </ReceiptRow>
        )}
        {receipt.txHash && (
          <ReceiptRow label="TRANSACTION">
            <TxHashDisplay hash={receipt.txHash} />
          </ReceiptRow>
        )}
        <ReceiptRow label="TIMESTAMP">
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {new Date(receipt.timestamp).toISOString()}
          </span>
        </ReceiptRow>
      </dl>

      {/* Certification seal */}
      <div
        className="px-5 py-3 text-center"
        style={{
          borderTop: '1px dashed var(--border-default)',
          background: receipt.onChain ? 'var(--success-bg)' : 'var(--warning-bg)',
        }}
      >
        <span
          className="text-xs font-semibold tracking-widest"
          style={{
            fontFamily: 'var(--font-mono)',
            color: receipt.onChain ? 'var(--success)' : 'var(--warning)',
            letterSpacing: '0.1em',
          }}
        >
          {receipt.onChain ? '✓ RECORDED ON POLYGON AMOY' : '✕ NOT RECORDED ON CHAIN — SANDBOX'}
        </span>
      </div>
    </section>
  )
}

function ReceiptRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt
        className="text-xs font-semibold tracking-widest"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
      >
        {label}
      </dt>
      <dd style={{ color: 'var(--text-primary)' }}>{children}</dd>
    </div>
  )
}
