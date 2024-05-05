import { ethers } from 'ethers';
import { FACTORY_CONTRACT_ADDRESS, FACTORY_ABI } from '../../definition/contract';

// Alchemyを使ったプロバイダー設定
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string; // Alchemyから取得したAPIキー
const network = "homestead"; // ネットワークエイリアス、"homestead"はメインネットを指します
const provider = new ethers.AlchemyProvider(network, alchemyApiKey);

// コントラクトに接続
const contract = new ethers.Contract(
  FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
  FACTORY_ABI.ERC721,
  provider
);

// コントラクトの関数を呼び出し（例：totalSupplyを取得）
async function getTotalSupply() {
  try {
    const totalSupply = await contract.totalSupply();
    console.log('Total Supply:', totalSupply.toString());
  } catch (error) {
    console.error('Error:', error);
  }
}

getTotalSupply();
