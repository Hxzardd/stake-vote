'use client'

interface NetworkBadgeProps {
  isConnected: boolean
  wrongNetwork: boolean
  isConnecting?: boolean
  onSwitch?: () => void
}

export default function NetworkBadge({
  isConnected,
  wrongNetwork,
  isConnecting,
  onSwitch,
}: NetworkBadgeProps) {
  if (!isConnected && !isConnecting) return null

  if (isConnecting) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border-default)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[--text-muted] opacity-60" />
        Connecting...
      </span>
    )
  }

  if (wrongNetwork) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border"
        style={{
          background: 'var(--error-bg)',
          borderColor: '#FCA5A5',
          color: 'var(--error)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[--error]" />
        Wrong Network
        {onSwitch && (
          <button
            onClick={onSwitch}
            className="ml-1 underline underline-offset-2 hover:no-underline transition-all"
            style={{ color: 'var(--error)', fontFamily: 'var(--font-mono)' }}
          >
            Switch
          </button>
        )}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border"
      style={{
        background: 'var(--success-bg)',
        borderColor: '#86EFAC',
        color: 'var(--success)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[--success]" />
      Polygon Amoy
    </span>
  )
}
