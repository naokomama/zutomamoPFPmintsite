'use client'

import dynamic from 'next/dynamic';

// Dynamic import for WalletConnectView
const WalletConnectView = dynamic(() => import('./components/wallet-connect-view'), { ssr: false });
// import WalletConnectView from './components/wallet-connect-view'

export default function Home() {
  // const { address, provider, chainId } = useContext(WalletContext);
  const SUB_DIRECTRY = "zutomamoPFP/mintsite/assets/";
  const SUB_DIRECTRY2 = "/assets/";
  console.log("Home");

  return (
    <main className="w-screen min-h-screen flex flex-col items-center">
      <div className='w-full max-w-screen-md px-4' style={{ textAlign: 'center', width: '350px' }}>
      {/* <img src={ SUB_DIRECTRY + "zutomamo_pink_01.png" } alt="ずとまもロゴ" style={{ width: '90%', maxWidth: '50px', height: 'auto' }} /> */}
      <img src={ "zutomamologo_pink_03.png" } alt="ずとまもロゴ" style={{ textAlign: 'center', width: '100%', maxWidth: '350px', height: '70px' }} />
      </div>
      <div className='w-full max-w-screen-md px-4' style={{ textAlign: 'center', width: '350px' }}>
      <img src={ "banner.jpg" } alt="ずとまもPFP" style={{ textAlign: 'center', width: '100%', maxWidth: '450px', height: '450px' }} />
      </div>
      <div className='w-full max-w-screen-md px-4'>
        <div className='w-full flex flex-row justify-center mt-5'>
          <WalletConnectView />
        </div>
      </div>
    </main>
  );
}

