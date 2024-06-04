import { keccak256 } from "@ethersproject/keccak256";
import { MerkleTree } from "merkletreejs";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
// import { ethers } from "hardhat";

const BASE_URI = "https://zutomamogen.net/zutomamoPFP/json/";
const WITHDRAW_ADDRESS = "0x376E2F69A4cF1E73A444055291F9b250166746a9";

export const allowedAddressesLv1 = ['0x976EA74026E726554dB657fA54763abd0C3a0aa9', '0xe030EaDA1e2734356C4e170dCB8DA86B1F399482', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
  .map(address => hre.ethers.getAddress(address));

export const allowedAddressesLv2 = ['0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65']
  .map(address => hre.ethers.getAddress(address));

export const allowedAddressesLocal = ['0x4Df74Aa88c771a82121A8F15b69505Edd5Ff8Aad']
  .map(address => hre.ethers.getAddress(address));

type Node = {
  address: string,
  amount: number
};

const createTree = (allowList: Node[]) => {
  const leaves = allowList.map(node => hre.ethers.solidityPackedKeccak256(['address', 'uint256'], [node.address, node.amount]));
  return new MerkleTree(leaves, keccak256, { sortPairs: true });
};

describe("ZutomamoPFP", function () {

  async function fixture() { 
    const [owner, account, ...others] = await hre.ethers.getSigners();
    const getcontract = await hre.ethers.getContractFactory("zutomamoPFP");
    // const myContract = await getcontract.connect(owner).deploy();
    const myContract = await getcontract.deploy();

    const [addr1, addr2, addr3, addr4] = others;

    const tree = createTree([ 
      { address: addr1.address, amount: 1 },
      { address: addr2.address, amount: 2 },
      { address: addr3.address, amount: 5 },
      { address: addr4.address, amount: 60 }
    ]);

    await myContract.connect(owner).setMerkleRoot(tree.getHexRoot());

    const tree2 = createTree([
      { address: addr1.address, amount: 10 },
      { address: addr2.address, amount: 20 },
      { address: addr3.address, amount: 30 },
      { address: addr4.address, amount: 40 }
    ]);

    let mintCost = hre.ethers.parseEther("0.021");

    // Set sales info
    await myContract.setSalesInfo(0, 210, mintCost, tree.getHexRoot());
    await myContract.setBaseURI(BASE_URI);
    await myContract.setBaseExtension(".json");
    await myContract.unpause();

    // let leafNodes = allowList.map((addr) => keccak256(hre.ethers.solidityPackedKeccak256(['address', 'uint256'], [addr, allowedAmount])));
    // let merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

    let re_baseURI = await myContract.connect(owner).baseURI();
    let re_baseExtension = await myContract.connect(owner).baseExtension();
    let re_salesId = await myContract.connect(owner).salesId();
    let re_maxSupply = await myContract.connect(owner).maxSupply();
    let re_mintCost = await myContract.connect(owner).mintCost();

    return { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree, tree2, re_baseURI, re_baseExtension, re_salesId, re_maxSupply, re_mintCost };
  }

  describe("account test info display", function () {
    it("account test", async function () {
      const { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree, re_baseURI, re_baseExtension, re_salesId, re_maxSupply, re_mintCost } = await loadFixture(fixture);

      

      // test info---
      console.log("owner address : %s", owner.address);
      console.log("admin address : %s", account.address);
      console.log("addr1 address : %s", addr1.address);
      console.log("addr2 address : %s", addr2.address);
      console.log("addr3 address : %s", addr3.address);
      console.log("addr4 address : %s", addr4.address);
      console.log("tree : %s", tree);
      console.log("re_baseURI : %s", re_baseURI);
      console.log("re_baseExtension : %s", re_baseExtension);
      console.log("re_salesId : %s", re_salesId);
      console.log("re_maxSupply : %s", re_maxSupply);
      console.log("re_mintCost : %s", re_mintCost);
    });
  });

  // beforeEach(async function () {
  //   const { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree } = await loadFixture(fixture);
  // });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      const { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree, re_baseURI, re_baseExtension, re_salesId, re_maxSupply, re_mintCost } = await loadFixture(fixture);
      expect(await myContract.baseURI()).to.equal(BASE_URI);

      // let mintCost = await myContract.connect(owner).mintCost();
      // console.log("mintCost : %s",mintCost)
      expect(re_mintCost).to.equal(hre.ethers.parseEther("0.021"));
      // expect(await myContract.merkleRoot()).to.equal(tree.getHexRoot());
      // expect(mintCost).to.equal(hre.ethers.parseEther("0.021"));
      // expect(await myContract.merkleRoot()).to.equal(tree.getHexRoot());
    });
  });

  describe("Minting", function () {
    it("Should mint tokens correctly with valid proof", async function () {
      const { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree, re_baseURI, re_baseExtension, re_salesId, re_maxSupply, re_mintCost } = await loadFixture(fixture);
      const proof = tree.getHexProof(tree.getLeaf(0));

      await myContract.connect(owner).claim(2, 20, proof, { value: re_mintCost * 2 });
      expect(await myContract.balanceOf(owner.address)).to.equal(2);
    });

    it("Should not mint tokens with invalid proof", async function () {
      const { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree, re_baseURI, re_baseExtension, re_salesId, re_maxSupply, re_mintCost } = await loadFixture(fixture);
      const proof = tree.getHexProof(keccak256(addr2.address));

      await expect(
        myContract.connect(addr2).claim(2, 20, proof, { value: re_mintCost * 2 })
      ).to.be.revertedWith("Invalid proof");
    });
  });
});

