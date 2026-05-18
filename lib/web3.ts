import { BrowserProvider } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

export async function connectMetaMask(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })
    return accounts[0]
  } catch (error) {
    throw new Error('Failed to connect to MetaMask')
  }
}

export async function getProvider(): Promise<BrowserProvider> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }
  return new BrowserProvider(window.ethereum)
}

export async function getSigner(provider: BrowserProvider) {
  return await provider.getSigner()
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    if (!window.ethereum) return null
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    })
    return accounts[0] || null
  } catch {
    return null
  }
}

export async function getChainId(): Promise<number | null> {
  if (!window.ethereum) return null
  try {
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
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
  } catch (err: any) {
    if (err.code === 4902 && chainId === 80002) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName: 'Polygon Amoy Testnet',
            rpcUrls: ['https://rpc-amoy.polygon.technology/'],
            nativeCurrency: {
              name: 'POL',
              symbol: 'POL',
              decimals: 18,
            },
            blockExplorerUrls: ['https://amoy.polygonscan.com/'],
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

  window.ethereum.on('accountsChanged', onAccountsChanged)
  if (onChainChanged) {
    window.ethereum.on('chainChanged', onChainChanged)
  }

  return () => {
    window.ethereum?.removeListener('accountsChanged', onAccountsChanged)
    if (onChainChanged) {
      window.ethereum?.removeListener('chainChanged', onChainChanged)
    }
  }
}
