'use client'

import dynamic from 'next/dynamic';

// Dynamic import for WalletConnectView
const WalletConnectView = dynamic(() => import('./components/wallet-connect-view'), { ssr: false });
// import WalletConnectView from './components/wallet-connect-view'

export default function Home() {
  // const { address, provider, chainId } = useContext(WalletContext);

  return (
    <main className="w-screen min-h-screen flex flex-col items-center">
      <div className='text-2xl mt-2'>
        <text></text>
      </div>
      <div className='text-3xl mt-2'>
        <text>「Base Naokoコレクション」</text>
      </div>
      <div className='w-full max-w-screen-md px-4'>
        <div className='w-full flex flex-row justify-center mt-5'>
          <WalletConnectView />
        </div>
      </div>
    </main>
  );
}

