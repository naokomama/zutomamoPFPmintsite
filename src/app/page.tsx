'use client'

// Package
// import { NextPage } from 'next';
// import { createWeb3Modal } from '@web3modal/wagmi';
// import { useWeb3Modal } from '@web3modal/wagmi/react';
// import { useEffect } from 'react';

import { useContext } from 'react'

// Component
import WalletConnectView from './components/wallet-connect-view'

// Context
import { WalletContext } from './providers/wallet-provider'
// import { Button } from '@chakra-ui/react'

export default function Home() {
  const { address, provider, chainId } = useContext(WalletContext)
//Base「ZUTTO MAMORU PFPコレクション」
  return (
    <main className="w-screen min-h-screen flex flex-col items-center">
      <div className='text-2xl mt-2'>
        <text>「Base TestNaokoコレクション」</text>
      </div>
      <div className='text-2xl mt-2'>
        <text>Mint Site</text>
      </div>
      {/* <div className='w-full max-w-500'> */}
      <div className='w-500 max-w-500'>
        <div className='w-full flex flex-row justify-center mt-5'>
          <WalletConnectView />
        </div>
      </div>
    </main>
  )
}