// ↓↓↓
// import { keccak256 } from "@ethersproject/keccak256";
// import { MerkleTree } from "merkletreejs";
// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import { expect } from "chai";
// import { ethers } from "hardhat";  // 修正箇所

// const baseURI = "https://zutomamogen.net/zutomamoPFP/json/"
// const WITHDRAW_ADDRESS = "0x376E2F69A4cF1E73A444055291F9b250166746a9";

// export const allowedAddressesLv1 = ['0x976EA74026E726554dB657fA54763abd0C3a0aa9', '0xe030EaDA1e2734356C4e170dCB8DA86B1F399482', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
//   .map(address => hre.ethers.getAddress(address))

// export const allowedAddressesLv2 = ['0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65']
//   .map(address => hre.ethers.getAddress(address))

// export const allowedAddressesLocal = ['0x4Df74Aa88c771a82121A8F15b69505Edd5Ff8Aad']
//   .map(address => hre.ethers.getAddress(address))

// type Node = {
//   address: string,
//   amount: number
// }

// const createTree = (allowList: Node[]) => {

//   const leaves = allowList.map(node => hre.ethers.solidityPackedKeccak256(['address', 'uint256'], [node.address, node.amount]));
//   return new MerkleTree(leaves, keccak256, { sortPairs: true });
// }

// describe("ZutomamoPFP", function () {

//   async function fixture() { 
//     const [owner, account, ...others] = await hre.ethers.getSigners();
//     const getcontract = await hre.ethers.getContractFactory("zutomamoPFP");
//     const myContract = await getcontract.connect(owner).deploy();

//     const [addr1, addr2, addr3, addr4] = others;

//     const tree = createTree([ 
//       { address: addr1.address, amount: 1 },
//       { address: addr2.address, amount: 2 },
//       { address: addr3.address, amount: 5 },
//       { address: addr4.address, amount: 60 }
//     ]);

//     await myContract.connect(owner).setMerkleRoot(tree.getHexRoot());

//     const tree2 = createTree([
//       { address: addr1.address, amount: 10 },
//       { address: addr2.address, amount: 20 },
//       { address: addr3.address, amount: 30 },
//       { address: addr4.address, amount: 40 }
//     ]);

//     return { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree, tree2 }
//   }

//   describe("account test info display", function () {
//     it("account test", async function () {
//       const { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree } = await loadFixture(fixture);

//       // test info---
//       console.log("owner address : %s", owner.address);
//       console.log("admin address : %s", account.address);
//       console.log("addr1 address : %s", addr1.address);
//       console.log("addr2 address : %s", addr2.address);
//       console.log("addr3 address : %s", addr3.address);
//       console.log("addr4 address : %s", addr4.address);
//     });
//   });

//   beforeEach(async function () {
//     const { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree } = await loadFixture(fixture);

//     let mintCost: bigint = hre.ethers.parseEther("0.021");

//     // Set sales info
//     await myContract.setSalesInfo(1, 210, mintCost, tree);
//     await myContract.setBaseURI("https://zutomamogen.net/zutomamoPFP/json/");
//     await myContract.setBaseExtension(".json");
//     await myContract.unpause();
//   });

