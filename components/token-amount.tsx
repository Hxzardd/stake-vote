interface TokenAmountProps {
  amount: number
  symbol?: string
  showSymbol?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = {
  sm: { number: '0.8125rem', unit: '0.75rem' },
  md: { number: '1rem',      unit: '0.875rem' },
  lg: { number: '1.375rem',  unit: '1rem' },
}

export default function TokenAmount({
  amount,
  symbol = 'VOTE',
  showSymbol = true,
  className = '',
  size = 'md',
}: TokenAmountProps) {
  const formatted = amount.toLocaleString('en-US')
  const s = SIZE[size]

  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: s.number,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        {formatted}
      </span>
      {showSymbol && (
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: s.unit,
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          {symbol}
        </span>
      )}
    </span>
  )
}
