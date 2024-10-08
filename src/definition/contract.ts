// チェーンID
export const CHAIN_ID = {
  MAINNET : 1,
  GOERLI  : 5,
  POLYGON : 137,
  BASE    : 8453,
  SEPOLIA : 84532,
}

// 規格
export const STANDARD = {
  ERC721  : 'erc721',
  ERC1155 : 'erc1155',
}

// コントラクトアドレス
export const FACTORY_CONTRACT_ADDRESS = {
  MAINNET_ERC721  : '',
  MAINNET_ERC1155 : '',
  POLYGON_ERC721  : '',
  POLYGON_ERC1155 : '',
  // BASE_ERC721     : '0xF03D53a588db1A268ddec939cdCe58253D53c8bB',
  // BASE_ERC721     : '0x8EFb74264010b71567d80384CCd3eDd1e2Cd440e',
  BASE_ERC721     : '0xA5d5E0E738E216aA9879e939aC882c3e79bC8294',
  BASE_ERC1155 : '',
  SEPOLIA_ERC721  : '0x5548480aeee674041Fada7e1eF0E2D62b9cD18a8',
  SEPOLIA_ERC1155 : '',
  GOERLI_ERC721   : '',
  GOERLI_ERC1155  : '',
}

// ABI
export const FACTORY_ABI = {
  ERC721  : [
  ],
  ERC1155 : [
    // createWithSystemRoyalty
    {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"bool","name":"_isLocked","type":"bool"},{"internalType":"uint96","name":"_royaltyFee","type":"uint96"},{"internalType":"address","name":"_withdrawAddress","type":"address"}],"name":"createWithSystemRoyalty","outputs":[],"stateMutability":"nonpayable","type":"function"},
    // Created
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"symbol","type":"string"},{"indexed":false,"internalType":"bool","name":"isLocked","type":"bool"},{"indexed":false,"internalType":"uint96","name":"royaltyFee","type":"uint96"},{"indexed":false,"internalType":"address","name":"withdrawAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"systemRoyalty","type":"uint256"},{"indexed":false,"internalType":"address","name":"royaltyReceiver","type":"address"}],"name":"Created","type":"event"},
  ],
}


export const MAIN_ABI = {
  ERC721: [
    // paused
    {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    // baseURI
    {"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    // baseExtension
    {"inputs":[],"name":"baseExtension","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    // maxSupply
    {"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    // totalSupply
    // {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"result","type":"uint256"}],"stateMutability":"view","type":"function"},
    // mintedAmountBySales
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"mintedAmountBySales","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    // mintCost
    {"inputs":[],"name":"mintCost","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    // claim
    // {"inputs":[{"internalType":"address","name":"_address","type":"address"},{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"}
    {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_allowedAmount","type":"uint256"},{"internalType":"bytes32[]","name":"_merkleProof","type":"bytes32[]"}],"name":"claim","outputs":[],"stateMutability":"payable","type":"function"},
  ],
  ERC1155: [
    // paused
    {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    // baseURI
    {"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    // baseExtension
    {"inputs":[],"name":"baseExtension","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    // maxSupply
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"maxSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    // totalSupply
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    // mintCost
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mintCosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    // setMetadataBase
    {"inputs":[{"internalType":"string","name":"_baseURI","type":"string"},{"internalType":"string","name":"_baseExtension","type":"string"}],"name":"setMetadataBase","outputs":[],"stateMutability":"nonpayable","type":"function"},
    // setTokenInfo
    {"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"uint256","name":"_mintCost","type":"uint256"},{"internalType":"uint256","name":"_maxSupply","type":"uint256"}],"name":"setTokenInfo","outputs":[],"stateMutability":"nonpayable","type":"function"},
    // mint
    {"inputs":[{"internalType":"address","name":"_address","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},
  ]
}