//   describe("Deployment", function () {
//     // it("Should set the right owner", async function () {
//     //   expect(await zutomamoPFP.hasRole(await zutomamoPFP.ADMIN(), owner.address)).to.equal(true);
//     // });

//     it("Should set the correct initial values", async function () {
//       const { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree } = await loadFixture(fixture);
//       expect(await myContract.baseURI()).to.equal("https://zutomamogen.net/zutomamoPFP/json/");
//       // expect(await zutomamoPFP.baseExtension()).to.equal(".json");
//       // expect(await zutomamoPFP.maxSupply()).to.equal(210);
//       // expect(await zutomamoPFP.mintCost()).to.equal(mintCost);
//       // expect(await zutomamoPFP.merkleRoot()).to.equal(merkleRoot);
//     });});
// });

// ↑↑↑


// import { keccak256 } from "@ethersproject/keccak256";
// import { MerkleTree } from "merkletreejs";
// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import { expect } from "chai";
// const ethers = require("hardhat").ethers;
// // import { Signer } from "ethers";
// // const { ethers } = require("hardhat");

// const baseURI = "https://zutomamogen.net/zutomamoPFP/json/"
// const WITHDRAW_ADDRESS = "0x376E2F69A4cF1E73A444055291F9b250166746a9";

// export const allowedAddressesLv1 = ['0x976EA74026E726554dB657fA54763abd0C3a0aa9', '0xe030EaDA1e2734356C4e170dCB8DA86B1F399482', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
//   .map(address => hre.ethers.getAddress(address))

// export const allowedAddressesLv2 = ['0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65']
//   .map(address => hre.ethers.getAddress(address))

// export const allowedAddressesLocal = ['0x4Df74Aa88c771a82121A8F15b69505Edd5Ff8Aad']
//   .map(address => hre.ethers.getAddress(address))

// type Node = {
//   address: string,
//   amount: number
// }
// const createTree = (allowList: Node[]) => {
// const leaves = allowList.map(node => hre.ethers.solidityKeccak256(['address', 'uint256'],
//   [node.address, node.amount]))
// return new MerkleTree(leaves, keccak256, { sortPairs: true })
// }

// describe("ZutomamoPFP", function () {

//   async function fixture() { 
//     // 1. テストに使うウォレットアドレスを作成する
//     const [owner, account, ...others] = await hre.ethers.getSigners()
//     // 2. ソースコードからスマートコントラクトを生成する
//     const getcontract = await hre.ethers.getContractFactory("zutomamoPFP")
//     // 3. スマートコントラクトをローカルネットワークにデプロイする
//     const myContract = await getcontract.connect(owner).deploy()

//     const [addr1, addr2, addr3, addr4] = others

//     // マークルツリー作成
//     const tree = createTree([ { address: addr1.address,amount:1},
//                               { address: addr2.address,amount:2},
//                               { address: addr3.address,amount:5},
//                               { address: addr4.address,amount:60}]);
//     // マークルルートセット
//     await myContract.connect(owner).setMerkleRoot(tree.getHexRoot());

//     // マークルツリー２作成
//     const tree2 = createTree([ { address: addr1.address,amount:10},
//                                { address: addr2.address,amount:20},
//                                { address: addr3.address,amount:30},
//                                { address: addr4.address,amount:40}]);
    
//     const getcontractminter = await hre.ethers.getContractFactory("externalMinter")
//     const minterContract = await getcontractminter.connect(owner).deploy()

//     const getcontracttokenuri = await hre.ethers.getContractFactory("testURI")
//     const tokenuriContract = await getcontracttokenuri.connect(owner).deploy()
  
//     return { myContract, owner, account, others, addr1, addr2, addr3, addr4, tree, tree2 }
//   }

//   describe("account test info display", function () {
//     it("account test", async function () {
//       const { myContract, owner, account, others,addr1, addr2, addr3, addr4,tree} = await loadFixture(fixture);

//       // test info---
//       console.log("owner address : %s", owner.address);
//       console.log("admin address : %s", account.address);
//       console.log("addr1 address : %s", addr1.address);
//       console.log("addr2 address : %s", addr2.address);
//       console.log("addr3 address : %s", addr3.address);
//       console.log("addr4 address : %s", addr4.address);
//     });
//   })});

