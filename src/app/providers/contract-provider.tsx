import { ethers } from 'ethers';
import { FACTORY_CONTRACT_ADDRESS, MAIN_ABI } from '../../definition/contract';
import { sepolia, base } from 'viem/chains'
import { useContext } from 'react';
import { WalletContext } from './wallet-provider';

// import { AlchemyProvider } from "@ethersproject/providers";
// import { useAccount, useSigner, useConnect } from 'wagmi';
// import { useContractWrite, usePrepareContractWrite } from 'wagmi'
// import { InjectedConnector } from 'wagmi/connectors/injected';
// import { Web3Modal } from './Web3Modal';

// const provider = new ethers.providers.AlchemyProvider(network, alchemyApiKey);
// const baseUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

// Alchemyを使ったプロバイダー設定
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string; // Alchemyから取得したAPIキー
const baseUrl = base.rpcUrls.alchemy.http.toString() + `/${alchemyApiKey}`;

// JsonRpcProviderを使用して指定したURLに接続
const provider = new ethers.providers.JsonRpcProvider(baseUrl);

// コントラクトに接続
const contract = new ethers.Contract(
  FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
  MAIN_ABI.ERC721,
  provider
);

export default async function getContractDetails(userAddress: string) {
    try {
      const totalSupplyPromise = contract.totalSupply();
      // const userMintedAmountPromise = contract.userMintedAmount(userAddress);
      const maxSupplyPromise = contract.maxSupply();
      const pausedPromise = contract.paused();
      const [totalSupply, maxSupply, paused] = await Promise.all([
        totalSupplyPromise,
        // userMintedAmountPromise,
        maxSupplyPromise,
        pausedPromise
      ]);
  
      return {
        totalSupply: totalSupply.toString(),
        // userMintedAmount: userMintedAmount.toString(),
        maxSupply:maxSupply.toString(),
        userMintedAmount: "3",
        paused: paused
      };
    } catch (error) {
      console.error('Error fetching contract details:', error);
      throw error;
    }
  }

  export async function Mint(userAddress: string, mintIdx: string[]) {

    const { provider } = useContext(WalletContext);

    const writeContract = async () => {
      if (!provider) {
        console.error('Provider not found');
        return;
      }

      const signer = provider.getSigner();
      const contractWithSigner = new ethers.Contract(
        FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
        MAIN_ABI.ERC721,
        signer
      );

      try {
        const mintTx = await contractWithSigner.mint(userAddress, mintIdx);
        console.log('Mint transaction sent:', mintTx.hash);
        await mintTx.wait(); // トランザクションの確定を待つ
        console.log('Mint transaction confirmed');
      } catch (error) {
        console.error('Mint transaction failed:', error);
      }
    };

    // ↓wagmiで
    // const { data, isLoading, isSuccess, write } = useContractWrite({
    //   address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    //   abi: MAIN_ABI.ERC721,
    //   functionName: 'mint',
    //   args: [userAddress,mintIdx],
    // })

    // write(
    // //   {
    // //   args: [69],
    // //   from: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    // //   value: parseEther('0.01'),
    // // }
    // )

    // console.log("data=",data);
    // console.log("isLoading=",isLoading);
    // console.log("isSuccess=",isSuccess);
    
    // ↑wagmiで

    // const { data, isLoading, isSuccess, write } = useContractWrite(config)
    // write()

    
    // const { config } = usePrepareContractWrite({
    //   address: FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
    //   abi: MAIN_ABI.ERC721,
    //   functionName: 'mint',
    //   })
    //   const { data, isLoading, isSuccess, write } = useContractWrite(config)

    // const { isConnected } = useAccount();
    // const { connect } = useConnect({
    //   connector: new InjectedConnector(),
    // });
    // const { data: signer } = useSigner();
  
    // if (!isConnected) {
    //   console.error("Wallet not connected.");
    //   await connect();
    // }
  
    // if (!signer) {
    //   console.error("Signer not found.");
    //   return;
    // }
  
    // try {
    //   const contractWithSigner = new ethers.Contract(
    //     FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
    //     MAIN_ABI.ERC721,
    //     signer
    //   );
  
    //   const mintTx = await contractWithSigner.mint(userAddress, mintIdx);
    //   console.log('Mint transaction sent:', mintTx.hash);
    //   await mintTx.wait(); // トランザクションの確定を待つ
    //   console.log('Mint transaction confirmed');
    // } catch (error) {
    //   console.error('Mint transaction failed:', error);
    // }
  }

  // export async function Mint(userAddress: string, mintIdx: string[]) {
  //   if (!provider || !userAddress) {
  //     console.error("Wallet not connected or address not found.");
  //     return;
  //   }

  //   if (!Array.isArray(mintIdx) || mintIdx.length === 0) {
  //     console.error("MintIdx must be a non-empty array.");
  //     return;
  //   }

  //   console.log("userAddress=",userAddress);
  
  //   // Signerを取得してトランザクションを送信する
  //   const signer = provider.getSigner();
  //   console.log("signer=",signer);
  //   const contractWithSigner = new ethers.Contract(
  //     FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
  //     MAIN_ABI.ERC721,
  //     signer
  //   );

  //   console.log("contractWithSigner=",contractWithSigner);
  
  //   try {
  //     const mintTx = await contractWithSigner.mint(userAddress, mintIdx);
  //     console.log('Mint transaction sent:', mintTx.hash);
  //     await mintTx.wait(); // トランザクションの確定を待つ
  //     console.log('Mint transaction confirmed');
  //   } catch (error) {
  //     console.error('Mint transaction failed:', error);
  //   }
  // }
