'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Check } from 'lucide-react'

interface AddressDisplayProps {
  address: string
  showCopy?: boolean
  showExplorer?: boolean
  truncate?: boolean
  className?: string
}

export default function AddressDisplay({
  address,
  showCopy = true,
  showExplorer = false,
  truncate = true,
  className = '',
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  const display = truncate
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address

  const explorerUrl = `https://amoy.polygonscan.com/address/${address}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-code)', fontSize: '0.8125rem' }}
    >
      <span>{display}</span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="transition-opacity hover:opacity-80 relative"
          title={copied ? 'Copied!' : 'Copy address'}
          aria-label="Copy address"
        >
          {copied
            ? <Check size={11} style={{ color: 'var(--success)' }} />
            : <Copy size={11} style={{ color: 'var(--text-muted)' }} />
          }
        </button>
      )}
      {showExplorer && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="transition-opacity hover:opacity-80"
          title="View on PolygonScan"
          aria-label="View on PolygonScan"
        >
          <ExternalLink size={11} style={{ color: 'var(--text-muted)' }} />
        </a>
      )}
    </span>
  )
}
