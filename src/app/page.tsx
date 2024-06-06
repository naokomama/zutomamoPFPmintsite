'use client'

import dynamic from 'next/dynamic';
import { Button, Stack, Text } from '@chakra-ui/react';

// Dynamic import for WalletConnectView
// const WalletConnectView = dynamic(() => import('./components/wallet-connect-view'), { ssr: false });
import WalletConnectView from './components/wallet-connect-view'

export default function Home() {
  // const { address, provider, chainId } = useContext(WalletContext);
  const SUB_DIRECTRY2 = "zutomamoPFP/mintsite/assets/";
  const SUB_DIRECTRY = "/assets/";

  const handleOpenseaClick = () => {
    window.open("https://opensea.io/account", "_blank");
  };

  const handleMagicEdenClick = () => {
    window.open("https://magiceden.io/me?chain=base", "_blank");
  };

  const handleDiscordClick = () => {
    window.open("https://discord.com/invite/zutomamo-shinzo", "_blank");
  };

  return (
    <main className="w-screen min-h-screen flex flex-col items-center">
      <div className='w-full max-w-screen-md px-4' style={{ textAlign: 'center', width: '350px' }}>
      {/* <img src={ SUB_DIRECTRY + "zutomamo_pink_01.png" } alt="ずとまもロゴ" style={{ width: '90%', maxWidth: '50px', height: 'auto' }} /> */}
      <img src={ SUB_DIRECTRY + "zutomamologo_pink_03.png" } alt="ずとまもロゴ" style={{ textAlign: 'center', width: '100%', maxWidth: '350px', height: '50px' }} />
      </div>
      <div className='w-full max-w-screen-md px-4' style={{ textAlign: 'center', width: '450px' }}>
        <img src={ SUB_DIRECTRY + "PFP-100.jpg" } alt="ずとまもPFP" style={{ textAlign: 'center', width: '100%', maxWidth: '450px', height: '450px' }} />
      </div>
      <div className='w-full max-w-screen-md px-4' style={{ textAlign: 'center', width: '450px', margin: '50px' }}>
        <Stack spacing={4} direction='row' align='center'>
          <Button colorScheme='cyan' variant='outline' onClick={handleOpenseaClick}>
            <img className='mr-1 icon' src= {SUB_DIRECTRY + 'opensea.png'} alt='' />
            <Text fontSize="md">Opensea</Text>
          </Button>
          <Button colorScheme='pink' variant='outline' onClick={handleMagicEdenClick}>
            <img className='mr-1 icon' src= {SUB_DIRECTRY + 'MElogo.png'} alt='' />
            <Text fontSize="base">MagicEden</Text>
          </Button>
          <Button colorScheme='blue' variant='outline' onClick={handleDiscordClick}>
            <img className='mr-1 icon' src= {SUB_DIRECTRY + 'discord.png'} alt='' />
            <Text fontSize="sm">ずとまも心臓部</Text>
          </Button>
        </Stack>
      </div>
      <div className='w-full max-w-screen-md px-4'>
        <div className='w-full flex flex-row justify-center mt-5'>
          <WalletConnectView />
        </div>
      </div>
    </main>
  );
}

