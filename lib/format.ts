/**
 * Bigint-safe formatting for stakes, tallies, and addresses. Voting powers
 * are uint256 — they must never pass through Number().
 */

/** "1234567" → "1,234,567". Accepts bigint or a decimal string. */
export function formatPower(value: bigint | string): string {
  const str = typeof value === 'bigint' ? value.toString() : value
  if (!/^\d+$/.test(str)) return str
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * part/total as a percentage with 2-decimal precision, computed entirely
 * in bigint space. Returns 0 for an empty total.
 */
export function percentOf(part: bigint | string, total: bigint | string): number {
  const p = typeof part === 'bigint' ? part : BigInt(part || '0')
  const t = typeof total === 'bigint' ? total : BigInt(total || '0')
  if (t === 0n) return 0
  return Number((p * 10_000n) / t) / 100
}

/** 4000 bps → "40%". Keeps fractional bps ("4250" → "42.5%"). */
export function bpsToPercent(bps: number): string {
  const whole = Math.floor(bps / 100)
  const frac = bps % 100
  if (frac === 0) return `${whole}%`
  return `${(bps / 100).toFixed(frac % 10 === 0 ? 1 : 2)}%`
}

export function shortAddress(address: string, chars = 4): string {
  if (address.length <= 2 + chars * 2) return address
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

export function shortHash(hash: string): string {
  return shortAddress(hash, 6)
}

export function sumPowers(a: bigint | string, b: bigint | string): string {
  const x = typeof a === 'bigint' ? a : BigInt(a || '0')
  const y = typeof b === 'bigint' ? b : BigInt(b || '0')
  return (x + y).toString()
}
