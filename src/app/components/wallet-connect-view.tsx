'use client'

// Package
import { Button, Image, Menu, MenuButton, MenuItem, MenuList, Card, CardHeader, CardBody, CardFooter, Heading, Text, Stack } from '@chakra-ui/react'
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react'
import { isMobile } from "react-device-detect"
import { useAccount, useDisconnect, useNetwork } from 'wagmi'
import { getAccount } from '@wagmi/core'
import { useWeb3Modal, useWeb3ModalEvents } from '@web3modal/wagmi/react'
import { getContractDetails } from '../providers/contract-provider';

// Context
import { WalletContext } from '../providers/wallet-provider'
import ChainTag from './contract/chain-tag'

export default function WalletConnectView() {
  const { address, chainId, provider, setAddress, setChainId, setProvider } = useContext(WalletContext)
  const { open } = useWeb3Modal()
  const { address: connectingAddress, isConnecting, isDisconnected } = useAccount()
  const { data: modalEvent } = useWeb3ModalEvents()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const [contractDetails, setContractDetails] = useState({
    totalSupply: '',
    userMintedAmount: '',
    paused: false
  });

  // メタマスク使用可否
  const [canUseMetamask, setCanUseMetamask] = useState(false)
  useEffect(() => {
    setCanUseMetamask(window.ethereum != null)
  }, [])

  const updateProvider = async () => {
    if (connectingAddress == null) {
      setProvider(null)
      setAddress(null)
      setChainId(null)
    } else {
      if (getAccount().connector == null) return
      const provider = await getAccount().connector!.options.getProvider()
      provider.on('accountsChanged', (accounts: string[]) => {
        console.log('accountsChanged', accounts[0])
        setAddress(accounts[0])
      })
      provider.on('chainChanged', (chainId: number) => {
        console.log('chainChanged', Number(chainId))
        setChainId(Number(chainId))
      })
      setProvider(provider)
      setAddress(connectingAddress)
      if (chain != null) {
        setChainId(chain.id)
      }
    }
  }
  useEffect(() => {
    updateProvider()
  }, [modalEvent])

  useEffect(() => {
    updateProvider()
  }, [connectingAddress])

  useEffect(() => {
    async function fetchContractDetails() {
      try {
        if (connectingAddress) {
          const details = await getContractDetails(connectingAddress);
            setContractDetails(details);
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
          const metamaskLink = `https://metamask.app.link/dapp/${path}`
          location.href = metamaskLink
        }}>
          <Image className='mr-1' src='/assets/metamask.svg' height={5} alt='' />
          MetamaskAppで開く
        </Button>
      )
    }

    return <div className='flex flex-col justify-center'>{views}</div>
  }

  const LogoutView = () => {
    if (provider == null) return null
    return (
      <div className='w-full flex justify-between items-center px-3'>
        { chainId && <ChainTag chainId={chainId} /> }
        <Menu>
          <MenuButton bg='#fa4e74' color='white' as={Button} size={'sm'}>
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

  const MainView = () => {
    if (provider == null) return null
    return (
      <div className='w-full'>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="../../../assets/ALICE.png" className="App-logo" alt="logo" width={500} height={500}/>
        </div>
        <div>
        
        </div>
        <div>
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
                <Heading size='md'> TotalSupply:{contractDetails.totalSupply} / 210</Heading>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text>1Mint × 0.003 = 0.003</Text>
              </div>
            </CardBody>
            <CardFooter>
              <Stack spacing={4} direction='row' align='center'>
                <Button shadow="lg" borderRadius="full" padding={4} margin={0} bg='#66ccff' color='white' size='lg' style={{ fontSize: '20px', margin: '0px', textAlign: 'center' }}>MIN</Button>
                <Button shadow="lg" borderRadius="full" padding={4} margin={0} bg='#66ccff' color='white' size='lg' style={{ fontSize: '30px', margin: '0px', textAlign: 'center' }}>-</Button>
                <Text fontSize='3xl'> {contractDetails.userMintedAmount}</Text>
                <Button shadow="lg" borderRadius="full" padding={4} margin={0} bg='#fa4e74' color='white' size='lg' style={{ fontSize: '30px', margin: '0px', textAlign: 'center' }}>+</Button>
                <Button shadow="lg" borderRadius="full" padding={4} margin={0} bg='#fa4e74' color='white' size='lg' style={{ fontSize: '20px', margin: '0px', textAlign: 'center' }}>MAX</Button>
              </Stack>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <LoginView />
      <LogoutView />
      <MainView />
    </div>
  )
}
