import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  try {
    const ZutomamoPFP = await ethers.getContractFactory("zutomamoPFP");
    const gasLimit = 8000000; // ガスリミットを増やしてみる
    const gasPrice = ethers.parseUnits('20', 'gwei'); // 必要に応じて調整

    console.log("Starting deployment...");
    const zutomamoPFP = await ZutomamoPFP.deploy({
      gasLimit,
      gasPrice
    });

    await zutomamoPFP.waitForDeployment();

    console.log("zutomamoPFP Contract Deployed at", await zutomamoPFP.getAddress());
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during deployment:", error.message);
      console.error("Transaction details:", (error as any).transaction);
      console.error("Receipt details:", (error as any).receipt);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

// エラーハンドリング
main().catch((error) => {
  if (error instanceof Error) {
    console.error("Main function error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
  process.exitCode = 1;
});




// import { ethers } from "hardhat";

// async function main() {
//   const [deployer] = await ethers.getSigners();

//   console.log("Deploying contracts with the account:", deployer.address);

//   const balance = await deployer.provider.getBalance(deployer.address);
//   console.log("Account balance:", balance.toString());

//   // 'Lock'コントラクトをデプロイする
//   const ZutomamoPFP = await ethers.getContractFactory("zutomamoPFP");
// //   const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 現在の時間から24時間後を設定
//   const zutomamoPFP = await ZutomamoPFP.deploy();

//   await zutomamoPFP.waitForDeployment();

//   console.log("zutomamoPFP Contract Deployed at", await zutomamoPFP.getAddress());
// }

// // エラーハンドリング
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
