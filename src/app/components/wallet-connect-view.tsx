'use client'

import './wallet-connect-view.css'

import { Button, Box, Image, Menu, MenuButton, MenuItem, MenuList, Card, CardHeader, CardBody, CardFooter, Heading, Text, Stack, Center } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useContext, useEffect, useState, useCallback } from 'react';
import { isMobile } from "react-device-detect";
import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import { getAccount } from '@wagmi/core';
import { useWeb3Modal, useWeb3ModalEvents } from '@web3modal/wagmi/react';
import { CHAIN_ID } from '../../definition/contract';
import { WalletContext } from '../providers/wallet-provider';
import getContractDetails from '../providers/contract-provider';
import { useMint } from '../components/hooks/usemint';
import ChainTag from './contract/chain-tag';
import InfoDialog from './info-dialog';
import ErrorDialog from './error-dialog';
import DialogData from '@/entity/dialog/dialog-data';
import LoadingOverlay from './loading-overlay';
import { allowlistAddresses }  from "../allowlist.mjs";
import { ExternalProvider } from '@ethersproject/providers';

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
    mintCost: '0',
  });
  const [canUseMetamask, setCanUseMetamask] = useState(false);
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const [errorData, setErrorData] = useState<DialogData | null>(null);
  const [isLoading, setisLoading] = useState(false);
  const [remainingMintable, setRemainingMintable] = useState<number | null>(null);
  const SUB_DIRECTRY2 = "zutomamoPFP/mintsite/";
  const SUB_DIRECTRY = "assets/";
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCorrectchain, setIsCorrectchain] = useState(false);
  const { MerkleTree } = require('merkletreejs');
  const keccak256 = require('keccak256');
  const [allowlistMaxMintAmount, setallowlistMaxMintAmount] = useState(0);
  const [isMintButtonDisabled, setIsMintButtonDisabled] = useState(false);
  const [remainingPurchases, setRemainingPurchases] = useState(0);
  const [mintCosthenkan, setMintCosthenkan] = useState(0);
  const [isAllowListed, setIsAllowListed] = useState(false);

  let nameMap;
  let leafNodes;
  let merkleTree;
  let addressId = -1;
  let claimingAddress;
  let hexProof;

  useEffect(() => {
    console.log("setCanUseMetamask")
    setCanUseMetamask(window.ethereum != null);
  }, []);
  
  useEffect(() => {
    const handleChainChanged = async (_chainId: string) => {
      console.log("chainChanged:_chainId=", _chainId);

      setconnectchange();

    //   setChainId(Number(_chainId));
    //   setIsCorrectchain(Number(_chainId) === CHAIN_ID.SEPOLIA); // ⭐
    //   const provider = await getAccount().connector!.options.getProvider();
    //   // setProvider(new ethers.providers.Web3Provider(window.ethereum as ExternalProvider));
    //   setProvider(new ethers.providers.Web3Provider(provider));
    //   setconnectchange();
    // };
  
    // if (provider != null) {
    //   // provider.on('chainChanged', handleChainChanged);
    //   provider.on('chainChanged', (chainId: number) => {
    //     console.log('chainChanged', Number(chainId));
    //     setChainId(Number(chainId));
    //   })
    // }
  
    // return () => {
    //   if (provider != null) {
    //     provider.removeListener('chainChanged', handleChainChanged);
    //   }
    // };
    }
  }, []);

  const initializeProvider = () => {
    if (window.ethereum) {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  };

  const updateProvider = useCallback(async () => {
    console.log("updateProvider")
    console.log("connectingAddress=",connectingAddress)
    console.log("Provider=", provider);
    console.log("Address=", address);
    console.log("ChainId=", chainId);

    if (address == null) {
      setProvider(null);
      setAddress(null);
      setChainId(null);
    } else {

      setconnectchange();
    }
  // }, [connectingAddress, setAddress, setChainId, setProvider, chain]);
  }, [ address, setAddress, setChainId, setProvider, chain]);

  const setconnectchange = async () => {
    console.log("setconnectchange");

    if (getAccount().connector == null) return;

    console.log("setconnectchange");
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
    setAddress(address);
    if (chain != null) {
      setChainId(chain.id);
    }
    console.log("setconnectchangeのchainId=", chainId)
  }

  useEffect(() => {
    updateProvider();
  }, [updateProvider, modalEvent]);

  useEffect(() => {
    updateProvider();
  }, [updateProvider]);

  useEffect(() => {
    if (chainId !== CHAIN_ID.SEPOLIA) {
      setIsCorrectchain(false);
      setProvider(null); // Correct the provider when the network is wrong
      setChainId(null);
      return;
    } else {
      setIsCorrectchain(true);
    }
  }, [chain]);

  useEffect(() => {
    if (provider == null ) return;
    async function fetchContractDetails() {
      try {
        console.log("fetchContractDetails")
        console.log("fetchContractDetailsのconnectingAddress=",connectingAddress)
        console.log("fetchContractDetailsのAddress=", address);
        console.log("fetchContractDetailsのisCorrectchain=",isCorrectchain);
        // console.log("provider=",provider);

        // if (connectingAddress) {
        if (address && isCorrectchain) {
          
          const details = await getContractDetails(provider, address);
          setContractDetails(details);
          setIsLoaded(true);
          
          // アローリストから最大ミント数を取得
          nameMap = allowlistAddresses.map(list => list[0]);
          console.log("nameMap=",nameMap);
          addressId = nameMap.indexOf(address.toLowerCase());
          console.log("addressId=",addressId);

          if (addressId !== -1) {
            console.log("allowlistAddresses[addressId][1]=",allowlistAddresses[addressId][1])
            setallowlistMaxMintAmount(Number(allowlistAddresses[addressId][1]));

            // 個人が買える数
            const initialMintAmount = Number(allowlistAddresses[addressId][1]) - Number(details.mintedAmountBySales);
            setRemainingPurchases(initialMintAmount);
            setMintAmount(initialMintAmount > 0 ? initialMintAmount : 0);

            if (initialMintAmount <= 0) {
              setIsMintButtonDisabled(true);
            }

            // 全体で買える数
            const remaining = parseInt(details.maxSupply) - parseInt(details.totalSupply);
            setRemainingMintable(remaining);
            setIsAllowListed(true);
            
          } else {
            setallowlistMaxMintAmount(0);
            setRemainingPurchases(0);
            setMintAmount(0);
            setIsMintButtonDisabled(true);
            setRemainingMintable(0);
            setIsAllowListed(false);
          }
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
  // }, [connectingAddress, provider, isCorrectchain]);
  }, [address, provider, isCorrectchain]);

  useEffect(() => {
    if (contractDetails) {
      const remaining = parseInt(contractDetails.maxSupply) - parseInt(contractDetails.totalSupply);
      setRemainingMintable(remaining);
    }
  }, [contractDetails]);

  const { mintTokens } = useMint();

  const LoginView = () => {
    
    const views = [];

    console.log("LoginView");
    console.log("LoginViewのprovider=",provider);
    console.log("LoginViewのisCorrectchain=",isCorrectchain);
    console.log("LoginViewのcanUseMetamask=",canUseMetamask);
    console.log("⭐LoginViewのchain=",chain);

    if (provider != null) return null;

    // views.push(
    //   <Button key={1} className='m-5 w-30' bg='#fa4e74' color='white' onClick={() => open()} isDisabled={isLoading}>
    //     ウォレットに接続
    //   </Button>
    // );

    // if (isMobile && canUseMetamask) {
    if (isMobile && canUseMetamask) {
      views.push(
        <Button key={1} className='m-5 w-30' colorScheme='orange' onClick={setConnectInfo} >
          <Image className='mr-1 metamask-icon' src= {SUB_DIRECTRY + 'metamask.svg'} alt='' />
          Metamask接続
        </Button>
      );
    }

    if (isMobile && !canUseMetamask) {
      views.push(
        <Button key={2} className='m-5 w-30' colorScheme='orange' onClick={() => {
          const path = document.URL.split('://')[1];
          const metamaskLink = `https://metamask.app.link/dapp/` + `${path}`;
          location.href = metamaskLink;
        }} isDisabled={isLoading}>
          <Image className='mr-1 metamask-icon' src={SUB_DIRECTRY + 'metamask.svg'} alt='' />
          MetamaskAppで開く
        </Button>
      );
    }

    return <div className='flex flex-col justify-center'>{views}</div>;
  };

  const setConnectInfo = async () => {
    console.log("setConnectInfo");
    const provider = window.ethereum as any;
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    setAddress(accounts.length === 0 ? null : accounts[0]);
    // console.log("Metamaskからのaccounts=",accounts);
    console.log("Metamaskからのaddress=",address);
    // console.log("MetamaskからのconnectingAddress=",connectingAddress);
    const chainId = await provider.request({ method: 'eth_chainId' });
    setChainId(Number(chainId));
    // console.log("Metamaskからのprovider=",provider);
    // console.log("⭐Metamaskからのnew provider=",new ethers.providers.Web3Provider(provider));
    setProvider(new ethers.providers.Web3Provider(provider));
    console.log("⭐再Metamaskからのprovider=",provider);
  }

  const handleIncrease = () => {
    const remaining = remainingMintable !== null ? remainingMintable : 0;
    if (mintAmount < Math.min(remainingPurchases, remaining)) {
        setMintAmount(mintAmount + 1);
    }
  };

  const handleDecrease = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1);
    }
  };

  const setToMin = () => {
    setMintAmount(Math.min(remainingPurchases, 1));
  };

  const setToMax = () => {
    const remaining = remainingMintable !== null ? remainingMintable : 0;
    setMintAmount(Math.min(remainingPurchases, remaining));
};

  const LogoutView = () => {
    if (provider == null) return null;
    console.log("LogoutViewのaddress=",address);
    console.log("LogoutViewのconnectingAddress=",connectingAddress);

    return (
      <div className='w-450 flex justify-between items-center px-3' style={{ marginBottom: '20px' }}>
        {chainId && <ChainTag chainId={chainId} />}
        <Menu>
          <MenuButton bg='#fa4e74' color='white' as={Button} size={'sm'} isDisabled={isLoading}>
            {address == null ? '' : `${address.slice(0, 4)} ... ${address.slice(-4)}`}
          </MenuButton>
          <MenuList>
            {/* <MenuItem onClick={() => open()} isDisabled={isLoading}>あなたのウォレット</MenuItem> */}
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
    let errflg = false;

    try {
      await (window.ethereum as any).request({
        method: 'wallet_switchEthereumChain',
        // params: [{ chainId: `0x${CHAIN_ID.BASE.toString(16)}` }], // ⭐
        params: [{ chainId: `0x${CHAIN_ID.SEPOLIA.toString(16)}` }],
      });
    } catch (switchError: any) {

      errflg = true;
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

          const errorCode = (switchError as any)?.code;
          const errorMessage = (switchError as any)?.message || (switchError as any).toString();

          if (errorCode != 4001) {
            console.error('Failed to switch the network:', switchError);

            setErrorData({
              title: 'Error',
              message: `ネットワークの切り替えに失敗しました。${ errorCode } : ${ errorMessage }`,
              callback: () => setErrorData(null),
              cancelCallback: () => setErrorData(null)
            });
          }
        }
      }
    }

    setisLoading(false);

    console.log("errflg=",errflg);
    if (!errflg) {
      // エラーになっていなければ接続情報を読み込む
      // エラーまたはキャンセルの場合は読み込まない
      setConnectInfo();
    }
    
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
            // "chainName": "Base" // ⭐
            "blockExplorerUrls": [
              "https://base-sepolia.blockscout.com"
            ],
            "iconUrls": [],
            "nativeCurrency": {
              "name": "SepoliaETH",
              "symbol": "ETH",
              "decimals": 18
            },
            "rpcUrls": [
              "https://sepolia.base.org"
            ],
            "chainId": `0x${CHAIN_ID.SEPOLIA.toString(16)}`,
            "chainName": "Base Sepolia"
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
  const KirikaeView = () => {
    console.log("KirikaeViewはじめ")
    console.log("KirikaeViewのconnectingAddress=",connectingAddress);
    console.log("KirikaeViewのchainId=",chainId);
    console.log("KirikaeViewのchain=",chain);

    // すでに異なっているチェーンの場合、正しい接続に切り替えるボタンを表示してほしい
    // if (provider == null ) return null;

    if (chainId == CHAIN_ID.SEPOLIA) { //⭐
      setIsCorrectchain(true);
      return null;
    } else {
      setIsCorrectchain(false);
    }
    console.log ("KirikaeViewのisCorrectchain=",isCorrectchain);
    console.log ("KirikaeViewのchainId=",chainId);

    return (
      <div className='w-full' style={{ width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {!isCorrectchain && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button bg='#fa4e74' color='white' onClick={requestNetworkChange} isDisabled={isLoading}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Text whiteSpace="normal">ネットワーク切り替え<br />Base Network</Text>
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const ImageView = () => {
    console.log("ImageViewはじめ")
    console.log("isLoaded=",isLoaded)
    console.log("remainingMintable=",remainingMintable)
    console.log("contractDetails=",contractDetails)

    if (provider == null || contractDetails == null || remainingMintable == null || !isLoaded || !isCorrectchain) return null;

    // 販売が停止中の場合のエラーメッセージ表示
    if (contractDetails != null && contractDetails.paused) {
      return <Text fontSize="2xl" color="red.500">販売を停止しています。Discordの情報をチェックしてください。</Text>;
    }

    return (
      <div className='w-full' style={{ width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          
            {parseInt(remainingMintable.toString()) > 0 ? (
              <MainView />
            ) : (
              <Text fontSize="2xl" color="red.500">完売しました🎉</Text>
            )}
            
        </div>
      </div>
    );
  };

  const MainView = () => {
    if (provider == null || contractDetails == null) return null;
    setMintCosthenkan(Number(contractDetails.mintCost) / 1000000000000000000);
    const totalCost = (mintAmount * Number(mintCosthenkan)).toFixed(3);

    return (
      <div className='w-400'>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '400px' }}>
          <Card align='center'>
            <CardHeader>
              <div style={{ textAlign: 'center', width: '400px' }}>
                <Heading size='md'>全体発行数 : {contractDetails.totalSupply || ''} / {contractDetails.maxSupply || ''}</Heading>
              </div>
            </CardHeader>
            <CardBody>
              <div style={{ textAlign: 'center' }}>
              <Heading size='md'>Your Address</Heading>
              </div>
              <div>{address}</div>
              <div style={{ textAlign: 'center', width: '400px' }}>
                　　　
              </div>
              <div style={{ textAlign: 'center', width: '400px' }}>
                <Heading size='md'><Text>ミント数：{contractDetails.mintedAmountBySales}</Text></Heading>
              </div>
              <div style={{ textAlign: 'center', width: '400px' }}>
                <Heading size='md'><Text>購入希望数：{allowlistMaxMintAmount}</Text></Heading>
              </div>
            </CardBody>
          </Card>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '400px' }}>
          <Card align='center'>
            <CardHeader>
              <div style={{ textAlign: 'center', width: '400px' }}>
              <Text>販売価格：{mintAmount} Mint × {mintCosthenkan}<Heading size='md'>{totalCost} ETH</Heading></Text>
              </div>
              <div style={{ textAlign: 'center', width: '400px' }}>
                　　　
              </div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                {isAllowListed ? (
                  isMintButtonDisabled ? (
                    <Text fontSize="xl">購入上限に達しました</Text>
                  ) : (
                    <Text fontSize="xl">あなたはあと<Box as="span" fontWeight="bold">{remainingPurchases}</Box>点購入可能です</Text>
                  )
                )
                  : '申し訳ありませんが、ご予約が確認できませんでした'
                }
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
                {isMintButtonDisabled ? 'MINT不可' : 'MINT'}
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
      // if (connectingAddress) {
      if (address) {
        setisLoading(true);
        let totalSupply = parseInt(contractDetails.totalSupply, 10);

        nameMap = allowlistAddresses.map( list => list[0] );
        leafNodes = allowlistAddresses.map(addr => ethers.utils.solidityKeccak256(['address', 'uint256'], [addr[0] , addr[1]]));
        merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
          // merkleTree = new MerkleTree(leafNodes, sha1, {
          //   sortLeaves: true,
          //   sortPairs: true
          // })
        // addressId = nameMap.indexOf(connectingAddress.toLowerCase());
        addressId = nameMap.indexOf(address.toLowerCase());
        
        if( addressId == -1){
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

        // ユーザーの残高を確認
        // const balance = await provider.getBalance(connectingAddress);
        const balance = await provider.getBalance(address);
        const requiredEth = ethers.utils.parseEther(((mintAmount * mintCosthenkan) + 0.0005).toString()); // ミント価格の計算
        if (balance.lt(requiredEth)) {
          throw new Error("ETHが不足しています。");
        }

        const result = await mintTokens(Number(mintAmount), Number(allowlistMaxMintAmount), hexProof);
        setisLoading(false);
        console.log("claim_result=",result);

        if (result.success) {
          if (result.message && !result.message.includes("拒否")) {

            // ミント完了後に購入可能数を更新
            // const details = await getContractDetails(provider, connectingAddress);
            const details = await getContractDetails(provider, address);
            setContractDetails(details);

            const initialMintAmount = Number(allowlistAddresses[addressId][1]) - Number(details.mintedAmountBySales);
            setRemainingPurchases(initialMintAmount);
            setMintAmount(initialMintAmount > 0 ? initialMintAmount : 0);
            if (initialMintAmount <= 0) {
                setIsMintButtonDisabled(true);
            }

            setDialogData({
              title: 'Success',
              message: result.message,
              callback: async () => {
                setDialogData(null);
                // const details = await getContractDetails(provider, connectingAddress);
                const details = await getContractDetails(provider, address);
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
        message: `予期せぬエラーが発生しました。もう一度お試しください。${error}`,
        callback: () => setErrorData(null),
        cancelCallback: () => setErrorData(null)
      });
    }
  };

  return (
    <div className='w-full'>
      
      <LoginView />
      {/* {provider != null && !isCorrectchain && <KirikaeView />} */}
      <KirikaeView />
      <LogoutView />
      <ImageView />
      <InfoDialog dialogData={dialogData} />
      <ErrorDialog dialogData={errorData} />
      <LoadingOverlay loading={isLoading} />
    </div>
  );
}
