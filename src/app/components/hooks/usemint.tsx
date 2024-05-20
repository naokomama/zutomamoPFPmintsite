import { useContext } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../../providers/wallet-provider';
import { FACTORY_CONTRACT_ADDRESS, MAIN_ABI } from '../../../definition/contract';

export const useMint = () => {
  const { provider } = useContext(WalletContext);

  const mintTokens = async (userAddress: string, mintIdx: string[]) => {
    if (!provider) {
      const errorMessage = 'Provider not found';
      console.error(errorMessage);
      return { success: false, message: errorMessage };
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
      const successMessage = 'ミントが完了しました';
      console.log(successMessage);
      return { success: true, message: successMessage };
    } catch (error) {
      const errorMessage = `ミント時にエラーが発生しました: ${error}`;
      console.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  return { mintTokens };
};
