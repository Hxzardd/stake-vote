/**
 * Client-safe chain constants. NEXT_PUBLIC_* values are inlined at build
 * time; everything here may be imported from client components.
 */

export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
  ? Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10)
  : 80002

export const CHAIN_NAME = 'Polygon Amoy'

export const EXPLORER_BASE_URL = 'https://amoy.polygonscan.com'

export function explorerAddressUrl(address: string): string {
  return `${EXPLORER_BASE_URL}/address/${address}`
}

export function explorerTxUrl(txHash: string): string {
  return `${EXPLORER_BASE_URL}/tx/${txHash}`
}
