#!/usr/bin/env node

/**
 * WhichWitch NFT铸造问题诊断脚本
 * 检查所有可能导致NFT铸造失败的原因
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 WhichWitch NFT铸造问题诊断\n');

// 1. 检查环境变量配置
console.log('📋 1. 环境变量检查:');
const requiredEnvVars = [
  'NEXT_PUBLIC_CONTRACT_ADDRESS_NFT_MANAGER',
  'NEXT_PUBLIC_CONTRACT_ADDRESS_NFT_MARKETPLACE', 
  'NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION',
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_RPC_URL'
];

let configValid = true;
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`❌ ${envVar}: 未配置`);
    configValid = false;
  }
});

if (!configValid) {
  console.log('\n❌ 环境变量配置不完整！');
}

// 2. 检查合约地址格式
console.log('\n📍 2. 合约地址格式检查:');
const nftManagerAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_NFT_MANAGER;
const creationManagerAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION;

if (nftManagerAddress) {
  if (nftManagerAddress.startsWith('0x') && nftManagerAddress.length === 42) {
    console.log('✅ NFT Manager地址格式正确');
  } else {
    console.log('❌ NFT Manager地址格式错误');
  }
} else {
  console.log('❌ NFT Manager地址未配置');
}

if (creationManagerAddress) {
  if (creationManagerAddress.startsWith('0x') && creationManagerAddress.length === 42) {
    console.log('✅ Creation Manager地址格式正确');
  } else {
    console.log('❌ Creation Manager地址格式错误');
  }
} else {
  console.log('❌ Creation Manager地址未配置');
}

// 3. 检查网络配置
console.log('\n🌐 3. 网络配置检查:');
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

console.log(`Chain ID: ${chainId}`);
console.log(`RPC URL: ${rpcUrl}`);

if (chainId === '11155111') {
  console.log('✅ 使用Sepolia测试网');
} else {
  console.log('⚠️ 非Sepolia测试网，请确认网络正确');
}

// 4. 常见问题诊断
console.log('\n🚨 4. 常见NFT铸造失败原因:');

const commonIssues = [
  {
    issue: '合约未正确部署',
    description: 'NFT Manager合约地址无效或未部署',
    solution: '重新部署合约或检查合约地址'
  },
  {
    issue: '合约权限问题',
    description: 'NFT Manager未设置Creation Manager地址',
    solution: '调用setCreationManager函数设置正确地址'
  },
  {
    issue: '作品不存在',
    description: '尝试为不存在的workId铸造NFT',
    solution: '确保作品已在Creation Manager中注册'
  },
  {
    issue: '权限验证失败',
    description: '调用者不是作品的创作者',
    solution: '确保使用作品创作者的钱包地址'
  },
  {
    issue: 'NFT已铸造',
    description: '该作品已经铸造过NFT',
    solution: '检查isWorkNFTMinted函数返回值'
  },
  {
    issue: 'Gas费不足',
    description: '钱包余额不足支付交易费用',
    solution: '确保钱包有足够的Sepolia ETH'
  },
  {
    issue: 'RPC连接问题',
    description: 'RPC节点连接失败或响应慢',
    solution: '检查网络连接或更换RPC节点'
  },
  {
    issue: 'ABI不匹配',
    description: '合约ABI与实际部署的合约不匹配',
    solution: '确保使用正确的合约ABI'
  }
];

commonIssues.forEach((item, index) => {
  console.log(`\n${index + 1}. ❌ ${item.issue}`);
  console.log(`   问题: ${item.description}`);
  console.log(`   解决: ${item.solution}`);
});

// 5. 调试步骤建议
console.log('\n🔧 5. 调试步骤建议:');

const debugSteps = [
  '检查浏览器控制台错误信息',
  '确认MetaMask连接到Sepolia测试网',
  '验证钱包地址有足够的Sepolia ETH',
  '检查作品是否已在区块链上注册',
  '验证NFT Manager合约是否正确部署',
  '检查合约之间的权限设置',
  '使用区块链浏览器验证合约状态',
  '测试合约的只读函数调用',
  '检查交易是否被正确发送',
  '查看交易失败的具体原因'
];

debugSteps.forEach((step, index) => {
  console.log(`${index + 1}. ${step}`);
});

// 6. 测试建议
console.log('\n🧪 6. 测试建议:');

console.log('A. 基础连接测试:');
console.log('   - 在浏览器控制台运行: window.ethereum.request({method: "eth_chainId"})');
console.log('   - 确认返回值为 "0xaa36a7" (Sepolia)');

console.log('\nB. 合约调用测试:');
console.log('   - 先调用只读函数测试连接');
console.log('   - 例如: isWorkNFTMinted(workId)');

console.log('\nC. 权限测试:');
console.log('   - 确认当前钱包地址是作品创作者');
console.log('   - 检查作品的creator_address字段');

console.log('\nD. 交易测试:');
console.log('   - 先发送简单交易测试网络');
console.log('   - 检查Gas估算是否正确');

// 7. 合约验证命令
console.log('\n⛓️ 7. 合约验证命令:');

if (nftManagerAddress) {
  console.log('在区块链浏览器中验证合约:');
  console.log(`https://sepolia.etherscan.io/address/${nftManagerAddress}`);
  
  console.log('\n检查合约是否验证:');
  console.log(`curl "https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${nftManagerAddress}"`);
}

// 8. 紧急修复建议
console.log('\n🚑 8. 紧急修复建议:');

console.log('如果问题持续存在:');
console.log('1. 重新部署NFT合约');
console.log('2. 更新环境变量中的合约地址');
console.log('3. 重新配置合约之间的关系');
console.log('4. 清除浏览器缓存和MetaMask缓存');
console.log('5. 尝试使用不同的RPC节点');

// 9. 联系信息
console.log('\n📞 9. 获取帮助:');
console.log('如需进一步帮助，请提供:');
console.log('- 完整的错误信息');
console.log('- 交易哈希（如果有）');
console.log('- 使用的钱包地址');
console.log('- 尝试铸造的作品ID');
console.log('- 浏览器控制台截图');

console.log('\n🎯 诊断完成！请根据上述检查结果排查问题。');