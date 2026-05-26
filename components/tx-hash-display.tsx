'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Check } from 'lucide-react'
import TxStatus, { type TxState } from '@/components/tx-status'

interface TxHashDisplayProps {
  hash: string
  state?: TxState
  showStatus?: boolean
  className?: string
}

export default function TxHashDisplay({
  hash,
  state = 'finalized',
  showStatus = true,
  className = '',
}: TxHashDisplayProps) {
  const [copied, setCopied] = useState(false)

  const display = `${hash.slice(0, 8)}...${hash.slice(-6)}`
  const explorerUrl = `https://amoy.polygonscan.com/tx/${hash}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {showStatus && <TxStatus state={state} />}
      <span
        className="inline-flex items-center gap-1"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-code)', fontSize: '0.8125rem' }}
      >
        <span>{display}</span>
        <button onClick={handleCopy} title={copied ? 'Copied!' : 'Copy hash'} aria-label="Copy tx hash" className="hover:opacity-80 transition-opacity">
          {copied
            ? <Check size={11} style={{ color: 'var(--success)' }} />
            : <Copy size={11} style={{ color: 'var(--text-muted)' }} />
          }
        </button>
        <a href={explorerUrl} target="_blank" rel="noreferrer" title="View on PolygonScan" aria-label="View on PolygonScan" className="hover:opacity-80 transition-opacity">
          <ExternalLink size={11} style={{ color: 'var(--text-muted)' }} />
        </a>
      </span>
    </div>
  )
}
