import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // 'Lock'コントラクトをデプロイする
  const ZutomamoPFP = await ethers.getContractFactory("zutomamoPFP");
//   const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 現在の時間から24時間後を設定
  const zutomamoPFP = await ZutomamoPFP.deploy();

  await zutomamoPFP.waitForDeployment();

  console.log("Lock Contract Deployed at", await zutomamoPFP.getAddress());
}

// エラーハンドリング
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});




// import { ethers } from 'hardhat';

// async function main() {
//   const nft = await ethers.deployContract('Lock');

//   await nft.waitForDeployment();

//   console.log('NFT Contract Deployed at ' + nft.target);
// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });