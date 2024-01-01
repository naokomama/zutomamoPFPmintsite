'use client'

// Package
import { useContext } from 'react'

// Component
import WalletConnectView from './components/wallet-connect-view'

// Context
import { WalletContext } from './providers/wallet-provider'

export default function Home() {
  const { address, provider, chainId } = useContext(WalletContext)

  return (
    <main className="w-screen min-h-screen flex flex-col items-center">
      <div className='text-2xl mt-2'>
        タイトル
      </div>
      <div className='w-full max-w-4xl'>
        <div className='w-full flex flex-row justify-center mt-5'>
          <WalletConnectView />
        </div>
      </div>
    </main>
  )
}
