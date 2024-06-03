import { ethers } from 'ethers';
import { FACTORY_CONTRACT_ADDRESS, MAIN_ABI } from '../../definition/contract';
import { base } from 'viem/chains';
import { WalletContext } from './wallet-provider';
import { useContext } from 'react';

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string;
const baseUrl = base.rpcUrls.alchemy.http.toString() + `/${alchemyApiKey}`;
const provider = new ethers.providers.JsonRpcProvider(baseUrl);
const contract = new ethers.Contract(
  FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
  MAIN_ABI.ERC721,
  provider
);
const salesID = 0;

export default async function getContractDetails(userAddress: string) {
  try {
    const totalSupplyPromise = contract.totalSupply();
    const maxSupplyPromise = contract.maxSupply();
    const pausedPromise = contract.paused();
    // const mintedAmountBySalesPromise = contract.mintedAmountBySales(salesID, userAddress);
    // const [totalSupply, maxSupply, paused, mintedAmountBySales] = await Promise.all([
    const [totalSupply, maxSupply, paused] = await Promise.all([
      totalSupplyPromise,
      maxSupplyPromise,
      pausedPromise,
      // mintedAmountBySalesPromise
    ]);

    return {
      totalSupply: totalSupply.toString(),
      maxSupply: maxSupply.toString(),
      paused: paused,
      // mintedAmountBySales: mintedAmountBySales.toString()
      mintedAmountBySales: "5"
    };
  } catch (error) {
    console.error('Error fetching contract details:', error);
    throw error;
  }
}

export async function Mint(userAddress: string, mintIdx: string[]) {
  const provider = useContext(WalletContext).provider;

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
    await mintTx.wait();
    console.log('Mint transaction confirmed');
  } catch (error) {
    console.error('Mint transaction failed:', error);
  }
}
