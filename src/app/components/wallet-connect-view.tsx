'use client'

interface CityData {
  City_Name: string;
  City_ID: number;
  Contract_ID: number;
  TokenID_Start: number;
  TokenID_End: number;
}

// Package
import { Button, Image, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react'
import { isMobile } from "react-device-detect"
import { useAccount, useDisconnect, useNetwork } from 'wagmi'
import { getAccount } from '@wagmi/core'
import { useWeb3Modal, useWeb3ModalEvents } from '@web3modal/wagmi/react'

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

 // 追加: APIから取得したデータを格納するための状態
 const [cityData, setCityData] = useState<CityData[]>([]);

  // メタマスク使用可否
  const [canUseMetamask, setCanUseMetamask] = useState(false)
  useEffect(() => {
    setCanUseMetamask(window.ethereum != null)
  }, [])

  useEffect(() => {
    // APIからデータを取得する関数
    const fetchData = async () => {
      const response = await fetch('https://z3mkgzcroc.execute-api.ap-northeast-1.amazonaws.com/beta?contractId=2');
      if (response.ok) {
        const responseBody = await response.json(); // APIからのレスポンス全体を取得
        const data = JSON.parse(responseBody.body); // bodyプロパティの文字列をJSONとして解析
        setCityData(data); // 解析したデータを状態に設定
      } else {
        console.error('API call failed:', response);
      }
    };

    fetchData();
  }, []); // 空の依存配列を指定して、コンポーネントのマウント時にのみ実行

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


  const LoginView = () => {
    const views = []
    if (provider != null) return null

    // WalletConenct
    views.push(
      <Button key={1} className='m-5 w-30' colorScheme='blue' onClick={() => open()}>
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
          <MenuButton colorScheme='blue' as={Button} size={'sm'}>
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
        <div>
          <img src="../../../assets/momotetsumap_login.png" className="App-logo" alt="logo" />
        </div>
        <div className='w-full flex flex-row justify-center mt-5'>
          <Button key={1} className='m-5 w-30' colorScheme='blue' onClick={() => open()}>
            シェアする
          </Button>
        </div>
        <div>
          <img src="../../../assets/charazukan.png" className="App-logo" alt="zukan" />
        </div>
        <div className='w-full flex flex-row justify-center mt-5'>
          １ページ / ５ページ
        </div>
        
      </div>
    )
  }

  // APIのデータを表示するためのビュー
  const DataView = () => {
    if (provider == null) return null;
    if (!cityData.length) return null;
  
    return (
      <div>
        <h2>City Data</h2>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>City ID</Th>
              <Th>City Name</Th>
              <Th>TokenID Start</Th>
              <Th>TokenID End</Th>
              <Th>Contract ID</Th>
            </Tr>
          </Thead>
          <Tbody>
            {cityData.map((item, index) => (
              <Tr key={index}>
                <Td>{item.City_ID}</Td>
                <Td>{item.City_Name}</Td>
                <Td>{item.TokenID_Start}</Td>
                <Td>{item.TokenID_End}</Td>
                <Td>{item.Contract_ID}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    );
  };

  return (
    <div className='w-full'>
      <LoginView />
      <LogoutView />
      <MainView />
      <DataView />
    </div>
  )
}