// import { expect } from "chai";
// import { MerkleTree } from 'merkletreejs';
// import { keccak256 } from "@ethersproject/keccak256";
// const { ethers } = require("hardhat");

// const baseURI = "https://zutomamogen.net/zutomamoPFP/json/"
// const WITHDRAW_ADDRESS = "0x8C638E735Fe99F577d17290b2B7D682f0B165b98";

// export const allowedAddressesLv1 = ['0x976EA74026E726554dB657fA54763abd0C3a0aa9', '0xe030EaDA1e2734356C4e170dCB8DA86B1F399482', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
//   .map(address => hre.ethers.getAddress(address))

// export const allowedAddressesLv2 = ['0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65']
//   .map(address => hre.ethers.getAddress(address))

// export const allowedAddressesLocal = ['0x4Df74Aa88c771a82121A8F15b69505Edd5Ff8Aad']
//   .map(address => hre.ethers.getAddress(address))

// type Node = {
//   address: string,
//   amount: number
// }
// const createTree = (allowList: Node[]) => {
// const leaves = allowList.map(node => hre.ethers.solidityKeccak256(['address', 'uint256'],
//   [node.address, node.amount]))
// return new MerkleTree(leaves, keccak256, { sortPairs: true })
// }

// describe("zutomamoPFP", function () {
//   let zutomamoPFP: any;
//   // let owner: any;
//   const [owner, account, ...others] = hre.ethers.getSigners();
//   const [addr1, addr2, addr3, addr4] = others
//   let merkleTree: MerkleTree;
//   let merkleRoot: string;
//   let leafNodes: string[];
//   let allowedAmount: number = 20;
//   let mintCost: number = hre.ethers.parseEther("0.021");

//   before(async function () {
//     // [owner, addr1, addr2, addr3, addr4] = await hre.ethers.getSigners();

//   // マークルツリー作成
//   const tree = createTree([ { address: addr1.address,amount:1},
//     { address: addr2.address,amount:2},
//     { address: addr3.address,amount:5},
//     { address: addr4.address,amount:60}]);

//   // マークルルートセット
//   // await zutomamoPFP.connect(owner).setMerkleRoot(tree.getHexRoot());
//   merkleRoot = tree.getHexRoot();

//   // マークルツリー２作成
//   const tree2 = createTree([ { address: addr1.address,amount:10},
//             { address: addr2.address,amount:20},
//             { address: addr3.address,amount:30},
//             { address: addr4.address,amount:40}]);

//     // // Set up Merkle Tree for whitelisting
//     // const whitelistAddresses = [owner.address, addr1.address];
//     // leafNodes = whitelistAddresses.map((addr) => keccak256(hre.ethers.solidityKeccak256(['address', 'uint256'], [addr, allowedAmount])));
//     // merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
//     // merkleRoot = merkleTree.getHexRoot();
//   });

//   beforeEach(async function () {
//     const ZutomamoPFP = await hre.ethers.getContractFactory("zutomamoPFP");
//     // zutomamoPFP = await ZutomamoPFP.deploy();
//     const zutomamoPFP = await ZutomamoPFP.connect(owner).deploy()
//     // await zutomamoPFP.deployed();

//     // Set sales info
//     await zutomamoPFP.setSalesInfo(1, 210, mintCost, merkleRoot);
//     await zutomamoPFP.setBaseURI("https://zutomamogen.net/zutomamoPFP/json/");
//     await zutomamoPFP.setBaseExtension(".json");
//     await zutomamoPFP.unpause();
//   });

//   describe("Deployment", function () {
//     // it("Should set the right owner", async function () {
//     //   expect(await zutomamoPFP.hasRole(await zutomamoPFP.ADMIN(), owner.address)).to.equal(true);
//     // });

//     it("Should set the correct initial values", async function () {
//       expect(await zutomamoPFP.baseURI()).to.equal("https://zutomamogen.net/zutomamoPFP/json/");
//       // expect(await zutomamoPFP.baseExtension()).to.equal(".json");
//       // expect(await zutomamoPFP.maxSupply()).to.equal(210);
//       // expect(await zutomamoPFP.mintCost()).to.equal(mintCost);
//       // expect(await zutomamoPFP.merkleRoot()).to.equal(merkleRoot);
//     });
//   });

//   describe("Minting", function () {
//     it("Should mint tokens correctly with valid proof", async function () {
//       const proof = merkleTree.getHexProof(leafNodes[0]);

