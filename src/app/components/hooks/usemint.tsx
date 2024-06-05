import { useContext } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../../providers/wallet-provider';
import { FACTORY_CONTRACT_ADDRESS, MAIN_ABI } from '../../../definition/contract';

export const useMint = () => {
  const { provider } = useContext(WalletContext);

  // const mintTokens = async (userAddress: string, mintIdx: string[]) => {
    const mintTokens = async (amount: number, allowedAmount: number, merkleProof: any) => {
      console.log("引数amount=",amount);
      console.log("引数allowedAmount=",allowedAmount);
      console.log("引数merkleProof=",merkleProof);
      console.log("provider=",provider);

    if (!provider) {
      const errorMessage = 'Provider not found';
      console.error(errorMessage);
      return { success: false, message: errorMessage };
    }

    const signer = provider.getSigner();
    console.log("signer=",signer);

    const contractWithSigner = new ethers.Contract(
      FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
      MAIN_ABI.ERC721,
      signer
    );
    console.log("contractWithSigner=",contractWithSigner);

    try {
      console.log("claim")
      // const gasLimit = await provider.estimateGas({
      //   to: FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
      //   data: MAIN_ABI.ERC721
      // });

      const contractInterface = new ethers.utils.Interface(["function claim(uint256 mintAmount, uint256 allowlistMaxMintAmount, bytes32[] hexProof)"]);
      const txData = contractInterface.encodeFunctionData("claim", [Number(amount), Number(allowedAmount), merkleProof]);

      const gasLimit = await provider.estimateGas({
        to: FACTORY_CONTRACT_ADDRESS.BASE_ERC721,
        data: txData
      });

      console.log ("gasLimit=",gasLimit);

      const claimTx = await contractWithSigner.claim(amount, allowedAmount, merkleProof,{
        gasLimit: gasLimit
      });

      console.log("claimTx=",claimTx);
      console.log('Mint transaction sent:', claimTx.hash);
      await claimTx.wait(); // トランザクションの確定を待つ
      const successMessage = 'ミントが完了しました';
      console.log(successMessage);
      return { success: true, message: successMessage };
    } catch (error) {
      const errorCode = (error as any)?.code;
      const errorMg = (error as any)?.message || (error as any).toString();

      if (errorCode === 4001) {
        // ユーザーがトランザクションを拒否した場合の処理
        const cancelMessage = 'ユーザーがトランザクションを拒否しました。';
        console.log(cancelMessage);
        return { success: true, message: cancelMessage };
      }

      const errorMessage = `ミント時にエラーが発生しました: ${errorCode} : ${errorMg}`;
      console.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  return { mintTokens };
};
