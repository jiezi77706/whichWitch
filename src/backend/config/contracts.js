// 智能合约配置 (CommonJS)
const CONTRACTS = {
  // ZetaChain 测试网配置
  7001: {
    name: 'ZetaChain Testnet',
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    blockExplorer: 'https://zetachain-athens-3.blockscout.com',
    nativeCurrency: {
      name: 'ZETA',
      symbol: 'ZETA',
      decimals: 18
    },
    contracts: {
      PaymentManager: '0xE2FC71225F9681418C2bF41ED64Fc9CBfe7b737c',
      CreationManager: '0x944b55A957d63970506E1733fA5ccD4342d19FC8',
      NFTManager: '0x8C46877629FeA27ced23345Ab8E9EeCb4c302C0c',
      NFTMarketplace: '0x8A4664807daFa6017Aa1dE55bf974E9515c6eFb1',
      ZetaChainBridge: '0x47190893b0bD6316eeA4c29833CC829AF7024827',
      AuthorizationManager: '0x5988C2aF3eB0D6504feF8C00Ed948AA9c3f339F8'
    }
  },
  
  // 本地开发网络
  1337: {
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      PaymentManager: process.env.PAYMENT_MANAGER_ADDRESS || '',
      CreationManager: process.env.CREATION_MANAGER_ADDRESS || '',
      NFTManager: process.env.NFT_MANAGER_ADDRESS || '',
      NFTMarketplace: process.env.MARKETPLACE_ADDRESS || '',
      ZetaChainBridge: process.env.ZETA_BRIDGE_ADDRESS || '',
      AuthorizationManager: process.env.AUTHORIZATION_MANAGER_ADDRESS || ''
    }
  }
};

// 获取当前网络配置
function getNetworkConfig(chainId = 7001) {
  return CONTRACTS[chainId] || CONTRACTS[7001];
}

// 获取合约地址
function getContractAddress(contractName, chainId = 7001) {
  const config = getNetworkConfig(chainId);
  return config.contracts[contractName];
}

// 获取所有合约地址
function getAllContractAddresses(chainId = 7001) {
  const config = getNetworkConfig(chainId);
  return config.contracts;
}

// 验证合约地址
function isValidContractAddress(address) {
  return address && address !== '0x0000000000000000000000000000000000000000' && address.length === 42;
}

module.exports = {
  CONTRACTS,
  getNetworkConfig,
  getContractAddress,
  getAllContractAddresses,
  isValidContractAddress
};