#!/usr/bin/env node

/**
 * NFT铸造交易失败诊断脚本
 * 分析具体的交易失败原因
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 NFT铸造交易失败诊断\n');

// 解析交易数据
const transactionData = {
  data: "0x70614ac5000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d65477464486a344a6f316e4b715a453961733663435070517355457533615952426b5571646e333963334b670000000000000000000000",
  from: "0xCCeb173b742CbeF5337baFaE9FA34E8fC79B7a97",
  to: "0x81d1392c22ece656774e161f831003015b8a0019",
  chainId: "0xaa36a7",
  nonce: "0x9"
};

console.log('📋 交易信息解析:');
console.log(`发送者: ${transactionData.from}`);
console.log(`接收者: ${transactionData.to}`);
console.log(`网络: Sepolia (${transactionData.chainId})`);
console.log(`Nonce: ${parseInt(transactionData.nonce, 16)}`);

// 解析函数调用
const functionSelector = transactionData.data.slice(0, 10);
console.log(`\n🔧 函数调用:`);
console.log(`函数选择器: ${functionSelector}`);

if (functionSelector === '0x70614ac5') {
  console.log('函数名: mintWorkNFT(uint256,string)');
  
  // 解析参数
  const data = transactionData.data.slice(10);
  const workId = parseInt(data.slice(0, 64), 16);
  const tokenURIOffset = parseInt(data.slice(64, 128), 16);
  const tokenURILength = parseInt(data.slice(128, 192), 16);
  const tokenURIHex = data.slice(192, 192 + tokenURILength * 2);
  const tokenURI = Buffer.from(tokenURIHex, 'hex').toString('utf8');
  
  console.log(`参数1 - workId: ${workId}`);
  console.log(`参数2 - tokenURI: ${tokenURI}`);
} else {
  console.log('未知函数调用');
}

console.log('\n🚨 可能的失败原因:');

const failureReasons = [
  {
    reason: '作品不存在',
    description: 'workId=1 在CreationManager合约中不存在',
    solution: '确保作品已经通过registerOriginalWork注册到区块链',
    checkMethod: '调用CreationManager.getWork(1)查看作品是否存在'
  },
  {
    reason: '权限验证失败',
    description: '调用者不是作品的创作者',
    solution: '使用作品创作者的钱包地址进行铸造',
    checkMethod: '检查作品的creator_address是否与当前钱包地址匹配'
  },
  {
    reason: 'NFT已铸造',
    description: '该作品已经铸造过NFT',
    solution: '检查NFT铸造状态，尝试铸造其他作品',
    checkMethod: '调用NFTManager.isWorkNFTMinted(1)检查状态'
  },
  {
    reason: '合约权限未设置',
    description: 'NFTManager未设置CreationManager地址',
    solution: '调用NFTManager.setCreationManager()设置正确地址',
    checkMethod: '调用NFTManager.getCreationManager()检查是否已设置'
  },
  {
    reason: 'Gas限制不足',
    description: '交易Gas限制太低，无法完成执行',
    solution: '增加Gas限制到300,000或更高',
    checkMethod: '在MetaMask中手动设置更高的Gas限制'
  },
  {
    reason: '合约调用失败',
    description: 'CreationManager合约调用返回失败',
    solution: '检查CreationManager合约是否正常工作',
    checkMethod: '先测试CreationManager的只读函数'
  }
];

failureReasons.forEach((item, index) => {
  console.log(`\n${index + 1}. ❌ ${item.reason}`);
  console.log(`   问题: ${item.description}`);
  console.log(`   解决: ${item.solution}`);
  console.log(`   检查: ${item.checkMethod}`);
});

console.log('\n🔍 调试步骤:');

const debugSteps = [
  '1. 检查作品是否存在于区块链',
  '2. 验证当前钱包是否为作品创作者',
  '3. 检查NFT是否已经铸造过',
  '4. 验证合约权限设置',
  '5. 尝试增加Gas限制',
  '6. 检查合约部署状态'
];

debugSteps.forEach(step => console.log(step));

console.log('\n🧪 建议的测试顺序:');

console.log('A. 基础检查:');
console.log('   - 在区块链浏览器查看合约状态');
console.log('   - 确认钱包地址正确');
console.log('   - 检查网络连接');

console.log('\nB. 合约状态检查:');
console.log('   - 调用只读函数测试合约连接');
console.log('   - 验证作品数据');
console.log('   - 检查NFT铸造状态');

console.log('\nC. 权限检查:');
console.log('   - 验证合约间权限设置');
console.log('   - 检查函数调用权限');
console.log('   - 确认初始化状态');

console.log('\n🔗 验证链接:');
console.log(`合约地址: https://sepolia.etherscan.io/address/${transactionData.to}`);
console.log(`发送者地址: https://sepolia.etherscan.io/address/${transactionData.from}`);
console.log('Creation Manager: https://sepolia.etherscan.io/address/0x8a4664807dafa6017aa1de55bf974e9515c6efb1');

console.log('\n💡 快速修复建议:');

console.log('1. 首先检查作品是否存在:');
console.log('   - 访问应用，查看作品列表');
console.log('   - 确认workId=1的作品已创建');

console.log('\n2. 验证创作者权限:');
console.log('   - 确保使用创作者钱包');
console.log('   - 检查作品详情中的创作者地址');

console.log('\n3. 检查NFT状态:');
console.log('   - 查看作品是否已显示NFT徽章');
console.log('   - 尝试铸造其他未铸造的作品');

console.log('\n4. 如果问题持续:');
console.log('   - 重新部署合约系统');
console.log('   - 重新创建测试作品');
console.log('   - 联系技术支持');

console.log('\n🎯 诊断完成！请按照上述步骤排查问题。');