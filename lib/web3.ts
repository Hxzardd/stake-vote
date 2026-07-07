import { BrowserProvider, type Eip1193Provider, type JsonRpcSigner } from 'ethers'
import { CHAIN_ID, CHAIN_NAME, EXPLORER_BASE_URL } from '@/lib/config/client'

type ProviderEventListener = (...args: unknown[]) => void

interface EthereumProvider extends Eip1193Provider {
  on(event: string, listener: ProviderEventListener): void
  removeListener(event: string, listener: ProviderEventListener): void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

function isRpcError(err: unknown): err is { code: number } {
  return typeof err === 'object' && err !== null && typeof (err as { code?: unknown }).code === 'number'
}

export async function connectMetaMask(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  try {
    const accounts = (await window.ethereum.request({
      method: 'eth_requestAccounts',
    })) as string[]
    return accounts[0]
  } catch {
    throw new Error('Failed to connect to MetaMask')
  }
}

export async function getProvider(): Promise<BrowserProvider> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }
  return new BrowserProvider(window.ethereum)
}

export async function getSigner(provider: BrowserProvider): Promise<JsonRpcSigner> {
  return await provider.getSigner()
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    if (!window.ethereum) return null
    const accounts = (await window.ethereum.request({
      method: 'eth_accounts',
    })) as string[]
    return accounts[0] || null
  } catch {
    return null
  }
}

export async function getChainId(): Promise<number | null> {
  if (!window.ethereum) return null
  try {
    const chainIdHex = (await window.ethereum.request({ method: 'eth_chainId' })) as string
    return parseInt(chainIdHex, 16)
  } catch {
    return null
  }
}

export async function switchNetwork(chainId: number): Promise<void> {
  if (!window.ethereum) return
  const chainIdHex = `0x${chainId.toString(16)}`
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (err: unknown) {
    // 4902: chain not added to the wallet yet
    if (isRpcError(err) && err.code === 4902 && chainId === CHAIN_ID) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName: `${CHAIN_NAME} Testnet`,
            rpcUrls: ['https://rpc-amoy.polygon.technology/'],
            nativeCurrency: {
              name: 'POL',
              symbol: 'POL',
              decimals: 18,
            },
            blockExplorerUrls: [`${EXPLORER_BASE_URL}/`],
          },
        ],
      })
    } else {
      throw err
    }
  }
}

export async function revokeWalletPermissions(): Promise<void> {
  try {
    if (!window.ethereum?.request) return
    await window.ethereum.request({
      method: 'wallet_revokePermissions',
      params: [{ eth_accounts: {} }],
    })
  } catch {
    // Wallets that don't support wallet_revokePermissions will throw; ignore
  }
}

export function setupMetaMaskListener(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged?: () => void
) {
  if (!window.ethereum) return () => {}

  const accountsListener = onAccountsChanged as ProviderEventListener
  window.ethereum.on('accountsChanged', accountsListener)
  if (onChainChanged) {
    window.ethereum.on('chainChanged', onChainChanged)
  }

  return () => {
    window.ethereum?.removeListener('accountsChanged', accountsListener)
    if (onChainChanged) {
      window.ethereum?.removeListener('chainChanged', onChainChanged)
    }
  }
}
