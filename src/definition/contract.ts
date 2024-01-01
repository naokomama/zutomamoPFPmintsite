// チェーンID
export const CHAIN_ID = {
  MAINNET : 1,
  GOERLI  : 5,
  POLYGON : 137,
  SEPOLIA : 11155111,
}

// 規格
export const STANDARD = {
  ERC721  : 'erc721',
  ERC1155 : 'erc1155',
}

// コントラクトアドレス
export const FACTORY_CONTRACT_ADDRESS = {
  MAINNET_ERC721  : '',
  MAINNET_ERC1155 : '0x9B18566174416349D179135f52f9f026278edEF9',
  POLYGON_ERC721  : '',
  POLYGON_ERC1155 : '',
  SEPOLIA_ERC721  : '',
  SEPOLIA_ERC1155 : '0x96AcFBE52E8dB8826857A6732D781Ad11521B174',
  GOERLI_ERC721   : '',
  GOERLI_ERC1155  : '0x66B2C27355ec1911FC944d55B2E36c80A59bc369',
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
  ERC721: [],
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