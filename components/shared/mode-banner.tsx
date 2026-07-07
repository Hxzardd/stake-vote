'use client'

interface ModeBannerProps {
  mode: 'sandbox' | 'onchain'
}

/**
 * Persistent, unmissable declaration of whether votes touch the chain.
 * Sandbox must never be mistakable for a real election.
 */
export default function ModeBanner({ mode }: ModeBannerProps) {
  if (mode === 'sandbox') {
    return (
      <div
        role="status"
        className="px-4 sm:px-6 py-2 text-center"
        style={{
          background: 'repeating-linear-gradient(-45deg, #FFFBEB, #FFFBEB 12px, #FEF3C7 12px, #FEF3C7 24px)',
          borderBottom: '1px solid #FDE68A',
        }}
      >
        <span
          className="text-xs font-semibold tracking-widest"
          style={{ color: 'var(--warning)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
        >
          SANDBOX MODE
        </span>
        <span className="text-xs ml-2" style={{ color: 'var(--warning)' }}>
          — no blockchain transaction will be submitted
        </span>
      </div>
    )
  }

  return (
    <div
      role="status"
      className="px-4 sm:px-6 py-2 text-center"
      style={{ background: 'var(--success-bg)', borderBottom: '1px solid #BBF7D0' }}
    >
      <span
        className="text-xs font-semibold tracking-widest"
        style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
      >
        ON-CHAIN MODE
      </span>
      <span className="text-xs ml-2" style={{ color: 'var(--success)' }}>
        — votes are permanently recorded on Polygon Amoy
      </span>
    </div>
  )
}
