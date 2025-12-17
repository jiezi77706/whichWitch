#!/usr/bin/env node

/**
 * 手动同步作品到数据库
 * 当自动同步失败时使用
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔄 手动同步作品到数据库\n');

// 从NFT铸造成功的交易中获取的信息
const workInfo = {
  // 请根据实际情况修改这些值
  workId: 1, // 从区块链交易中获取
  creatorAddress: '0xCCeb173b742CbeF5337baFaE9FA34E8fC79B7a97',
  title: '手动同步测试作品', // 请修改为实际标题
  description: '这是一个手动同步的作品',
  story: '由于自动同步失败，手动添加到数据库',
  imageUrl: 'https://gateway.pinata.cloud/ipfs/QmeGtdHj4Jo1nKqZE9as6cCPpQsUEu3aYRBkUqdn39c3Kg', // 从IPFS获取
  metadataUri: 'ipfs://QmeGtdHj4Jo1nKqZE9as6cCPpQsUEu3aYRBkUqdn39c3Kg', // 从交易中获取
  material: ['Digital'],
  tags: ['test', 'manual-sync'],
  allowRemix: true,
  licenseFee: '0.05',
  isRemix: false,
  parentWorkId: null
};

console.log('📋 准备同步的作品信息:');
console.log(JSON.stringify(workInfo, null, 2));

async function syncWorkToDatabase() {
  try {
    console.log('\n🚀 开始同步...');

    const response = await fetch('http://localhost:3000/api/works/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workInfo),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 同步成功!');
      console.log('📋 数据库记录:', result);
      
      console.log('\n🎉 作品已成功添加到数据库!');
      console.log('💡 现在可以在广场页面看到这个作品了');
      
    } else {
      const error = await response.json();
      console.log('❌ 同步失败!');
      console.log('📋 错误信息:', error);
      
      if (error.error && error.error.includes('already exists')) {
        console.log('\n💡 作品已存在于数据库中');
        console.log('🔍 请检查广场页面或数据库');
      }
    }

  } catch (error) {
    console.log('❌ 网络错误:', error.message);
    console.log('\n🛠️ 请检查:');
    console.log('1. 开发服务器是否运行: npm run dev');
    console.log('2. Supabase配置是否正确');
    console.log('3. 网络连接是否正常');
  }
}

console.log('\n⚠️ 使用说明:');
console.log('1. 请根据实际情况修改上面的workInfo对象');
console.log('2. 确保workId、imageUrl、metadataUri等信息正确');
console.log('3. 运行前请确保开发服务器正在运行');

console.log('\n🚀 开始同步...');
syncWorkToDatabase();

// 导入fetch (Node.js环境)
const fetch = require('node-fetch');