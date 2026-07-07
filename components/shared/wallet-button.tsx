'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Copy, ExternalLink, LogOut, Check, Loader2 } from 'lucide-react'
import NetworkBadge from '@/components/shared/network-badge'
import { explorerAddressUrl } from '@/lib/config/client'
import { shortAddress } from '@/lib/format'

interface WalletButtonProps {
  isConnected: boolean
  isConnecting?: boolean
  address: string | null
  wrongNetwork: boolean
  onConnect: () => void
  onDisconnect: () => void
  onSwitchNetwork?: () => void
}

export default function WalletButton({
  isConnected,
  isConnecting,
  address,
  wrongNetwork,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}: WalletButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const short = address ? shortAddress(address) : ''
  const explorerUrl = address ? explorerAddressUrl(address) : '#'

  const handleCopy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!isConnected) {
    return (
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded transition-all active:scale-[0.97] disabled:opacity-60"
        style={{
          background: 'var(--brand-primary)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: isConnecting ? 'not-allowed' : 'pointer',
        }}
      >
        {isConnecting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <span style={{ fontSize: '16px' }}>🦊</span>
            Connect Wallet
          </>
        )}
      </button>
    )
  }

  return (
    <div ref={ref} className="relative inline-flex items-center gap-2">
      <NetworkBadge
        isConnected={isConnected}
        wrongNetwork={wrongNetwork}
        isConnecting={isConnecting}
        onSwitch={onSwitchNetwork}
      />

      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all hover:bg-[--bg-elevated] rounded"
        style={{
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          height: '36px',
          color: 'var(--text-primary)',
          background: 'var(--bg-surface)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          cursor: 'pointer',
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {short}
        <ChevronDown size={12} style={{ color: 'var(--text-muted)', transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 w-52 py-1 rounded border animate-scale-up z-50"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-floating)',
            borderRadius: 'var(--radius-md)',
          }}
          role="menu"
        >
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[--bg-elevated] transition-colors text-left"
            style={{ color: 'var(--text-primary)', cursor: 'pointer', border: 'none', background: 'transparent' }}
            role="menuitem"
          >
            {copied ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} style={{ color: 'var(--text-muted)' }} />}
            {copied ? 'Copied!' : 'Copy address'}
          </button>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[--bg-elevated] transition-colors"
            style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
            role="menuitem"
          >
            <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
            View on Explorer
          </a>
          <hr style={{ borderColor: 'var(--border-subtle)', margin: '4px 0' }} />
          <button
            onClick={() => { setOpen(false); onDisconnect() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[--bg-elevated] transition-colors text-left"
            style={{ color: 'var(--error)', cursor: 'pointer', border: 'none', background: 'transparent' }}
            role="menuitem"
          >
            <LogOut size={13} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
