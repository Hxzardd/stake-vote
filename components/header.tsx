'use client'

import WalletButton from '@/components/wallet-button'

interface HeaderProps {
  isConnected: boolean
  isConnecting?: boolean
  address: string | null
  wrongNetwork: boolean
  onConnect: () => void
  onDisconnect: () => void
  onSwitchNetwork?: () => void
}

export default function Header({
  isConnected,
  isConnecting,
  address,
  wrongNetwork,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: '56px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="h-full mx-auto px-6 flex items-center justify-between"
        style={{ maxWidth: '1100px' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="2" fill="var(--brand-primary)" />
            <rect x="6" y="7" width="10" height="1.5" fill="white" opacity="0.9" />
            <rect x="6" y="11" width="16" height="1.5" fill="white" opacity="0.9" />
            <rect x="6" y="15" width="13" height="1.5" fill="white" opacity="0.9" />
            <rect x="6" y="19" width="8" height="1.5" fill="white" opacity="0.5" />
            <rect x="19" y="15" width="3" height="7" fill="var(--brand-secondary)" rx="1" />
          </svg>
          <div>
            <span
              className="font-semibold tracking-tight"
              style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1 }}
            >
              StakeVote
            </span>
            <span
              className="hidden sm:block text-xs"
              style={{ color: 'var(--text-muted)', lineHeight: 1, marginTop: '2px' }}
            >
              On-Chain Corporate Governance
            </span>
          </div>
        </div>

        {/* Wallet */}
        <WalletButton
          isConnected={isConnected}
          isConnecting={isConnecting}
          address={address}
          wrongNetwork={wrongNetwork}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onSwitchNetwork={onSwitchNetwork}
        />
      </div>
    </header>
  )
}
