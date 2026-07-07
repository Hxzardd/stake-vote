'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BrowserProvider, JsonRpcSigner } from 'ethers'
import { CHAIN_ID } from '@/lib/config/client'
import {
  connectMetaMask,
  getProvider,
  getSigner,
  getConnectedAddress,
  getChainId,
  switchNetwork,
  revokeWalletPermissions,
  setupMetaMaskListener,
} from '@/lib/web3'

interface UseWeb3State {
  address: string | null
  signer: JsonRpcSigner | null
  provider: BrowserProvider | null
  isConnecting: boolean
  wrongNetwork: boolean
  error: string | null
}

const DISCONNECTED: UseWeb3State = {
  address: null,
  signer: null,
  provider: null,
  isConnecting: false,
  wrongNetwork: false,
  error: null,
}

export function useWeb3() {
  const [state, setState] = useState<UseWeb3State>(DISCONNECTED)

  const checkConnection = useCallback(async () => {
    try {
      const address = await getConnectedAddress()
      if (!address) return
      const provider = await getProvider()
      const signer = await getSigner(provider)
      const chainId = await getChainId()

      setState({
        address,
        signer,
        provider,
        isConnecting: false,
        wrongNetwork: chainId !== null && chainId !== CHAIN_ID,
        error: null,
      })
    } catch (err) {
      console.error('Failed to restore wallet connection:', err)
    }
  }, [])

  useEffect(() => {
    checkConnection()

    return setupMetaMaskListener(
      (accounts) => {
        if (accounts.length === 0) {
          setState(DISCONNECTED)
        } else {
          checkConnection()
        }
      },
      () => {
        checkConnection()
      }
    )
  }, [checkConnection])

  const connect = async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }))
    try {
      const address = await connectMetaMask()
      const provider = await getProvider()
      const signer = await getSigner(provider)
      const chainId = await getChainId()

      setState({
        address,
        signer,
        provider,
        isConnecting: false,
        wrongNetwork: chainId !== null && chainId !== CHAIN_ID,
        error: null,
      })
    } catch (err) {
      setState({
        ...DISCONNECTED,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const disconnect = async () => {
    setState(DISCONNECTED)
    await revokeWalletPermissions()
  }

  const switchChain = async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }))
    try {
      await switchNetwork(CHAIN_ID)
      // The chainChanged listener re-checks the connection.
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Failed to switch network',
      }))
    }
  }

  return {
    ...state,
    connect,
    disconnect,
    switchChain,
    isConnected: state.address !== null,
  }
}
