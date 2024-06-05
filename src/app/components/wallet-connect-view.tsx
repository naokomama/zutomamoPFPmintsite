'use client'

import './wallet-connect-view.css'

import { Button, Image, Menu, MenuButton, MenuItem, MenuList, Card, CardHeader, CardBody, CardFooter, Heading, Text, Stack, Center } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useContext, useEffect, useState, useCallback } from 'react';
import { isMobile } from "react-device-detect";
import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import { getAccount } from '@wagmi/core';
import { useWeb3Modal, useWeb3ModalEvents } from '@web3modal/wagmi/react';
import { CHAIN_ID } from '../../definition/contract';
import { WalletContext } from '../providers/wallet-provider';
import getContractDetails, { Mint } from '../providers/contract-provider';
import { useMint } from '../components/hooks/usemint';
import ChainTag from './contract/chain-tag';
import InfoDialog from './info-dialog';
import ErrorDialog from './error-dialog';
import DialogData from '@/entity/dialog/dialog-data';
import LoadingOverlay from './loading-overlay';
import { allowlistAddresses }  from "../allowlist.mjs";

export default function WalletConnectView() {
  const { address, chainId, provider, setAddress, setChainId, setProvider } = useContext(WalletContext);
  const { open } = useWeb3Modal();
  const { address: connectingAddress, isConnecting, isDisconnected } = useAccount();
  const { data: modalEvent } = useWeb3ModalEvents();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const [mintAmount, setMintAmount] = useState(1);
  const [contractDetails, setContractDetails] = useState({
    totalSupply: '',
    maxSupply: '',
    paused: false,
    mintedAmountBySales: '',
  });
  const [canUseMetamask, setCanUseMetamask] = useState(false);
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const [errorData, setErrorData] = useState<DialogData | null>(null);
  const [isLoading, setisLoading] = useState(false);
  const [remainingMintable, setRemainingMintable] = useState<number | null>(null);
  const SUB_DIRECTRY2 = "zutomamoPFP/mintsite/";
  const SUB_DIRECTRY = "assets/";
  const [isLoaded, setIsLoaded] = useState(false);
  const { MerkleTree } = require('merkletreejs');
  const sha1 = require('crypto-js/sha1')
  const keccak256 = require('keccak256');
  const [allowlistMaxMintAmount, setallowlistMaxMintAmount] = useState(0);
  const [isMintButtonDisabled, setIsMintButtonDisabled] = useState(false);
  const [remainingPurchases, setRemainingPurchases] = useState(0);

  let nameMap;
  let leafNodes;
  let merkleTree;
  let addressId = -1;
  let claimingAddress;
  let hexProof;
  // let allowlistMaxMintAmount = 0;

  useEffect(() => {
    console.log("setCanUseMetamask")
    setCanUseMetamask(window.ethereum != null);
  }, []);

  const updateProvider = useCallback(async () => {
    console.log("updateProvider")
    console.log("connectingAddress=",connectingAddress)

    if (connectingAddress == null) {
      setProvider(null);
      setAddress(null);
      setChainId(null);
    } else {
      console.log("connectingAddress=",connectingAddress)

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
      setProvider(new ethers.providers.Web3Provider(provider));
      setAddress(connectingAddress);
      if (chain != null) {
        setChainId(chain.id);
      }
    }
  }, [connectingAddress, setAddress, setChainId, setProvider, chain]);

  useEffect(() => {
    updateProvider();
  }, [updateProvider, modalEvent]);

  useEffect(() => {
    updateProvider();
  }, [updateProvider]);

  useEffect(() => {
    if (provider == null) return
    async function fetchContractDetails() {
      try {
        console.log("fetchContractDetails")
        console.log("connectingAddress=",connectingAddress)

        if (connectingAddress) {
          const details = await getContractDetails(provider, connectingAddress);
          setContractDetails(details);
          setIsLoaded(true);
          
          // アローリストから最大ミント数を取得
          nameMap = allowlistAddresses.map(list => list[0]);
          console.log("nameMap=",nameMap);
          addressId = nameMap.indexOf(connectingAddress.toLowerCase());
          console.log("addressId=",addressId);

          if (addressId !== -1) {
              setallowlistMaxMintAmount(Number(allowlistAddresses[addressId][1]));
              const initialMintAmount = Number(allowlistAddresses[addressId][1]) - Number(details.mintedAmountBySales);
              setRemainingPurchases(initialMintAmount);
              setMintAmount(initialMintAmount > 0 ? initialMintAmount : 0);
              if (initialMintAmount <= 0) {
                setIsMintButtonDisabled(true);
              }
            } else {
              setallowlistMaxMintAmount(0);
              setRemainingPurchases(0);
              setMintAmount(0);
              setIsMintButtonDisabled(true);
            }
          console.log("addressId=",addressId);
          console.log("allowlistAddresses[addressId][1]=",allowlistAddresses[addressId][1])

          const remaining = parseInt(details.maxSupply) - parseInt(details.totalSupply);
          setRemainingMintable(remaining);
      }
      } catch (error) {
        console.error('Failed to fetch contract details:', error);
        setErrorData({
          title: 'Error',
          message: 'コントラクト読み取りエラーが発生しました。もう一度お試しください。',
          callback: () => setErrorData(null),
          cancelCallback: () => setErrorData(null)
        });
      }
    }

    fetchContractDetails();
  }, [connectingAddress, provider]);

  useEffect(() => {
    if (contractDetails) {
      const remaining = parseInt(contractDetails.maxSupply) - parseInt(contractDetails.totalSupply);
      setRemainingMintable(remaining);
    }
  }, [contractDetails]);

  const { mintTokens } = useMint();

  const LoginView = () => {
    console.log("LoginView");
    const views = [];
    if (provider != null) return null;

    views.push(
      <Button key={1} className='m-5 w-30' bg='#fa4e74' color='white' onClick={() => open()} isDisabled={isLoading}>
        ウォレットに接続
      </Button>
    );

    if (isMobile && canUseMetamask) {
      views.push(
        <Button key={2} className='m-5 w-30' colorScheme='orange' onClick={async () => {
          const provider = window.ethereum as any;
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          setAddress(accounts.length === 0 ? null : accounts[0]);
          const chainId = await provider.request({ method: 'eth_chainId' });
          setChainId(Number(chainId));
          setProvider(new ethers.providers.Web3Provider(provider));
        }} isDisabled={isLoading}>
          <img className='mr-1 metamask-icon' src= {SUB_DIRECTRY + 'metamask.svg'} alt='' />
          Metamask接続
        </Button>
      );
    }

    if (isMobile && !canUseMetamask) {
      views.push(
        <Button key={3} className='m-5 w-30' colorScheme='orange' onClick={() => {
          const path = document.URL.split('://')[1];
          const metamaskLink = `https://metamask.app.link/dapp/` + `${path}`;
          location.href = metamaskLink;
        }} isDisabled={isLoading}>
          <img className='mr-1 metamask-icon' src={SUB_DIRECTRY + 'metamask.svg'} alt='' />
          MetamaskAppで開く
        </Button>
      );
    }

    return <div className='flex flex-col justify-center'>{views}</div>;
  };

  const handleIncrease = () => {
    const remaining = remainingMintable !== null ? remainingMintable : 0;
    if (mintAmount < Math.min(allowlistMaxMintAmount, remaining)) {
        setMintAmount(mintAmount + 1);
    }
  };

  const handleDecrease = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1);
    }
  };

  const setToMin = () => {
    setMintAmount(1);
  };

  const setToMax = () => {
    const remaining = remainingMintable !== null ? remainingMintable : 0;
    setMintAmount(Math.min(allowlistMaxMintAmount, remaining));
};

  const LogoutView = () => {
    if (provider == null) return null;
    return (
      <div className='w-full flex justify-between items-center px-3' style={{ marginBottom: '20px' }}>
        {chainId && <ChainTag chainId={chainId} />}
        <Menu>
          <MenuButton bg='#fa4e74' color='white' as={Button} size={'sm'} isDisabled={isLoading}>
            {address == null ? '' : `${address.slice(0, 4)} ... ${address.slice(-4)}`}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => open()} isDisabled={isLoading}>あなたのウォレット</MenuItem>
            <MenuItem onClick={() => {
              setProvider(null);
              setAddress(null);
              setChainId(null);
              disconnect();
            }} isDisabled={isLoading}>ウォレット切断</MenuItem>
          </MenuList>
        </Menu>
      </div>
    );
  };

  const requestNetworkChange = async () => {
    setisLoading(true);
    try {
      await (window.ethereum as any).request({
        method: 'wallet_switchEthereumChain',
        // params: [{ chainId: `0x${CHAIN_ID.BASE.toString(16)}` }],
        params: [{ chainId: `0x${CHAIN_ID.SEPOLIA.toString(16)}` }],
      });
    } catch (switchError: any) {

      // モバイルだったら返却されるエラーコードが違うらしい
      if (isMobile) {
        const errorCode = switchError.data?.originalError?.code
        if (errorCode && errorCode === 4902) {
          await addChain()
        }
      } else {
        if (typeof switchError === 'object' && switchError !== null && 'code' in switchError && (switchError as any).code === 4902) {
          await addChain()
          
        } else {
          console.error('Failed to switch the network:', switchError);
          const errorCode = (switchError as any)?.code;
          const errorMessage = (switchError as any)?.message || (switchError as any).toString();

          setErrorData({
            title: 'Error',
            message: `ネットワークの切り替えに失敗しました。${ errorCode } : ${ errorMessage }`,
            callback: () => setErrorData(null),
            cancelCallback: () => setErrorData(null)
          });
        }
      }
    }

    setisLoading(false);
  };

  const addChain = () => {
    try {
      (window.ethereum as any).request({
        "method": "wallet_addEthereumChain",
        "params": [
          {
            // "blockExplorerUrls": [
            //   "https://basescan.org"
            // ],
            // "iconUrls": [],
            // "nativeCurrency": {
            //   "name": "ETH",
            //   "symbol": "ETH",
            //   "decimals": 18
            // },
            // "rpcUrls": [
            //   "https://mainnet.base.org"
            // ],
            // "chainId": `0x${CHAIN_ID.BASE.toString(16)}`,
            // "chainName": "Base"
            "blockExplorerUrls": [
              "https://sepolia.basescan.org/"
            ],
            "iconUrls": [],
            "nativeCurrency": {
              "name": "SepoliaETH",
              "symbol": "SepoliaETH",
              "decimals": 18
            },
            "rpcUrls": [
              "https://sepolia.base.org"
            ],
            "chainId": `0x${CHAIN_ID.SEPOLIA.toString(16)}`,
            "chainName": "BaseSepolia"
          }
        ]
      });
    } catch (addError) {
      console.error('Failed to add the network:', addError);
      const errorCode = (addError as any)?.code;
      const errorMessage = (addError as any)?.message || (addError as any).toString();

      setErrorData({
        title: 'Error',
        message: `ネットワークの追加に失敗しました。${ errorCode } : ${ errorMessage }`,
        callback: () => setErrorData(null),
        cancelCallback: () => setErrorData(null)
      });
    }
  }

  const ImageView = () => {
    console.log("ImageViewはじめ")
    if (provider == null || contractDetails == null || remainingMintable == null || !isLoaded) return null;

    // 販売が停止中の場合のエラーメッセージ表示
    if (contractDetails != null && contractDetails.paused) {
      return <Text fontSize="2xl" color="red.500">販売を停止しています。Discordの情報をチェックしてください。</Text>;
    }

    return (
      <div className='w-full' style={{ width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          
            {/* {chainId !== null && chainId !== CHAIN_ID.BASE ? ( */}
            {chainId !== null && chainId !== CHAIN_ID.SEPOLIA ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button bg='#fa4e74' color='white' onClick={requestNetworkChange} isDisabled={isLoading}>
                  Switch to Base Network
                </Button>
              </div>
            ) : (
              parseInt(remainingMintable.toString()) > 0 ? (
                <MainView />
              ) : (
                <Text fontSize="2xl" color="red.500">完売しました🎉</Text>
              )
            )}
        </div>
      </div>
    );
  };

  const MainView = () => {
    if (provider == null || contractDetails == null) return null;
    const totalCost = (mintAmount * 0.021).toFixed(3);

    return (
      <div className='w-500'>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '450px' }}>
          <Card align='center'>
            <CardHeader>
              <div style={{ textAlign: 'center' }}>
                <Text>Your Address</Text>
              </div>
              <div>{address}</div>
            </CardHeader>
            <CardBody>
              <div style={{ textAlign: 'center', width: '450px' }}>
                <Heading size='md'>TotalSupply : {contractDetails.totalSupply || ''} / {contractDetails.maxSupply || ''}</Heading>
              </div>
            </CardBody>
          </Card>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '450px' }}>
          <Card align='center'>
            <CardHeader>
              <div style={{ textAlign: 'center', width: '450px' }}>
                <Text>{mintAmount} Mint × 0.021 = {totalCost} ETH</Text>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Text fontSize="xl">あなたはあと{remainingPurchases}点購入可能です</Text>
              </div>
            </CardHeader>
            <CardBody>
              <Stack spacing={4} direction='row' align='center'>
                <Button onClick={setToMin} shadow="lg" height="60px" width="60px" borderRadius="full" padding={0} display="flex" alignItems="center" justifyContent="center" margin={0} bg='#66ccff' color='white' size='lg' style={{ fontSize: '20px', margin: '0px', textAlign: 'center' }} isDisabled={isLoading}>MIN</Button>
                <Button onClick={handleDecrease} shadow="lg" height="50px" width="40px" borderRadius="full" padding={0} display="flex" alignItems="center" justifyContent="center" margin={0} bg='#66ccff' color='white' size='lg' style={{ fontSize: '30px', margin: '0px', textAlign: 'center' }} isDisabled={isLoading}>-</Button>
                <Text fontSize='3xl'>{mintAmount}</Text>
                <Button onClick={handleIncrease} shadow="lg" height="50px" width="40px" borderRadius="full" padding={0} display="flex" alignItems="center" justifyContent="center" margin={0} bg='#fa4e74' color='white' size='lg' style={{ fontSize: '30px', margin: '0px', textAlign: 'center' }} isDisabled={isLoading}>+</Button>
                <Button onClick={setToMax} shadow="lg" height="60px" width="60px" borderRadius="full" padding={0} display="flex" alignItems="center" justifyContent="center" margin={0} bg='#fa4e74' color='white' size='lg' style={{ fontSize: '20px', margin: '0px', textAlign: 'center' }} isDisabled={isLoading}>MAX</Button>
              </Stack>
            </CardBody>
            <CardFooter>
              <div>
              <Button bg='#fa4e74' color='white' onClick={mintToken} isDisabled={isLoading || isMintButtonDisabled}>
                {isMintButtonDisabled ? '購入上限になりました' : 'MINT'}
              </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  };

  const mintToken = async () => {
    console.log("mintToken")
    console.log("connectingAddress=",connectingAddress)
    let allowlistMaxMintAmount;

    try {
      if (connectingAddress) {
        setisLoading(true);
        let totalSupply = parseInt(contractDetails.totalSupply, 10);

        nameMap = allowlistAddresses.map( list => list[0] );
        leafNodes = allowlistAddresses.map(addr => ethers.utils.solidityKeccak256(['address', 'uint256'], [addr[0] , addr[1]]));
        merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
          merkleTree = new MerkleTree(leafNodes, sha1, {
            sortLeaves: true,
            sortPairs: true
          })
        addressId = nameMap.indexOf(connectingAddress.toLowerCase());
        if( addressId == -1){
          //data.whitelistUserAmount = 0;
          allowlistMaxMintAmount = 0;
          claimingAddress = ethers.utils.solidityKeccak256(['address', 'uint256'], [allowlistAddresses[0][0] , allowlistAddresses[0][1]]);
          hexProof = merkleTree.getHexProof(claimingAddress);    
        }else{
          //data.whitelistUserAmount = allowlistAddresses[addressId][1];
          allowlistMaxMintAmount = allowlistAddresses[addressId][1];
          claimingAddress = ethers.utils.solidityKeccak256(['address', 'uint256'], [allowlistAddresses[addressId][0] , allowlistAddresses[addressId][1]]);
          hexProof = merkleTree.getHexProof(claimingAddress);    
        }
        console.log("⭐ミント前情報⭐")
        console.log("totalSupply=", totalSupply);
        console.log("allowlistMaxMintAmount=",allowlistMaxMintAmount)
        console.log("mintAmount=", mintAmount);
        console.log("hexProof=",hexProof);

        // const mintIdx: string[] = [];
        // for (let i = 0; i < mintAmount; i++) {
        //   mintIdx.push((totalSupply + i + 1).toString());
        // }
        // const result = await mintTokens(connectingAddress, mintIdx);
        const result = await mintTokens(Number(mintAmount), Number(allowlistMaxMintAmount), hexProof);
        setisLoading(false);
        console.log("claim_result=",result);

        if (result.success) {
          if (result.message && !result.message.includes("拒否")) {
            setDialogData({
              title: 'Success',
              message: result.message,
              callback: async () => {
                setDialogData(null);
                const details = await getContractDetails(provider, connectingAddress);
                setContractDetails(details);
              },
              cancelCallback: () => setErrorData(null)
            });
          }
        } else {
          setErrorData({
            title: 'Error',
            message: result.message,
            callback: () => setErrorData(null),
            cancelCallback: () => setErrorData(null)
          });
        }
      }
    } catch (error) {
      setisLoading(false);
      console.error('Failed to contract mint:', error);
      setErrorData({
        title: 'Error',
        message: '予期せぬエラーが発生しました。もう一度お試しください。',
        callback: () => setErrorData(null),
        cancelCallback: () => setErrorData(null)
      });
    }
  };

  return (
    <div className='w-full'>
      <LoginView />
      <LogoutView />
      <ImageView />
      <InfoDialog dialogData={dialogData} />
      <ErrorDialog dialogData={errorData} />
      <LoadingOverlay loading={isLoading} />
    </div>
  );
}
