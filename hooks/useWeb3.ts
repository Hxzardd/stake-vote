'use client'

import { useEffect, useState } from 'react'
import { BrowserProvider } from 'ethers'
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
  signer: any | null
  provider: BrowserProvider | null
  isConnecting: boolean
  wrongNetwork: boolean
  error: string | null
}

export function useWeb3() {
  const [state, setState] = useState<UseWeb3State>({
    address: null,
    signer: null,
    provider: null,
    isConnecting: false,
    wrongNetwork: false,
    error: null,
  })

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const address = await getConnectedAddress()
        if (address) {
          const provider = await getProvider()
          const signer = await getSigner(provider)
          const chainId = await getChainId()
          
          const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID 
            ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) 
            : null

          const isWrong = expectedChainId ? chainId !== expectedChainId : false

          setState({
            address,
            signer,
            provider,
            isConnecting: false,
            wrongNetwork: isWrong,
            error: null,
          })
        }
      } catch (err) {
        console.error('[v0] Failed to restore connection:', err)
      }
    }

    checkConnection()

    const cleanup = setupMetaMaskListener(
      (accounts) => {
        if (accounts.length === 0) {
          setState({
            address: null,
            signer: null,
            provider: null,
            isConnecting: false,
            wrongNetwork: false,
            error: null,
          })
        } else {
          checkConnection()
        }
      },
      () => {
        checkConnection()
      }
    )

    return cleanup
  }, [])

  const connect = async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }))
    try {
      const address = await connectMetaMask()
      const provider = await getProvider()
      const signer = await getSigner(provider)
      const chainId = await getChainId()
      
      const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID 
        ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) 
        : null

      const isWrong = expectedChainId ? chainId !== expectedChainId : false

      setState({
        address,
        signer,
        provider,
        isConnecting: false,
        wrongNetwork: isWrong,
        error: null,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setState({
        address: null,
        signer: null,
        provider: null,
        isConnecting: false,
        wrongNetwork: false,
        error: errorMessage,
      })
    }
  }

  const disconnect = async () => {
    setState({
      address: null,
      signer: null,
      provider: null,
      isConnecting: false,
      wrongNetwork: false,
      error: null,
    })
    await revokeWalletPermissions()
  }

  const switchChain = async () => {
    if (!process.env.NEXT_PUBLIC_CHAIN_ID) return
    setState((prev) => ({ ...prev, isConnecting: true, error: null }))
    try {
      await switchNetwork(parseInt(process.env.NEXT_PUBLIC_CHAIN_ID))
      // Listener will catch the chainChanged event
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch network'
      setState((prev) => ({ ...prev, isConnecting: false, error: errorMessage }))
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