//       await zutomamoPFP.connect(owner).claim(2, allowedAmount, proof, { value: mintCost * 2 });
//       expect(await zutomamoPFP.balanceOf(owner.address)).to.equal(2);
//     });

//     it("Should not mint tokens with invalid proof", async function () {
//       const proof = merkleTree.getHexProof(keccak256(addr2.address));

//       await expect(
//         zutomamoPFP.connect(addr2).claim(2, allowedAmount, proof, { value: mintCost * 2 })
//       ).to.be.revertedWith("Invalid proof");
//     });

//     it("Should not mint tokens exceeding max supply", async function () {
//       const proof = merkleTree.getHexProof(leafNodes[0]);

//       await expect(
//         zutomamoPFP.connect(owner).claim(211, allowedAmount, proof, { value: mintCost * 211 })
//       ).to.be.revertedWith("Over Max Supply");
//     });

//     it("Should not mint tokens exceeding allowed amount per address", async function () {
//       const proof = merkleTree.getHexProof(leafNodes[0]);

//       await zutomamoPFP.connect(owner).claim(allowedAmount, allowedAmount, proof, { value: mintCost * allowedAmount });

//       await expect(
//         zutomamoPFP.connect(owner).claim(1, allowedAmount, proof, { value: mintCost })
//       ).to.be.revertedWith("Over Max Amount Per Address");
//     });
//   });

//   describe("Airdrop", function () {
//     it("Should airdrop tokens correctly", async function () {
//       await zutomamoPFP.airdrop([addr1.address, addr2.address], [2, 3]);
//       expect(await zutomamoPFP.balanceOf(addr1.address)).to.equal(2);
//       expect(await zutomamoPFP.balanceOf(addr2.address)).to.equal(3);
//     });
//   });

//   describe("Token URI", function () {
//     it("Should return correct token URI based on stage", async function () {
//       const proof = merkleTree.getHexProof(leafNodes[0]);
//       await zutomamoPFP.connect(owner).claim(1, allowedAmount, proof, { value: mintCost });

//       const tokenId = 1;
//       const stage = "working-adult";
//       await zutomamoPFP.setStageTimestamp("workingAdult", Math.floor(Date.now() / 1000));

//       expect(await zutomamoPFP.tokenURI(tokenId)).to.equal(`ipfs://baseURI/${tokenId}/working-adult.json`);
//     });
//   });

//   describe("Stage Management", function () {
//     it("Should allow admin to set individual stage", async function () {
//       const proof = merkleTree.getHexProof(leafNodes[0]);
//       await zutomamoPFP.connect(owner).claim(1, allowedAmount, proof, { value: mintCost });

//       const tokenId = 1;
//       await zutomamoPFP.setIndividualStage(tokenId, "custom-stage");

//       expect(await zutomamoPFP.tokenURI(tokenId)).to.equal(`ipfs://baseURI/${tokenId}/custom-stage.json`);
//     });

//     it("Should allow admin to batch set individual stage", async function () {
//       await zutomamoPFP.airdrop([owner.address], [3]);

//       await zutomamoPFP.batchSetIndividualStage(1, 3, "custom-stage");

//       for (let tokenId = 1; tokenId <= 3; tokenId++) {
//         expect(await zutomamoPFP.tokenURI(tokenId)).to.equal(`ipfs://baseURI/${tokenId}/custom-stage.json`);
//       }
//     });
//   });

//   describe("Pausable", function () {
//     it("Should not allow minting when paused", async function () {
//       await zutomamoPFP.pause();
//       const proof = merkleTree.getHexProof(leafNodes[0]);

//       await expect(
//         zutomamoPFP.connect(owner).claim(1, allowedAmount, proof, { value: mintCost })
//       ).to.be.revertedWith("Pausable: paused");
//     });
//   });

//   describe("Withdraw", function () {
//     it("Should allow admin to withdraw funds", async function () {
//       const proof = merkleTree.getHexProof(leafNodes[0]);
//       await zutomamoPFP.connect(owner).claim(1, allowedAmount, proof, { value: mintCost });

//       const initialBalance = await hre.ethers.provider.getBalance(owner.address);

//       await zutomamoPFP.withdraw();

//       const finalBalance = await hre.ethers.provider.getBalance(owner.address);
//       expect(finalBalance).to.be.above(initialBalance);
//     });
//   });
// });
