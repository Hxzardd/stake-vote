'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Check } from 'lucide-react'
import { explorerTxUrl } from '@/lib/config/client'
import { shortHash } from '@/lib/format'

interface TxHashDisplayProps {
  hash: string
  className?: string
}

export default function TxHashDisplay({ hash, className = '' }: TxHashDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-code)', fontSize: '0.8125rem' }}
    >
      <span>{shortHash(hash)}</span>
      <button
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy hash'}
        aria-label="Copy tx hash"
        className="hover:opacity-80 transition-opacity"
      >
        {copied
          ? <Check size={11} style={{ color: 'var(--success)' }} />
          : <Copy size={11} style={{ color: 'var(--text-muted)' }} />
        }
      </button>
      <a
        href={explorerTxUrl(hash)}
        target="_blank"
        rel="noreferrer"
        title="View on PolygonScan"
        aria-label="View on PolygonScan"
        className="hover:opacity-80 transition-opacity"
      >
        <ExternalLink size={11} style={{ color: 'var(--text-muted)' }} />
      </a>
    </span>
  )
}
