#!/usr/bin/env node

/**
 * 检查合约状态和作品数据
 * 验证NFT铸造失败的具体原因
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 合约状态检查\n');

const contracts = {
  nftManager: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_NFT_MANAGER,
  creationManager: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION,
};

const userAddress = '0xCCeb173b742CbeF5337baFaE9FA34E8fC79B7a97';
const workId = 1;

console.log('📋 检查目标:');
console.log(`用户地址: ${userAddress}`);
console.log(`作品ID: ${workId}`);
console.log(`NFT Manager: ${contracts.nftManager}`);
console.log(`Creation Manager: ${contracts.creationManager}`);

console.log('\n🔍 需要验证的问题:');

const checksToPerform = [
  {
    check: '作品是否存在',
    method: 'CreationManager.getWork(1)',
    expected: '返回作品数据，exists=true',
    critical: true
  },
  {
    check: '创作者权限',
    method: '检查作品的creator_address',
    expected: `creator_address === ${userAddress}`,
    critical: true
  },
  {
    check: 'NFT铸造状态',
    method: 'NFTManager.isWorkNFTMinted(1)',
    expected: 'false (未铸造)',
    critical: true
  },
  {
    check: '合约权限设置',
    method: 'NFTManager.getCreationManager()',
    expected: `返回 ${contracts.creationManager}`,
    critical: true
  },
  {
    check: '合约部署状态',
    method: '检查合约代码',
    expected: '合约已正确部署',
    critical: false
  }
];

checksToPerform.forEach((item, index) => {
  const priority = item.critical ? '🔥 关键' : '⚠️ 重要';
  console.log(`\n${index + 1}. ${priority} ${item.check}`);
  console.log(`   方法: ${item.method}`);
  console.log(`   期望: ${item.expected}`);
});

console.log('\n🛠️ 手动检查步骤:');

console.log('\n步骤1: 检查作品是否存在');
console.log('方法A - 通过应用界面:');
console.log('  1. 访问应用主页');
console.log('  2. 查看作品列表');
console.log('  3. 确认是否有workId=1的作品');

console.log('\n方法B - 通过区块链浏览器:');
console.log(`  1. 访问: https://sepolia.etherscan.io/address/${contracts.creationManager}`);
console.log('  2. 点击"Contract"标签');
console.log('  3. 点击"Read Contract"');
console.log('  4. 找到"getWork"函数');
console.log('  5. 输入workId: 1');
console.log('  6. 点击"Query"查看结果');

console.log('\n步骤2: 验证创作者权限');
console.log('检查要点:');
console.log(`  - 作品的creator_address应该是: ${userAddress}`);
console.log('  - 确保使用正确的MetaMask账户');
console.log('  - 检查账户地址大小写是否匹配');

console.log('\n步骤3: 检查NFT铸造状态');
console.log(`访问: https://sepolia.etherscan.io/address/${contracts.nftManager}`);
console.log('调用: isWorkNFTMinted(1)');
console.log('期望结果: false');

console.log('\n步骤4: 验证合约权限');
console.log(`访问: https://sepolia.etherscan.io/address/${contracts.nftManager}`);
console.log('调用: getCreationManager()');
console.log(`期望结果: ${contracts.creationManager}`);

console.log('\n🚨 常见问题和解决方案:');

const commonIssues = [
  {
    issue: '作品不存在 (workId=1)',
    cause: '作品未成功注册到区块链',
    solution: [
      '重新上传作品',
      '确保区块链交易成功',
      '检查CreationManager合约状态'
    ]
  },
  {
    issue: '权限验证失败',
    cause: '使用了错误的钱包账户',
    solution: [
      '切换到作品创作者账户',
      '检查MetaMask当前账户',
      '确认账户地址匹配'
    ]
  },
  {
    issue: 'NFT已铸造',
    cause: '该作品已经铸造过NFT',
    solution: [
      '尝试铸造其他作品',
      '创建新的测试作品',
      '检查NFT状态显示'
    ]
  },
  {
    issue: '合约权限未设置',
    cause: 'NFTManager未正确配置',
    solution: [
      '重新部署合约',
      '调用setCreationManager',
      '验证合约初始化'
    ]
  }
];

commonIssues.forEach((item, index) => {
  console.log(`\n${index + 1}. 问题: ${item.issue}`);
  console.log(`   原因: ${item.cause}`);
  console.log('   解决方案:');
  item.solution.forEach(sol => console.log(`   - ${sol}`));
});

console.log('\n🎯 推荐的调试顺序:');

const debugOrder = [
  '1. 首先检查作品是否存在 (最可能的问题)',
  '2. 验证使用正确的钱包账户',
  '3. 检查NFT是否已经铸造过',
  '4. 验证合约权限设置',
  '5. 如果都正常，检查Gas设置'
];

debugOrder.forEach(step => console.log(step));

console.log('\n💡 快速测试建议:');
console.log('1. 创建一个新的测试作品');
console.log('2. 确保使用相同的钱包账户');
console.log('3. 立即尝试铸造NFT');
console.log('4. 观察是否出现相同错误');

console.log('\n🔗 有用的链接:');
console.log(`NFT Manager合约: https://sepolia.etherscan.io/address/${contracts.nftManager}`);
console.log(`Creation Manager合约: https://sepolia.etherscan.io/address/${contracts.creationManager}`);
console.log(`用户地址: https://sepolia.etherscan.io/address/${userAddress}`);

console.log('\n✅ 检查完成！请按照上述步骤逐一验证。');