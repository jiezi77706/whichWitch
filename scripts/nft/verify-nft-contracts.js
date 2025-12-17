#!/usr/bin/env node

/**
 * 验证NFT合约部署状态
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 验证NFT合约部署状态\n');

const contracts = {
  'NFT Manager': process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_NFT_MANAGER,
  'NFT Marketplace': process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_NFT_MARKETPLACE,
  'Creation Manager': process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION,
  'Royalty Manager': process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ROYALTY_MANAGER,
};

console.log('📋 合约地址列表:');
Object.entries(contracts).forEach(([name, address]) => {
  console.log(`${name}: ${address}`);
});

console.log('\n🌐 区块链浏览器链接:');
Object.entries(contracts).forEach(([name, address]) => {
  if (address) {
    console.log(`${name}: https://sepolia.etherscan.io/address/${address}`);
  }
});

console.log('\n🔧 可能的问题和解决方案:');

const issues = [
  {
    problem: '合约地址返回空代码',
    causes: [
      '合约未部署到该地址',
      '部署失败但地址被记录',
      '网络不匹配（部署到其他网络）'
    ],
    solutions: [
      '重新部署合约',
      '检查部署交易状态',
      '确认部署到正确网络'
    ]
  },
  {
    problem: 'NFT铸造交易失败',
    causes: [
      'NFT Manager未设置Creation Manager地址',
      '作品ID不存在',
      '调用者不是作品创作者',
      'NFT已经铸造过'
    ],
    solutions: [
      '调用setCreationManager设置正确地址',
      '确保作品已注册到区块链',
      '使用作品创作者钱包',
      '检查NFT铸造状态'
    ]
  },
  {
    problem: '权限验证失败',
    causes: [
      '合约间权限未正确设置',
      'Creation Manager地址错误',
      '合约初始化不完整'
    ],
    solutions: [
      '重新配置合约权限',
      '验证所有合约地址',
      '完成合约初始化流程'
    ]
  }
];

issues.forEach((issue, index) => {
  console.log(`\n${index + 1}. 问题: ${issue.problem}`);
  console.log('   可能原因:');
  issue.causes.forEach(cause => console.log(`   - ${cause}`));
  console.log('   解决方案:');
  issue.solutions.forEach(solution => console.log(`   - ${solution}`));
});

console.log('\n🚀 快速修复步骤:');
console.log('1. 检查所有合约是否正确部署');
console.log('2. 验证合约间权限设置');
console.log('3. 测试基础合约功能');
console.log('4. 如果问题持续，重新部署整个合约系统');

console.log('\n💡 建议的测试顺序:');
console.log('1. 先测试Creation Manager的基础功能');
console.log('2. 确保作品可以正常注册');
console.log('3. 验证NFT Manager可以读取作品信息');
console.log('4. 最后测试NFT铸造功能');

console.log('\n📞 如果需要重新部署:');
console.log('运行: npx hardhat run src/contracts/deploy/deploy.js --network sepolia');
console.log('然后更新 .env.local 中的合约地址');

console.log('\n✅ 验证完成！请根据上述信息排查问题。');