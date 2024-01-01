'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'

// Provider
import { Web3Modal } from "./providers/Web3Modal";
import { DialogProvider } from './providers/dialog-provider'
import { WalletProvider } from './providers/wallet-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <Web3Modal>
        <CacheProvider>
          <ChakraProvider>
            <DialogProvider>
              {children}
            </DialogProvider>
        </ChakraProvider>
      </CacheProvider>
    </Web3Modal>
    </WalletProvider>
  )
}