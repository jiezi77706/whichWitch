#!/usr/bin/env node

/**
 * 快速NFT测试验证脚本
 * 检查所有必要的配置和环境
 */

require('dotenv').config({ path: '.env.local' });

console.log('🚀 WhichWitch NFT铸造快速测试\n');

// 测试配置
const testConfig = {
  requiredEnvVars: [
    'NEXT_PUBLIC_CONTRACT_ADDRESS_NFT_MANAGER',
    'NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION', 
    'NEXT_PUBLIC_CHAIN_ID',
    'NEXT_PUBLIC_RPC_URL',
    'PINATA_JWT'
  ],
  expectedChainId: '11155111',
  expectedNetwork: 'sepolia'
};

console.log('📋 配置检查:');

// 1. 环境变量检查
let configScore = 0;
const totalChecks = testConfig.requiredEnvVars.length;

testConfig.requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: 已配置`);
    configScore++;
  } else {
    console.log(`❌ ${envVar}: 未配置`);
  }
});

console.log(`\n配置完整度: ${configScore}/${totalChecks} (${Math.round(configScore/totalChecks*100)}%)`);

// 2. 网络配置检查
console.log('\n🌐 网络配置:');
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

if (chainId === testConfig.expectedChainId) {
  console.log('✅ Chain ID: 正确 (Sepolia)');
} else {
  console.log(`❌ Chain ID: 错误 (当前: ${chainId}, 期望: ${testConfig.expectedChainId})`);
}

if (rpcUrl && rpcUrl.includes('sepolia')) {
  console.log('✅ RPC URL: 正确 (Sepolia)');
} else {
  console.log(`❌ RPC URL: 可能错误 (${rpcUrl})`);
}

// 3. 合约地址检查
console.log('\n📍 合约地址:');
const contracts = {
  'NFT Manager': process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_NFT_MANAGER,
  'Creation Manager': process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION,
};

Object.entries(contracts).forEach(([name, address]) => {
  if (address && address.startsWith('0x') && address.length === 42) {
    console.log(`✅ ${name}: ${address}`);
  } else {
    console.log(`❌ ${name}: 地址格式错误或未配置`);
  }
});

// 4. IPFS配置检查
console.log('\n📁 IPFS配置:');
const pinataJWT = process.env.PINATA_JWT;
if (pinataJWT && pinataJWT.startsWith('eyJ')) {
  console.log('✅ Pinata JWT: 已配置');
} else {
  console.log('❌ Pinata JWT: 未配置或格式错误');
}

// 5. 测试步骤指南
console.log('\n🧪 测试步骤:');
const testSteps = [
  '1. 启动开发服务器: npm run dev',
  '2. 打开浏览器访问应用',
  '3. 连接MetaMask钱包',
  '4. 检查网络状态指示器',
  '5. 如需要，点击切换到Sepolia测试网',
  '6. 确认钱包有足够的Sepolia ETH',
  '7. 上传作品并开启NFT铸造选项',
  '8. 确认交易并等待完成',
  '9. 验证NFT铸造成功'
];

testSteps.forEach(step => console.log(step));

// 6. 常见问题快速解决
console.log('\n🔧 常见问题快速解决:');

const quickFixes = [
  {
    problem: 'MetaMask显示主网',
    solution: '点击页面上的"切换到Sepolia测试网"按钮'
  },
  {
    problem: '没有测试ETH',
    solution: '访问 https://sepoliafaucet.com/ 获取免费测试ETH'
  },
  {
    problem: '交易失败',
    solution: '检查Gas费设置，确保钱包余额充足'
  },
  {
    problem: 'NFT铸造失败',
    solution: '确认是作品创作者且作品未铸造过NFT'
  }
];

quickFixes.forEach((fix, index) => {
  console.log(`${index + 1}. 问题: ${fix.problem}`);
  console.log(`   解决: ${fix.solution}\n`);
});

// 7. 验证链接
console.log('🔗 验证链接:');
const nftManager = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_NFT_MANAGER;
if (nftManager) {
  console.log(`合约验证: https://sepolia.etherscan.io/address/${nftManager}`);
}
console.log('获取测试ETH: https://sepoliafaucet.com/');
console.log('区块链浏览器: https://sepolia.etherscan.io/');

// 8. 成功标准
console.log('\n🎯 测试成功标准:');
const successCriteria = [
  '✅ 钱包连接到Sepolia测试网',
  '✅ 网络状态显示正确',
  '✅ 图片成功上传到IPFS',
  '✅ 作品注册到区块链',
  '✅ NFT铸造交易确认',
  '✅ 在区块链浏览器中可查看NFT',
  '✅ 应用显示NFT状态'
];

successCriteria.forEach(criteria => console.log(criteria));

// 9. 总体评估
console.log('\n📊 总体评估:');
if (configScore === totalChecks) {
  console.log('🎉 配置完整！可以开始测试NFT铸造功能');
  console.log('💡 建议: 确保MetaMask连接到Sepolia测试网并有足够余额');
} else {
  console.log('⚠️ 配置不完整，请先完成环境变量配置');
  console.log('📝 检查 .env.local 文件中的缺失项');
}

console.log('\n🚀 准备就绪！开始你的NFT铸造测试之旅！');