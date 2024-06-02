import { keccak256 } from "@ethersproject/keccak256";
import { MerkleTree } from "merkletreejs";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
const { solidity } = require('ethereum-waffle')
const chai = require('chai');
chai.use(solidity);
// import { ethers } from "ethers";
import { Signer } from "ethers";

// import { ethers } from "ethers";
const { ethers } = require("hardhat");

const baseURI = "https://zutomamogen.net/zutomamoPFP/json/"
const WITHDRAW_ADDRESS = "0x376E2F69A4cF1E73A444055291F9b250166746a9";

export const allowedAddressesLv1 = ['0x976EA74026E726554dB657fA54763abd0C3a0aa9', '0xe030EaDA1e2734356C4e170dCB8DA86B1F399482', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
  .map(address => ethers.getAddress(address))

export const allowedAddressesLv2 = ['0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65']
  .map(address => ethers.getAddress(address))

export const allowedAddressesLocal = ['0x4Df74Aa88c771a82121A8F15b69505Edd5Ff8Aad']
  .map(address => ethers.getAddress(address))

type Node = {
  address: string,
  amount: number
}
const createTree = (allowList: Node[]) => {
const leaves = allowList.map(node => ethers.solidityKeccak256(['address', 'uint256'],
  [node.address, node.amount]))
return new MerkleTree(leaves, keccak256, { sortPairs: true })
}

describe("ZutomamoPFP", function () {

  async function fixture() { 
    // 1. テストに使うウォレットアドレスを作成する
    const [owner, account, ...others] = await ethers.getSigners()
    // 2. ソースコードからスマートコントラクトを生成する
    const getcontract = await ethers.getContractFactory("ZutomamoPFP")
    // 3. スマートコントラクトをローカルネットワークにデプロイする
    const myContract = await getcontract.connect(owner).deploy()

    const [addr1, addr2, addr3, addr4] = others

    // マークルツリー作成
    const tree = createTree([ { address: addr1.address,amount:1},
                              { address: addr2.address,amount:2},
                              { address: addr3.address,amount:5},
                              { address: addr4.address,amount:60}]);
    // マークルルートセット
    await myContract.connect(owner).setMerkleRoot(tree.getHexRoot());

    // マークルツリー２作成
    const tree2 = createTree([ { address: addr1.address,amount:10},
                               { address: addr2.address,amount:20},
                               { address: addr3.address,amount:30},
                               { address: addr4.address,amount:40}]);
    
    const getcontractminter = await ethers.getContractFactory("externalMinter")
    const minterContract = await getcontractminter.connect(owner).deploy()

    const getcontracttokenuri = await ethers.getContractFactory("testURI")
    const tokenuriContract = await getcontracttokenuri.connect(owner).deploy()
  
    const ContractAllowList = await ethers.getContractFactory("ContractAllowList")
    // Contian owner for test
    const contractAllowList = await ContractAllowList.deploy([owner.getAddress(), owner.getAddress()])
    const contractAllowListcontract = await contractAllowList.deployed()

    for (const allowed of allowedAddressesLv1) {
      await contractAllowList.connect(owner).addAllowed(allowed, 1);
    }
  
    for (const allowed of allowedAddressesLv2) {
      await contractAllowList.connect(owner).addAllowed(allowed, 2);
    }

    await contractAllowList.connect(owner).addAllowed(owner.address, 1)

    expect(await contractAllowList.connect(account).getAllowedList(1)).to.deep.equals(allowedAddressesLv1)
    expect(await contractAllowList.connect(account).getAllowedList(2)).to.deep.equals(allowedAddressesLv2)

    return { myContract, minterContract, tokenuriContract, contractAllowListcontract, owner, account, others, addr1, addr2, addr3, addr4, tree, tree2 }
  }

  describe("account test info display", function () {
    it("account test", async function () {
      const { myContract, owner, account, others,addr1, addr2, addr3, addr4,tree} = await loadFixture(fixture);

      // test info---
      console.log("owner address : %s", owner.address);
      console.log("admin address : %s", account.address);
      console.log("addr1 address : %s", addr1.address);
      console.log("addr2 address : %s", addr2.address);
      console.log("addr3 address : %s", addr3.address);
      console.log("addr4 address : %s", addr4.address);
    });
  });

  describe("deploy", function () {
    it("デプロイ時にオーナーのもとにミントされること / 最大供給数を参照できること / 0がミントされていること", async function () {
      const { myContract, owner } = await loadFixture(fixture)

      expect(await myContract.balanceOf(owner.address)).to.equals(1)
      expect(await myContract.maxSupply()).to.equals(10000)

      await expect(myContract.ownerOf(0)).not.to.be.reverted;
    })
  })

  describe("callerIsUser", function () {
    it("呼び元がコントラクトの場合エラーとなること", async function () {
      const { myContract, minterContract, owner, addr1, tree } = await loadFixture(fixture)

      // errmintを呼ぶコントラクトアドレスを設定する
      await expect(minterContract.connect(owner).setNFTCollection(myContract.address))

      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr1.address,1]));

      // 外部コントラクトからmintできないこと
      await expect(minterContract.connect(owner).errmint(proof)).to.be.revertedWith("The caller is another contract.")
    })
  })

  describe("Mint", function () {
    it("コントラクトがポーズ状態の場合、ミントできないこと", async function () {
      const { myContract, owner, addr1, tree} = await loadFixture(fixture);

      // ポーズフラグON
      await myContract.connect(owner).setPause(true);

      // addr1のマークルリーフ作成
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr1.address,1]));
      
      // コントラクトが停止していて、ミントできないこと
      await expect(myContract.connect(addr1).mint(1,1,proof, 0)).to.be.revertedWith("the contract is paused");
    });

    it("ミントサイトから入力されたミント数量が0の場合ミントできないこと", async function () {
      const { myContract, owner, account, others,addr1, addr2, addr3, addr4,tree } = await loadFixture(fixture);

      // ポーズフラグOFF
      await myContract.connect(owner).setPause(false);

      // addr1のマークルリーフ作成
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr1.address,1]));

      // 0枚でミント
      await expect(myContract.connect(addr1).mint(0,1,proof,0)).to.be.revertedWith("need to mint at least 1 NFT")

    });

    it("今回ミント数量は「アドレスごとの最大ミント許可数ー前回ミント済み数」以下であること", async function() {
      const { myContract, owner, account, others,addr1, addr2, addr3, addr4,tree } = await loadFixture(fixture);
      
      // ポーズフラグOFF
      await myContract.connect(owner).setPause(false);

      // addr1にAL1枚付与
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr1.address,1]));
      // AL1の人は1ミントできること
      await expect(myContract.connect(addr1).mint(1,1,proof,0)).not.to.be.reverted;
      // addr1の枚数は1枚であること
      expect(await myContract.balanceOf(addr1.address)).to.equals(1);

      // AL1の人は2枚目はエラーになってミントできないこと
      await expect(myContract.connect(addr1).mint(1,1,proof,0)).to.be.revertedWith("max NFT per address exceeded")
      
      // addr2にAL2枚付与
      proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr2.address,2]));

      // AL2の人は2ミントできること
      await expect(myContract.connect(addr2).mint(2,2,proof,0)).not.to.be.reverted;
      // addr2の枚数は2枚であること
      expect(await myContract.balanceOf(addr2.address)).to.equals(2);
      // AL2の人は3枚目はエラーになってミントできないこと
      await expect(myContract.connect(addr2).mint(1,2,proof,0)).to.be.revertedWith("max NFT per address exceeded")

      // addr3にAL5枚付与
      proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr3.address,5]));
      // AL5の人は5ミントできること
      await expect(myContract.connect(addr3).mint(5,5,proof,0)).not.to.be.reverted;
      // addr3の枚数は5枚であること
      expect(await myContract.balanceOf(addr3.address)).to.equals(5);
      // AL5の人は6枚目はエラーになってミントできないこと
      await expect(myContract.connect(addr3).mint(1,5,proof,0)).to.be.revertedWith("max NFT per address exceeded")

      let totalSupply = await myContract.connect(owner).totalSupply();
      // console.log("totalSupply : %s", totalSupply);
    });

    it("コスト✕ミント数量より手持ちのETHが多いこと", async function () {
      const { myContract, owner, addr2, tree} = await loadFixture(fixture);

      let Address2Balance = await  addr2.getBalance()

      // ポーズフラグOFF
      await myContract.connect(owner).setPause(false);
      // コストをセットする
      await myContract.connect(owner).setCost(ethers.parseEther("0.001"));

      // addr2にAL2枚付与
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr2.address,2]));

      // 0.002ないので、エラーとなってミントできない
      await expect(myContract.connect(addr2).mint(2,2,proof,0, { value: ethers.parseEther("0.0019") })).to.be.revertedWith("insufficient funds")

      Address2Balance = await  addr2.getBalance()

      // ミントできていないので0枚
      expect(await myContract.balanceOf(addr2.address)).to.equals(0);

      // Valueを増やす
      await expect(myContract.connect(addr2).mint(2,2,proof,0, { value: ethers.parseEther("0.002") })).not.to.be.reverted;

      // ミントできたので2枚
      expect(await myContract.balanceOf(addr2.address)).to.equals(2);
    });

    it("バー忍モードのミント", async function () {

      const { myContract, owner, addr1, addr2, tree, tree2} = await loadFixture(fixture)

      // ポーズフラグOFF
      await myContract.connect(owner).setPause(false);

      // addr1にAL1枚付与
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr1.address,1]));

      // addr1で1枚ミント
      await expect(myContract.connect(addr1).mint(1,1,proof,0)).not.to.be.reverted;

      // addr2にAL2枚付与
      proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr2.address,2]));

      // addr2で2枚ミント
      await expect(myContract.connect(addr2).mint(2,2,proof,0)).not.to.be.reverted;

      // バー忍モードON
      await myContract.connect(owner).setBurnAndMintMode(true);

      // セールIDセット
      await myContract.connect(owner).setSaleId(1);

      // マークルルートセット
      await myContract.connect(owner).setMerkleRoot(tree2.getHexRoot());

      // addr1にAL10枚付与
      proof = tree2.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr1.address,10]));

      // 枚数が1ではないので、エラーとなってバー忍できない
      await expect(myContract.connect(addr1).mint(2,10,proof,1)).to.be.revertedWith("The number of mints is over")

      // addr2にAL20枚付与
      proof = tree2.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr2.address,20]));
      
      // addr2はトークンID2～3のミントなので、バー忍できない
      await expect(myContract.connect(addr2).mint(1,20,proof,1)).to.be.revertedWith("Owner is different")

      expect(await myContract.ownerOf(2)).to.equals(addr2.address);
      expect(await myContract.ownerOf(3)).to.equals(addr2.address);

      // addr2はトークンID2はバー忍できる
      await expect(myContract.connect(addr2).mint(1,20,proof,2)).not.to.be.reverted;

      // addr2でトークンID4が所持されていること
      expect(await myContract.ownerOf(4)).to.equals(addr2.address);

      // トークンID2がバーンされていること
      await expect(myContract.ownerOf(2)).to.be.revertedWith("ERC721Psi: owner query for nonexistent token");
    })

  });

  describe("airdrop", function () {
    it("エアドロロールがある人がエアドロできること", async function () {
      const { myContract, owner, addr1, addr4 } = await loadFixture(fixture)

      // addr1はロールがないので、エアドロできないこと
      await expect(myContract.connect(addr1).airdrop([addr1.address, addr4.address],[2, 5])).to.be.revertedWith("Caller is not a air dropper")

      // addr1にADMINロール付与
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // addr1はロールが付与されたので、エアドロできること
      await expect(myContract.connect(addr1).airdrop([addr1.address, addr4.address],[2, 5])).not.to.be.reverted

      // addr1所持トークンID確認
      expect(await myContract.ownerOf(1)).to.equals(addr1.address);
      expect(await myContract.ownerOf(2)).to.equals(addr1.address);

      // addr4所持トークンID確認
      expect(await myContract.ownerOf(3)).to.equals(addr4.address);
      expect(await myContract.ownerOf(4)).to.equals(addr4.address);
      expect(await myContract.ownerOf(5)).to.equals(addr4.address);
      expect(await myContract.ownerOf(6)).to.equals(addr4.address);
      expect(await myContract.ownerOf(7)).to.equals(addr4.address);

      // 所持数確認
      expect(await myContract.balanceOf(addr1.address)).to.equals(2)
      expect(await myContract.balanceOf(addr4.address)).to.equals(5)

    })

    it("エアドロの引数が異なる場合エラーとなること", async function () {

      const { myContract, owner, addr1, addr4 } = await loadFixture(fixture)
      await expect(myContract.connect(owner).airdrop([addr1.address, addr4.address],[2, 5, 6])).to.be.revertedWith("Array lengths are different")

    })
    
    it("エアドロの引数の枚数に0が混ざっていたらエラーとなること", async function () {

      const { myContract, owner, addr1, addr4 } = await loadFixture(fixture)
      await expect(myContract.connect(owner).airdrop([owner.address, addr1.address, addr4.address],[2, 1, 0])).to.be.revertedWith("need to mint at least 1 NFT")

    })

    it("エアドロの引数の枚数が最大供給数を超えたらエラーとなること", async function () {

      const { myContract, owner, addr1, addr4 } = await loadFixture(fixture)
      await expect(myContract.connect(owner).airdrop([owner.address, addr1.address, addr4.address],[4999, 5001, 1])).to.be.revertedWith("max NFT limit exceeded")

    })

    it("エアドロの引数がぴったり最大供給数の場合、正常に処理されること", async function () {

      const { myContract, owner, addr1, addr4 } = await loadFixture(fixture)
      await expect(myContract.connect(owner).airdrop([owner.address, addr1.address, addr4.address],[4999, 5000, 1])).not.to.be.reverted;

      expect(await myContract.ownerOf(9999)).to.equals(addr1.address);
      expect(await myContract.ownerOf(10000)).to.equals(addr4.address);

    })
  })

  describe("externalMint", function () {
    it("ミンターロールがないコントラクトは外部Mintできないこと", async function () {
      const { myContract, minterContract, owner, addr2 } = await loadFixture(fixture)

      // externalMintを呼ぶコントラクトアドレスを設定する
      await expect(minterContract.connect(owner).setNFTCollection(myContract.address))

      // ミンターロールがない人はMintできないこと
      await expect(minterContract.connect(owner).mint()).to.be.revertedWith("Caller is not a minter")
    })

    it("ミンターロールのあるコントラクトは外部Mintできること", async function () {
      const { myContract, minterContract, owner, addr2, addr4, tree } = await loadFixture(fixture)

      // externalMintを呼ぶコントラクトアドレスを設定する
      await expect(minterContract.connect(owner).setNFTCollection(myContract.address))

      let totalSupply = await myContract.connect(owner).totalSupply();
      expect(totalSupply).to.equals(1)

      // minterContractにミンターロール付与
      const roleBytes = ethers.toUtf8Bytes("MINTER_ROLE");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, minterContract.address);

      // addr2で1枚ミントできること
      await expect(minterContract.connect(addr2).mint()).not.to.be.reverted;
      expect(await myContract.ownerOf(1)).to.equals(addr2.address);

      totalSupply = await myContract.connect(owner).totalSupply();

      // 1枚ミントできていること
      expect(totalSupply).to.equals(2)
    })
  })

  describe("externalBurn", function () {
    it("ホルダーならburnできること", async function () {
      const { myContract, owner, addr2, addr4, tree } = await loadFixture(fixture)

      let totalSupply = await myContract.connect(owner).totalSupply();
      // console.log("totalSupply : %s", totalSupply);

      // ポーズフラグOFF
      await myContract.connect(owner).setPause(false);

      // addr2にAL2枚付与
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr2.address,2]));

      // AL2の人は2ミントできること
      await expect(myContract.connect(addr2).mint(2,2,proof,0)).not.to.be.reverted;

      // addr4にAL60枚付与
      proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr4.address,60]));
      await expect(myContract.connect(addr4).mint(60,60,proof,0)).not.to.be.reverted;

      // ロールがないのでエラーになってバーンできないこと
      await expect(myContract.connect(addr4).externalBurn([2, 58, 59])).to.be.revertedWith("Caller is not a burner")

      // addr4にバーンロール付与
      const roleBytes = ethers.toUtf8Bytes("BURNER_ROLE");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr4.address);

      // ホルダー以外のものはバーンできないこと(1と2はaddr2のミント分)
      await expect(myContract.connect(addr4).externalBurn([1, 2])).to.be.revertedWith("Owner is different")

      // バーン対象分が所持されていることを確認
      expect(await myContract.ownerOf(3)).to.equals(addr4.address);
      expect(await myContract.ownerOf(58)).to.equals(addr4.address);
      expect(await myContract.ownerOf(59)).to.equals(addr4.address);
      
      // ホルダー分バーンできること
      await expect(myContract.connect(addr4).externalBurn([3, 58, 59])).not.to.be.reverted
      expect(await myContract.balanceOf(addr4.address)).to.equals(57)

      // バーン対象分がバーンされていることを確認
      await expect(myContract.ownerOf(3)).to.be.revertedWith("ERC721Psi: owner query for nonexistent token");
      await expect(myContract.ownerOf(58)).to.be.revertedWith("ERC721Psi: owner query for nonexistent token");
      await expect(myContract.ownerOf(59)).to.be.revertedWith("ERC721Psi: owner query for nonexistent token");

      totalSupply = await myContract.connect(owner).totalSupply();

      // addr2の2枚とaddr4の60枚、バーン3枚で60枚
      expect(totalSupply).to.equals(60)
    })
    
  })

  describe("withdraw", function () {
    it("売り上げを引き出せること", async function () {
      const { myContract, owner, addr1, addr2, tree} = await loadFixture(fixture)

      // ポーズフラグOFF
      await myContract.connect(owner).setPause(false);
      // コストをセットする
      await myContract.connect(owner).setCost(ethers.parseEther("0.001"));

      // addr1にAL1枚付与
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr1.address,1]));
      await expect(myContract.connect(addr1).mint(1,1,proof,0, { value: ethers.parseEther("0.001") })).not.to.be.reverted;

      // addr2にAL2枚付与
      proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr2.address,2]));
      await expect(myContract.connect(addr2).mint(2,2,proof,0, { value: ethers.parseEther("0.002") })).not.to.be.reverted;

      const withdrawAddress = ethers.getAddress(WITHDRAW_ADDRESS);

      // 引き出し前の指定アドレスの残高を取得
      const beforeBalance = await ethers.provider.getBalance(withdrawAddress);
      const beforeBalance1 = await ethers.provider.getBalance(addr1.address);

      // ADMINロール以外のアドレスで引き出せないこと
      await expect(myContract.connect(addr1).withdraw()).to.be.reverted

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // addr1で一次売上を引き出しできること
      await expect(myContract.connect(addr1).withdraw()).not.to.be.reverted

      // 引き出し後の指定アドレスの残高を取得
      const afterBalance = await ethers.provider.getBalance(withdrawAddress);
      const afterBalance1 = await ethers.provider.getBalance(addr1.address);
      
      // 一次売上金0.003ETHが指定アドレスで取得できること
      expect(afterBalance.sub(beforeBalance)).to.equals(ethers.parseEther("0.003"))

      // addr1の残高はガス代分減っていること
      // console.log("beforeBalance1 : %s", beforeBalance1);
      // console.log("afterBalance1 : %s", afterBalance1);
      expect(beforeBalance.sub(afterBalance)).to.be.lt(0)
      
    })
  })

  describe("set関数：onlyRole(ADMIN)確認", () => {
    it("setRoyaltyFee", async function () {
      const { myContract, owner, addr1 } = await loadFixture(fixture);

      await expect(
        myContract.connect(addr1).setRoyaltyFee(300)
        ).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      await myContract.connect(addr1).setRoyaltyFee(300);
      const checkvalue = await myContract.royaltyFee();
      expect(checkvalue).to.equal(300);
    });

    it("setRoyaltyAddress", async function () {
      const { myContract, owner, addr1 } = await loadFixture(fixture);

      let checkaddress = await myContract.royaltyAddress();
      // console.log("変更前checkaddress : %s", checkaddress);

      await expect(
        myContract.connect(addr1).setRoyaltyAddress(addr1.address)
        ).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      await myContract.connect(addr1).setRoyaltyAddress(addr1.address);
      checkaddress = await myContract.royaltyAddress();
      // console.log("変更後checkaddress : %s", checkaddress);

      expect(checkaddress).to.equal(addr1.address);
    });

    it("setBurnAndMintMode", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、バー忍モードONできないこと
      await expect(myContract.connect(addr1).setBurnAndMintMode(true)).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればバー忍モードON/OFFできること
      await expect(myContract.connect(addr1).setBurnAndMintMode(true)).not.to.be.reverted;

      let check = await myContract.burnAndMintMode();
      expect(check).to.equal(true);

      await expect(myContract.connect(addr1).setBurnAndMintMode(false)).not.to.be.reverted;
      check = await myContract.burnAndMintMode();
      expect(check).to.equal(false);
    })

    it("setMerkleRoot", async () => {
      const { myContract, owner, addr1, tree} = await loadFixture(fixture)

      // ADMINロールがない場合、マークルルートがセットできないこと
      await expect(myContract.connect(addr1).setMerkleRoot(tree.getHexRoot())).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればマークルルートがセットできること
      await expect(myContract.connect(addr1).setMerkleRoot(tree.getHexRoot())).not.to.be.reverted;

      let check = await myContract.merkleRoot();
      expect(check).to.equal(tree.getHexRoot());

    })

    it("setPause", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、ポーズONできないこと
      await expect(myContract.connect(addr1).setPause(true)).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればポーズON/OFFできること
      await expect(myContract.connect(addr1).setPause(true)).not.to.be.reverted;

      let check = await myContract.paused();
      expect(check).to.equal(true);

      await expect(myContract.connect(addr1).setPause(false)).not.to.be.reverted;
      check = await myContract.paused();
      expect(check).to.equal(false);
    })

    it("setSaleId", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、SaleIdの変更ができないこと
      await expect(myContract.connect(addr1).setSaleId(1)).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればSaleIdの変更ができること
      await expect(myContract.connect(addr1).setSaleId(1)).not.to.be.reverted;

      let check = await myContract.saleId();
      expect(check).to.equal(1);

      await expect(myContract.connect(addr1).setSaleId(2)).not.to.be.reverted;
      check = await myContract.saleId();
      expect(check).to.equal(2);
    })

    it("setMaxSupply", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、maxSupplyの変更ができないこと
      await expect(myContract.connect(addr1).setMaxSupply(9999)).to.be.reverted;

      let check = await myContract.maxSupply();
      expect(check).to.equal(10000);

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればmaxSupplyの変更ができること
      await expect(myContract.connect(addr1).setMaxSupply(9999)).not.to.be.reverted;

      check = await myContract.maxSupply();
      expect(check).to.equal(9999);

      await expect(myContract.connect(addr1).setMaxSupply(20000)).not.to.be.reverted;
      check = await myContract.maxSupply();
      expect(check).to.equal(20000);
    })

    it("setCost", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、Costの変更ができないこと
      await expect(myContract.connect(addr1).setCost(ethers.parseEther("0.001"))).to.be.reverted;

      let check = await myContract.cost();
      expect(check).to.equal(0);

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればCostの変更ができること
      await expect(myContract.connect(addr1).setCost(ethers.parseEther("0.001"))).not.to.be.reverted;

      check = await myContract.cost();
      expect(check).to.equal(ethers.parseEther("0.001"));

      await expect(myContract.connect(addr1).setCost(ethers.parseEther("0.005"))).not.to.be.reverted;
      check = await myContract.cost();
      expect(check).to.equal(ethers.parseEther("0.005"));
    })

    it("setMaxMintAmountPerTransaction", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、maxMintAmountPerTransactionの変更ができないこと
      await expect(myContract.connect(addr1).setMaxMintAmountPerTransaction(300)).to.be.reverted;

      let check = await myContract.maxMintAmountPerTransaction();
      expect(check).to.equal(60);

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればmaxMintAmountPerTransactionの変更ができること
      await expect(myContract.connect(addr1).setMaxMintAmountPerTransaction(300)).not.to.be.reverted;

      check = await myContract.maxMintAmountPerTransaction();
      expect(check).to.equal(300);

      await expect(myContract.connect(addr1).setMaxMintAmountPerTransaction(10)).not.to.be.reverted;
      check = await myContract.maxMintAmountPerTransaction();
      expect(check).to.equal(10);
    })

    it("setBaseURI", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)
      const BASE_URI1 = "https://cnpbaby.s3.ap-northeast-1.amazonaws.com/cnpbaby-json/"
      const BASE_URI2 = "https://cnpbaby.com/cnpbaby-json/"

      // ADMINロールがない場合、BaseURIが変更できないこと
      await expect(myContract.connect(addr1).setBaseURI(BASE_URI1)).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればBaseURIが変更できること
      await expect(myContract.connect(addr1).setBaseURI(BASE_URI1)).not.to.be.reverted;

      let check = await myContract.baseURI();
      expect(check).to.equal(BASE_URI1);

      await expect(myContract.connect(addr1).setBaseURI(BASE_URI2)).not.to.be.reverted;
      check = await myContract.baseURI();
      expect(check).to.equal(BASE_URI2);
    })

    it("setBaseExtension", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)
      const baseExtension1 = ".csv"
      const baseExtension2 = ".json"

      // ADMINロールがない場合、BaseExtensionが変更できないこと
      await expect(myContract.connect(addr1).setBaseExtension(baseExtension1)).to.be.reverted;

      let check = await myContract.baseExtension();
      expect(check).to.equal(baseExtension2);

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればBaseExtensionが変更できること
      await expect(myContract.connect(addr1).setBaseExtension(baseExtension1)).not.to.be.reverted;

      check = await myContract.baseExtension();
      expect(check).to.equal(baseExtension1);

      await expect(myContract.connect(addr1).setBaseExtension(baseExtension2)).not.to.be.reverted;
      check = await myContract.baseExtension();
      expect(check).to.equal(baseExtension2);
    })

    it("setInterfaceOfTokenURI", async () => {
      const { myContract, tokenuriContract, owner, addr1} = await loadFixture(fixture)
      const BASE_URI1 = "https://cnpbaby.amazon.com/json/"

      await expect(myContract.connect(owner).setBaseURI(BASE_URI1)).not.to.be.reverted;
      await expect(myContract.connect(owner).airdrop([owner.address],[1])).not.to.be.reverted;

      // ADMINロールがない場合、tokenuriが変更できないこと
      await expect(myContract.connect(addr1).setInterfaceOfTokenURI(tokenuriContract.address)).to.be.reverted;

      let tokenURI = await myContract.connect(owner).tokenURI(1).then((uri: string) => uri)
      // console.log("tokenURI : %s", tokenURI);

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればtokenuriが変更できること
      await expect(myContract.connect(addr1).setInterfaceOfTokenURI(tokenuriContract.address)).not.to.be.reverted;

      tokenURI = await myContract.connect(owner).tokenURI(1).then((uri: string) => uri)
      // console.log("tokenURI2 : %s", tokenURI);

      await expect( myContract.connect(owner).setUseInterfaceMetadata(true)).not.to.be.reverted;

      tokenURI = await tokenuriContract.connect(owner).tokenURI(1);
      // console.log("tokenURI3 : %s", tokenURI);

    })

    it("setUseInterfaceMetadata", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、BaseExtensionが変更できないこと
      await expect(myContract.connect(addr1).setUseInterfaceMetadata(true)).to.be.reverted;

      let check = await myContract.useInterfaceMetadata();
      expect(check).to.equal(false);

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればBaseExtensionが変更できること
      await expect(myContract.connect(addr1).setUseInterfaceMetadata(true)).not.to.be.reverted;

      check = await myContract.useInterfaceMetadata();
      expect(check).to.equal(true);

      await expect(myContract.connect(addr1).setUseInterfaceMetadata(false)).not.to.be.reverted;
      check = await myContract.useInterfaceMetadata();
      expect(check).to.equal(false);
    })

    it("addLocalContractAllowList", async () => {
      const { myContract, minterContract, owner, addr1} = await loadFixture(fixture)
  
      // ADMINロールがない場合、addLocalContractAllowListの変更ができないこと
      await expect(myContract.connect(addr1).addLocalContractAllowList(minterContract.address)).to.be.reverted;
  
      let check = await myContract.getLocalContractAllowList();
      expect(check[0]).not.to.equal(minterContract.address);
  
      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);
  
      // ADMINロールがあればmaxMintAmountPerTransactionの変更ができること
      await expect(myContract.connect(addr1).addLocalContractAllowList(minterContract.address)).not.to.be.reverted;
  
      check = await myContract.getLocalContractAllowList();
      expect(check[0]).to.equal(minterContract.address);
  
    })

    it("removeLocalContractAllowList", async () => {
      const { myContract, minterContract, owner, addr1} = await loadFixture(fixture)
  
      await expect(myContract.connect(owner).addLocalContractAllowList(minterContract.address)).not.to.be.reverted;
  
      // ADMINロールがない場合、removeLocalContractAllowListができないこと
      await expect(myContract.connect(addr1).removeLocalContractAllowList(minterContract.address)).to.be.reverted;
  
      let check = await myContract.getLocalContractAllowList();
      expect(check[0]).to.equal(minterContract.address);
  
      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);
  
      // ADMINロールがあればremoveLocalContractAllowListができること
      await expect(myContract.connect(addr1).removeLocalContractAllowList(minterContract.address)).not.to.be.reverted;
  
      check = await myContract.getLocalContractAllowList();
      expect(check[0]).not.to.equal(minterContract.address);
  
    })

    it("setCAL", async () => {
      const { myContract, contractAllowListcontract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、setCALが変更できないこと
      await expect(myContract.connect(addr1).setCAL(contractAllowListcontract.address)).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればsetCALが変更できること
      await expect(myContract.connect(addr1).setCAL(contractAllowListcontract.address)).not.to.be.reverted;

    })

    it("setCALLevel", async () => {
      const { myContract, contractAllowListcontract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、setCALLevelが変更できないこと
      await expect(myContract.connect(addr1).setCALLevel(2)).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればsetCALLevelが変更できること
      await expect(myContract.connect(addr1).setCALLevel(2)).not.to.be.reverted;

    })

    it("setEnableRestrict", async () => {
      const { myContract, contractAllowListcontract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、setEnableRestrictが変更できないこと
      await expect(myContract.connect(addr1).setEnableRestrict(true)).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあればsetEnableRestrictが変更できること
      await expect(myContract.connect(addr1).setEnableRestrict(true)).not.to.be.reverted;

    })

    it("setDefaultRoyalty", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがなくても、setDefaultRoyaltyが変更できないこと
      await expect(myContract.connect(addr1).setDefaultRoyalty(addr1.address, 1000)).to.be.reverted;

      // addr1にADMINロールをセット
      const roleBytes = ethers.toUtf8Bytes("ADMIN");
      const roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあってもsetDefaultRoyaltyが変更できないこと
      await expect(myContract.connect(addr1).setDefaultRoyalty(addr1.address, 1000)).to.be.reverted;

      // OWNERは変更できること
      await expect(myContract.connect(owner).setDefaultRoyalty(addr1.address, 1000)).not.to.be.reverted;

    })

    it("grantRole", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // ADMINロールがない場合、grantRoleが変更できないこと

      // addr1にADMINロールをセット
      let roleBytes = ethers.toUtf8Bytes("ADMIN");
      let roleHash = ethers.keccak256(roleBytes);
      await expect(myContract.connect(addr1).grantRole(roleHash, addr1.address)).to.be.reverted;

      // OWNERは変更できること
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      // ADMINロールがあってもgrantRoleが変更できないこと
      roleBytes = ethers.toUtf8Bytes("AIRDROP_ROLE");
      roleHash = ethers.keccak256(roleBytes);
      await expect(myContract.connect(addr1).grantRole(roleHash, addr1.address)).to.be.reverted;
    })

    it("revokeRole", async () => {
      const { myContract, owner, addr1} = await loadFixture(fixture)

      // addr1にADMINロールをセット
      let roleBytes = ethers.toUtf8Bytes("ADMIN");
      let roleHash = ethers.keccak256(roleBytes);
      await myContract.connect(owner).grantRole(roleHash, addr1.address);

      await expect(myContract.connect(addr1).setPause(true)).not.to.be.reverted;

      // ADMINロールがあってもrevokeRoleできないこと
      await expect(myContract.connect(addr1).revokeRole(roleHash, addr1.address)).to.be.reverted;
      // addr1のADMINロールが解除されること
      await expect(myContract.connect(owner).revokeRole(roleHash, addr1.address)).not.to.be.reverted;

      await expect(myContract.connect(addr1).setPause(false)).to.be.reverted;

      let check = await myContract.paused();
      expect(check).to.equal(true);
    })
    
  })

  describe("取得関数確認", () => {
    it("getUserMintedAmountBySaleId / getUserMintedAmount", async function () {
      const { myContract, owner, addr1, addr2, addr3, tree, tree2} = await loadFixture(fixture)

      // ポーズフラグOFF
      await myContract.connect(owner).setPause(false);

      // addr1にAL1枚付与
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr1.address,1]));
      // AL1の人は1ミントできること
      await expect(myContract.connect(addr1).mint(1,1,proof,0)).not.to.be.reverted;

      // addr3にAL5枚付与
      proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr3.address,5]));
      await expect(myContract.connect(addr3).mint(5,5,proof,0)).not.to.be.reverted;

      // セールID:0のgetUserMintedAmount取得値確認
      expect(await myContract.connect(addr1).getUserMintedAmount(addr1.address)).to.equal(1);
      expect(await myContract.connect(addr1).getUserMintedAmount(addr2.address)).to.equal(0);
      expect(await myContract.connect(addr1).getUserMintedAmount(addr3.address)).to.equal(5);

      // セールIDセット
      await myContract.connect(owner).setSaleId(1);

      // マークルルートセット
      await myContract.connect(owner).setMerkleRoot(tree2.getHexRoot());

      // addr1にAL10枚付与
      proof = tree2.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr1.address,10]));
      await expect(myContract.connect(addr1).mint(10,10,proof,1)).not.to.be.reverted;

      // addr2にAL20枚付与
      proof = tree2.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr2.address,20]));
      await expect(myContract.connect(addr2).mint(20,20,proof,1)).not.to.be.reverted;

      // セールID:1のgetUserMintedAmount取得値確認
      expect(await myContract.connect(addr1).getUserMintedAmount(addr1.address)).to.equal(10);
      expect(await myContract.connect(addr1).getUserMintedAmount(addr2.address)).to.equal(20);
      expect(await myContract.connect(addr1).getUserMintedAmount(addr3.address)).to.equal(0);

      // getUserMintedAmountBySaleIdの取得値確認
      expect(await myContract.connect(addr1).getUserMintedAmountBySaleId(0, addr1.address)).to.equal(1);
      expect(await myContract.connect(addr1).getUserMintedAmountBySaleId(1, addr1.address)).to.equal(10);
      expect(await myContract.connect(addr1).getUserMintedAmountBySaleId(0, addr2.address)).to.equal(0);
      expect(await myContract.connect(addr1).getUserMintedAmountBySaleId(1, addr2.address)).to.equal(20);
      expect(await myContract.connect(addr1).getUserMintedAmountBySaleId(0, addr3.address)).to.equal(5);
      expect(await myContract.connect(addr1).getUserMintedAmountBySaleId(1, addr3.address)).to.equal(0);
    })
    
  })

  describe("approve / safeTransferFrom / transferFrom", () => {
    it("approve / safeTransferFrom / transferFrom", async function () {
      const { myContract, contractAllowListcontract, owner, addr1, addr2, addr3, addr4} = await loadFixture(fixture)

      const addresses = [addr1,addr2,addr3,addr4] 

      for (let i = 0; i < addresses.length; i++) {
        await myContract.connect(owner).airdrop([addresses[i].address], [2500])  
      }

      await myContract.connect(owner).setCAL(contractAllowListcontract.address);
      await myContract.connect(owner).setCALLevel(1);  //level 0は全拒否

      for (let j = 0; j < 5; j++) {
        // ランダムなIDを生成
        const tokenId = Math.floor(Math.random() * 10000) + 1;
        // console.log("tokenId: %s" , tokenId)
        let owneraddress = await myContract.connect(owner).ownerOf(tokenId)

        // 2つのアドレスをランダムに選択
        let fromAddress = addresses.find((address) => address.address === owneraddress) || addresses[0];
        let toAddress = addresses[Math.floor(Math.random() * addresses.length)];

        // 同じアドレス同士であれば、もう一度選択し直す
        while (fromAddress.address === toAddress.address) {
          toAddress = addresses[Math.floor(Math.random() * addresses.length)];
        }

        // console.log("owneraddress: %s" , owneraddress)
        // console.log("fromAddress: %s" , fromAddress.address)
        // console.log("toAddress: %s" , toAddress.address)

        // トランスファー実行
        expect(await myContract.connect(fromAddress).approve(allowedAddressesLv1[0], tokenId)).not.to.be.reverted;
        expect(await myContract.connect(fromAddress)["safeTransferFrom(address,address,uint256)"](fromAddress.address, toAddress.address, tokenId)).not.to.be.reverted;
        expect(await myContract.connect(owner).ownerOf(tokenId)).to.equals(toAddress.address);

        expect(await myContract.connect(toAddress)["transferFrom(address,address,uint256)"](toAddress.address, fromAddress.address, tokenId)).not.to.be.reverted;
        expect(await myContract.connect(owner).ownerOf(tokenId)).to.equals(fromAddress.address);
      }
    })
      
  })
  describe("setApprovalForAll", () => {

    it("指定レベルの認可対象は成功すること", async () => {
      const { myContract, contractAllowListcontract, owner, addr1, addr4 } = await loadFixture(fixture)

      await myContract.connect(owner).setCAL(contractAllowListcontract.address);
      await expect(myContract.connect(owner).airdrop([owner.address, addr1.address, addr4.address],[4999, 5000, 1])).not.to.be.reverted;
      await myContract.connect(owner).setCALLevel(1);  //level 0は全拒否

      await expect(myContract.connect(addr1).setApprovalForAll(allowedAddressesLv1[0], true))
        .not.to.be.reverted

      await expect(myContract.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr1.address, owner.address, 5001)).not.to.be.reverted

      // ownerのアドレスでsetApprovalForAllをONにして、ownerがaddr1のNFTをownerへ送る→OK
      await expect(myContract.connect(addr1).setApprovalForAll(allowedAddressesLv1[2], true))
        .not.to.be.reverted

      await expect(myContract.connect(owner)["safeTransferFrom(address,address,uint256)"](addr1.address, owner.address, 6000)).not.to.be.reverted

      // setApprovalForAllをOFFにするとエラーになる
      await expect(myContract.connect(addr1).setApprovalForAll(allowedAddressesLv1[2], false))
        .not.to.be.reverted

      await expect(myContract.connect(owner)["safeTransferFrom(address,address,uint256)"](addr1.address, owner.address, 7000)).to.be.reverted
    })

    it("全レベルの認可対象外は失敗すること", async () => {
      const { myContract, contractAllowListcontract, owner, addr1, addr4 } = await loadFixture(fixture)

      await myContract.connect(owner).setCAL(contractAllowListcontract.address);
      await expect(myContract.connect(owner).airdrop([owner.address, addr1.address, addr4.address],[4999, 5000, 1])).not.to.be.reverted;
      await myContract.connect(owner).setCALLevel(1);  //level 0は全拒否
      
      await expect(myContract.connect(addr1).setApprovalForAll(addr1.address, true))
        .to.be.reverted
    })

    it("指定レベルに含まない認可対象外は失敗すること", async () => {
      const { myContract, contractAllowListcontract, owner, addr1, addr4 } = await loadFixture(fixture)

      await myContract.connect(owner).setCAL(contractAllowListcontract.address);
      await expect(myContract.connect(owner).airdrop([owner.address, addr1.address, addr4.address],[4999, 5000, 1])).not.to.be.reverted;
      await myContract.connect(owner).setCALLevel(1);  //level 0は全拒否
      
      await expect(myContract.connect(addr1).setApprovalForAll(allowedAddressesLv2[0], true))
        .to.be.reverted
    })

    it("指定レベルをあげれば成功すること", async () => {
      const { myContract, contractAllowListcontract, owner, addr1, addr4 } = await loadFixture(fixture)

      await myContract.connect(owner).setCAL(contractAllowListcontract.address);
      await expect(myContract.connect(owner).airdrop([owner.address, addr1.address, addr4.address],[4999, 5000, 1])).not.to.be.reverted;
      await myContract.connect(owner).setCALLevel(2);
      
      await expect(myContract.connect(owner).setApprovalForAll(allowedAddressesLv2[0], true))
        .not.to.be.reverted

      await expect(myContract.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr1.address, owner.address, 5002)).not.to.be.reverted
    })
  })

  describe("supportsInterfaces", () => {
    it("AccessControl", async () => {
      const { myContract } = await loadFixture(fixture)
      expect(await myContract.supportsInterface("0x7965db0b")).to.be.true
    })

    it("ERC721RestrictApprove", async () => {
      const { myContract } = await loadFixture(fixture)
      expect(await myContract.supportsInterface("0x5b5e139f")).to.be.true
    })

    it("ERC2981", async () => {
      const { myContract } = await loadFixture(fixture)
      expect(await myContract.supportsInterface("0x2a55205a")).to.be.true
    })
  })

  describe("追加テスト", () => {
    it("トークンID10000のオーナーは最後にミントした人になっていること", async () => {
      const { myContract, owner, addr1, addr2, addr3, addr4, tree} = await loadFixture(fixture)

      await expect(myContract.connect(owner).airdrop([owner.address, addr1.address, addr4.address],[4999, 4994, 1])).not.to.be.reverted;

      // ポーズフラグOFF
      await myContract.connect(owner).setPause(false);

      // addr3にAL5枚付与
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr3.address,5]));
      // AL5の人は5ミントできること
      await expect(myContract.connect(addr3).mint(5,5,proof,0)).not.to.be.reverted;
      
      expect(await myContract.ownerOf(9995)).to.equals(addr3.address);
      expect(await myContract.ownerOf(9996)).to.equals(addr3.address);
      expect(await myContract.ownerOf(9997)).to.equals(addr3.address);
      expect(await myContract.ownerOf(9998)).to.equals(addr3.address);
      expect(await myContract.ownerOf(9999)).to.equals(addr3.address);

      // addr2にAL2枚付与
      proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr2.address,2]));
      // 10000枚目はミントできること
      await expect(myContract.connect(addr2).mint(1,2,proof,0)).not.to.be.reverted;

      let totalSupply = await myContract.connect(owner).totalSupply();
      // console.log("totalSupply : %s", totalSupply);

      expect(await myContract.ownerOf(10000)).to.equals(addr2.address);

      // 10001枚目はミントできないこと
      await expect(myContract.connect(addr2).mint(1,2,proof,0)).to.be.revertedWith("max NFT limit exceeded")

      // 10001枚目は存在しないこと
      await expect(myContract.ownerOf(10001)).to.be.revertedWith("ERC721Psi: owner query for nonexistent token");

      totalSupply = await myContract.connect(owner).totalSupply();
      // console.log("totalSupply2 : %s", totalSupply);
    })

    it("setBaseURIして、意図通りのURIが返却されること", async () => {
      const { myContract, owner, addr1, addr2, addr3, addr4, tree} = await loadFixture(fixture)

      // ポーズフラグOFF
      await myContract.connect(owner).setPause(false);

      // addr2にAL2枚付与
      let proof = tree.getHexProof(ethers.solidityKeccak256(
        ['address','uint256'], [addr2.address,2]));

      await expect(myContract.connect(addr2).mint(2,2,proof,0)).not.to.be.reverted;
      await expect(myContract.connect(owner).setBaseURI(baseURI)).not.to.be.reverted;

      let tokenURI = await myContract.connect(owner).tokenURI(2).then((uri: string) => uri)
      // console.log("tokenURI: %s", tokenURI);

      // 正しいURIが設定されていること
      expect(tokenURI).to.equal(baseURI + "2.json");
    })
  })
});
