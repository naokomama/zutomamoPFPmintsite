import { ethers } from 'ethers';
import { FACTORY_CONTRACT_ADDRESS, FACTORY_ABI } from '../../definition/contract';

// Alchemyを使ったプロバイダー設定
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string; // Alchemyから取得したAPIキー
const network = "base"; // ネットワークエイリアス、"homestead"はメインネットを指します
const provider = new ethers.AlchemyProvider(network, alchemyApiKey);

// コントラクトに接続
const contract = new ethers.Contract(
  FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
  FACTORY_ABI.ERC721,
  provider
);

export default async function getContractDetails(userAddress: string) {
    try {
      const totalSupplyPromise = contract.totalSupply();
      const userMintedAmountPromise = contract.userMintedAmount(userAddress);
      const pausedPromise = contract.paused();
  
      const [totalSupply, userMintedAmount, paused] = await Promise.all([
        totalSupplyPromise,
        userMintedAmountPromise,
        pausedPromise
      ]);
  
      return {
        totalSupply: totalSupply.toString(),
        userMintedAmount: userMintedAmount.toString(),
        paused
      };
    } catch (error) {
      console.error('Error fetching contract details:', error);
      throw error;
    }
  }

// // コントラクトの関数を呼び出し（例：totalSupplyを取得）
// async function getTotalSupply() {
//   try {
//     const totalSupply = await contract.totalSupply();
//     console.log('Total Supply:', totalSupply.toString());
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// getTotalSupply();
