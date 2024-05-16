'use client'

// Package
import { Button, Image, Menu, MenuButton, MenuItem, MenuList, Card, CardHeader, CardBody, CardFooter, Heading, Text, Stack, Center } from '@chakra-ui/react'
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { useContext, useEffect, useState, useCallback } from 'react'
import { isMobile } from "react-device-detect"
import { useAccount, useDisconnect, useNetwork } from 'wagmi'
import { getAccount } from '@wagmi/core'
import { useWeb3Modal, useWeb3ModalEvents } from '@web3modal/wagmi/react'
import { CHAIN_ID } from '../../definition/contract';

// Context
import { WalletContext } from '../providers/wallet-provider'
import getContractDetails, { Mint } from '../providers/contract-provider';
import ChainTag from './contract/chain-tag'

export default function WalletConnectView() {
  const { address, chainId, provider, setAddress, setChainId, setProvider } = useContext(WalletContext)
  const { open } = useWeb3Modal()
  const { address: connectingAddress, isConnecting, isDisconnected } = useAccount()
  const { data: modalEvent } = useWeb3ModalEvents()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const [mintAmount, setMintAmount] = useState(1);  // ミントする量
  // const [nextMint , setNextMint] = useState(1);
  const [contractDetails, setContractDetails] = useState({
    totalSupply: '',
    userMintedAmount: '',
    maxSupply: '',
    paused: false
  });

  // メタマスク使用可否
  const [canUseMetamask, setCanUseMetamask] = useState(false)
  useEffect(() => {
    setCanUseMetamask(window.ethereum != null)
  }, [])

  // ↓ 変更分元の
  // const updateProvider = async () => {
  //   if (connectingAddress == null) {
  //     setProvider(null)
  //     setAddress(null)
  //     setChainId(null)
  //   } else {
  //     if (getAccount().connector == null) return
  //     const provider = await getAccount().connector!.options.getProvider()
  //     provider.on('accountsChanged', (accounts: string[]) => {
  //       console.log('accountsChanged', accounts[0])
  //       setAddress(accounts[0])
  //     })
  //     provider.on('chainChanged', (chainId: number) => {
  //       console.log('chainChanged', Number(chainId))
  //       setChainId(Number(chainId))
  //     })
  //     setProvider(provider)
  //     setAddress(connectingAddress)
  //     if (chain != null) {
  //       setChainId(chain.id)
  //     }
  //   }
  // }
  // useEffect(() => {
  //   updateProvider()
  // }, [modalEvent])
  // ↑ 変更分元の

    // ↓ 変更分
  const updateProvider = useCallback(async () => {
    if (connectingAddress == null) {
      setProvider(null);
      setAddress(null);
      setChainId(null);
    } else {
      if (getAccount().connector == null) return;
      const provider = await getAccount().connector!.options.getProvider();
      provider.on('accountsChanged', (accounts: string[]) => {
        console.log('accountsChanged', accounts[0]);
        setAddress(accounts[0]);
      });
      provider.on('chainChanged', (chainId: number) => {
        console.log('chainChanged', Number(chainId));
        setChainId(Number(chainId));
      });
      setProvider(provider);
      setAddress(connectingAddress);
      if (chain != null) {
        setChainId(chain.id);
      }
    }
  }, [connectingAddress, setAddress, setChainId, setProvider, chain]); // ここに依存する変数や関数を列挙します
  
  useEffect(() => {
    updateProvider();
  }, [updateProvider, modalEvent]); // useEffect の依存配列に updateProvider を含めます

  useEffect(() => {
    updateProvider()
  }, [updateProvider])


  // ↑ 変更分

  // const updateProvider = useCallback(() => {
    // 関数の内容
  // }, [/* 依存する変数やステート */]);


  // useEffect(() => {
  //   updateProvider()
  // }, [connectingAddress])

  useEffect(() => {
    async function fetchContractDetails() {
      try {
        if (connectingAddress) {
          const details = await getContractDetails(connectingAddress);
            setContractDetails(details);
            console.log("totalSupply=",details.totalSupply);
            console.log("maxSupply=",details.maxSupply);
            console.log("userMintedAmount=",details.userMintedAmount);
            console.log("paused=",details.paused);
        }
      } catch (error) {
        console.error('Failed to fetch contract details:', error);
      }
    }

    fetchContractDetails();
  }, [connectingAddress]);


  const LoginView = () => {
    const views = []
    if (provider != null) return null

    // WalletConenct
    views.push(
      <Button key={1} className='m-5 w-30' bg='#fa4e74' color='white' onClick={() => open()}>
        ウォレットに接続
      </Button>
    )

    if (isMobile && canUseMetamask) {
      views.push(
        <Button key={2} className='m-5 w-30' colorScheme='orange' onClick={async () => {
          const provider = window.ethereum as any
          const acccounts = await provider.request({ method: 'eth_requestAccounts' })
          setAddress(acccounts.length === 0 ? null : acccounts[0])
          const chainId = await provider.request({ method: 'eth_chainId' })
          setChainId(Number(chainId))
          setProvider(provider)
        }}>
          <Image className='mr-1' src='/assets/metamask.svg' height={5} alt='' />
          Metamask接続
        </Button>
      )
    }

    // メタマスクアプリで開くボタン
    if (isMobile && !canUseMetamask) {
      views.push(
        <Button key={3} className='m-5 w-30' colorScheme='orange' onClick={() => {
          const path = document.URL.split('://')[1]
          const metamaskLink = `https://metamask.app.link/dapp/` + `${path}`
          location.href = metamaskLink
        }}>
          <Image className='mr-1' src='/assets/metamask.svg' height={5} alt='' />
          MetamaskAppで開く
        </Button>
      )
    }

    return <div className='flex flex-col justify-center'>{views}</div>
  }

  // Mint 数量の調整ボタン
  const handleIncrease = () => {
    if (mintAmount < 3) {  // 最大値を3に設定
      setMintAmount(mintAmount + 1);
    }
  };

  const handleDecrease = () => {
    if (mintAmount > 1) {  // 最小値を1に設定
      setMintAmount(mintAmount - 1);
    }
  };

  const setToMin = () => {
    setMintAmount(1);
  };

  const setToMax = () => {
    setMintAmount(3);
  };

  const LogoutView = () => {
    if (provider == null) return null
    return (
      <div className='w-full flex justify-between items-center px-3' style={{ marginBottom: '20px' }}>
        { chainId && <ChainTag chainId={chainId} /> }
        <Menu>
          <MenuButton bg='#fa4e74' color='white' as={Button} size={'sm'} >
            { address == null ? '' : `${address.slice(0, 4)} ... ${address.slice(-4)}` }
          </MenuButton>
          <MenuList>
          <MenuItem onClick={() => {
              open()
            }}>あなたのウォレット</MenuItem>
            <MenuItem onClick={() => {
              disconnect()
              setProvider(null)
            }}>ウォレット切断</MenuItem>
          </MenuList>
        </Menu>
      </div>
    )
  }

  const requestNetworkChange = async () => {
    const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string;
    try {
      await (window.ethereum as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID.BASE.toString(16)}` }], // BaseチェーンのチェーンID
      });
    } catch (switchError) {
      // このエラーはユーザーが切り替えを拒否したか、指定したチェーンがMetaMaskに登録されていない場合に発生します
      // if (switchError.code === 4902) {
        if (typeof switchError === 'object' && switchError !== null && 'code' in switchError && (switchError as any).code === 4902) {
        try {
          // ネットワークがMetaMaskに登録されていない場合、新しいネットワークを追加する
          await (window.ethereum as any).request({
            method: 'wallet_addEthereumChain',
            params: [
              { 
                // chainId: '0x2105', // BaseチェーンのチェーンID
                chainId: `0x${CHAIN_ID.BASE.toString(16)}`,
                rpcUrl: `https://base-mainnet.g.alchemy.com/v2/` + `${ alchemyApiKey }`  // 適切なRPC URL
              }
            ],
          });
        } catch (addError) {
          console.error('Failed to add the network:', addError);
        }
      } else {
        console.error('Failed to switch the network:', switchError);
      }
    }
  };

  const ImageView = () => {
    if (provider == null || contractDetails == null) return null
    return(
      <div className='w-full'>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Image src="../../../assets/takojiro4.png" alt="海の中のまもちゃん" width={500} height={500} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>

        { /* Baseチェーン以外の場合、切り替えボタンを表示  */}
        {chainId === CHAIN_ID.BASE ? (
          <MainView />
          ) : (
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button bg='#fa4e74' color='white' onClick={requestNetworkChange}>
              Switch to Base Network
            </Button>
          </div>
        )}

        </div>
      </div>
    )
  }

  const MainView = () => {
    if (provider == null || contractDetails == null) return null
    const totalCost = (mintAmount * 0.03).toFixed(2);
    
    return (
      <div className='w-500'>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Card align='center'>
            <CardHeader>
              <div style={{ textAlign: 'center' }}>
                <Text>Your Address</Text>
              </div>
              <div>
                { address }
              </div>
            </CardHeader>
            <CardBody>
              <div style={{ textAlign: 'center' }}>
                <Heading size='md'> TotalSupply : {contractDetails.totalSupply || ''} / {contractDetails.maxSupply || ''}</Heading>
              </div>
            </CardBody>
          </Card>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Card align='center'>
            <CardHeader>
              <div style={{ textAlign: 'center' }}>
                <Text>{mintAmount} Mint × 0.03 = {totalCost}</Text>
              </div>
            </CardHeader>
            <CardBody>
              <Stack spacing={4} direction='row' align='center'>
                <Button onClick={setToMin} shadow="lg" height="60px" width="60px" borderRadius="full" padding={0} display="flex" alignItems="center" justifyContent="center" margin={0} bg='#66ccff' color='white' size='lg' style={{ fontSize: '20px', margin: '0px', textAlign: 'center' }}>MIN</Button>
                <Button onClick={handleDecrease} shadow="lg" height="50px" width="40px" borderRadius="full" padding={0} display="flex" alignItems="center" justifyContent="center" margin={0} bg='#66ccff' color='white' size='lg' style={{ fontSize: '30px', margin: '0px', textAlign: 'center' }}>-</Button>
                <Text fontSize='3xl'> {mintAmount}</Text>
                <Button onClick={handleIncrease} shadow="lg" height="50px" width="40px" borderRadius="full" padding={0} display="flex" alignItems="center" justifyContent="center" margin={0} bg='#fa4e74' color='white' size='lg' style={{ fontSize: '30px', margin: '0px', textAlign: 'center' }}>+</Button>
                <Button onClick={setToMax} shadow="lg" height="60px" width="60px" borderRadius="full" padding={0} display="flex" alignItems="center" justifyContent="center" margin={0} bg='#fa4e74' color='white' size='lg' style={{ fontSize: '20px', margin: '0px', textAlign: 'center' }}>MAX</Button>
              </Stack>
            </CardBody>
            <CardFooter>
              <Button bg='#66ccff' color='white' onClick={mintToken}>
              MINT
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  const mintToken = async () => {
    try {
      if (connectingAddress) {
        // contractDetails.totalSupply を取得して数値に変換
        let totalSupply = parseInt(contractDetails.totalSupply, 10);

        console.log("totalSupply=",totalSupply);
        console.log("mintAmount=",mintAmount);

        // mintAmountの数分ループしてmintIdxを設定し、string型に変換
        const mintIdx: string[] = [];
        for (let i = 0; i < mintAmount; i++) {
            mintIdx.push((totalSupply + i + 1).toString());
        }

        console.log("mintIdx=",mintIdx);

        const details = await Mint(connectingAddress, mintIdx);
        console.log(details);
          // setContractDetails(details);
          // console.log("totalSupply=",details.totalSupply);
      }
    } catch (error) {
      console.error('Failed to contract mint:', error);
    }
  }

  return (
    <div className='w-full'>
      <LoginView />
      <LogoutView />
      <ImageView />
    </div>
  )
}
