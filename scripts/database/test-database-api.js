#!/usr/bin/env node

/**
 * 测试数据库API是否正常工作
 */

// Import fetch for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCreateWorkAPI() {
  console.log('🧪 测试作品创建API\n');

  const testData = {
    workId: 999,
    creatorAddress: '0xCCeb173b742CbeF5337baFaE9FA34E8fC79B7a97',
    title: 'API测试作品',
    description: '这是一个API测试作品',
    story: '测试数据库API是否正常工作',
    imageUrl: 'https://gateway.pinata.cloud/ipfs/QmTestHash',
    images: ['https://gateway.pinata.cloud/ipfs/QmTestHash'],
    metadataUri: 'ipfs://QmTestMetadata',
    material: ['Digital'],
    tags: ['test', 'api'],
    allowRemix: true,
    licenseFee: '0.01',
    isRemix: false,
    parentWorkId: null
  };

  console.log('📤 发送测试数据:', testData);

  try {
    const response = await fetch('http://localhost:3000/api/works/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('\n📥 响应状态:', response.status, response.statusText);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API调用成功!');
      console.log('📋 返回数据:', result);
    } else {
      const error = await response.json();
      console.log('❌ API调用失败!');
      console.log('📋 错误信息:', error);
    }

  } catch (error) {
    console.log('❌ 网络错误:', error.message);
    console.log('💡 请确保开发服务器正在运行: npm run dev');
  }
}

// 运行测试
testCreateWorkAPI();