import { ethers } from 'ethers';
// import { AlchemyProvider } from "@ethersproject/providers";
import { FACTORY_CONTRACT_ADDRESS, MAIN_ABI } from '../../definition/contract';

// Alchemyを使ったプロバイダー設定
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string; // Alchemyから取得したAPIキー
// const provider = new ethers.providers.AlchemyProvider(network, alchemyApiKey);
const baseUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

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
    if (!provider || !userAddress) {
      console.error("Wallet not connected or address not found.");
      return;
    }

    if (!Array.isArray(mintIdx) || mintIdx.length === 0) {
      console.error("MintIdx must be a non-empty array.");
      return;
  }

  console.log("userAddress=",userAddress);
  
    // Signerを取得してトランザクションを送信する
    const signer = provider.getSigner();
    console.log("signer=",signer);
    const contractWithSigner = new ethers.Contract(
      FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
      MAIN_ABI.ERC721,
      signer
    );

    console.log("contractWithSigner=",contractWithSigner);
  
    try {
      const mintTx = await contractWithSigner.mint(userAddress, mintIdx);
      console.log('Mint transaction sent:', mintTx.hash);
      await mintTx.wait(); // トランザクションの確定を待つ
      console.log('Mint transaction confirmed');
    } catch (error) {
      console.error('Mint transaction failed:', error);
    }
  }
