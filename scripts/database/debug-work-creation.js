#!/usr/bin/env node

/**
 * 调试作品创建问题
 * 模拟完整的作品创建流程
 */

// 模拟浏览器环境的fetch
global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugWorkCreation() {
  console.log('🔍 调试作品创建流程\n');

  // 模拟从NFT铸造成功后的数据
  const mockWorkData = {
    workId: 1, // 从区块链获取的实际workId
    creatorAddress: '0xCCeb173b742CbeF5337baFaE9FA34E8fC79B7a97',
    title: '调试测试作品',
    description: '这是一个调试测试作品',
    story: '用于调试数据库同步问题',
    imageUrl: 'https://gateway.pinata.cloud/ipfs/QmeGtdHj4Jo1nKqZE9as6cCPpQsUEu3aYRBkUqdn39c3Kg',
    images: ['https://gateway.pinata.cloud/ipfs/QmeGtdHj4Jo1nKqZE9as6cCPpQsUEu3aYRBkUqdn39c3Kg'],
    metadataUri: 'ipfs://QmeGtdHj4Jo1nKqZE9as6cCPpQsUEu3aYRBkUqdn39c3Kg',
    material: ['Digital'],
    tags: ['debug', 'test'],
    allowRemix: true,
    licenseFee: '0.05',
    isRemix: false,
    parentWorkId: null,
  };

  console.log('📋 模拟的作品数据:');
  console.log(JSON.stringify(mockWorkData, null, 2));

  console.log('\n🧪 测试1: 直接调用API');
  try {
    const response = await fetch('http://localhost:3000/api/works/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockWorkData),
    });

    console.log('📥 API响应状态:', response.status, response.statusText);

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
    return;
  }

  console.log('\n🧪 测试2: 模拟集成服务调用');
  
  // 模拟集成服务中的createWork调用
  async function mockCreateWork(workData) {
    try {
      console.log('📤 发送数据到API...');
      const response = await fetch('/api/works/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create work');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating work:', error);
      throw error;
    }
  }

  try {
    console.log('🔄 调用模拟的createWork函数...');
    const result = await mockCreateWork(mockWorkData);
    console.log('✅ 模拟调用成功!');
    console.log('📋 返回结果:', result);
  } catch (error) {
    console.log('❌ 模拟调用失败:', error.message);
    
    console.log('\n🔍 可能的原因:');
    console.log('1. 开发服务器未运行');
    console.log('2. API路由有问题');
    console.log('3. 数据格式错误');
    console.log('4. Supabase连接问题');
  }

  console.log('\n📊 诊断总结:');
  console.log('如果测试1成功但测试2失败，说明问题在于:');
  console.log('- 浏览器环境中的fetch调用');
  console.log('- 相对路径 /api/works/create 可能有问题');
  console.log('- 需要使用完整URL: http://localhost:3000/api/works/create');

  console.log('\n🛠️ 修复建议:');
  console.log('1. 检查浏览器控制台的网络请求');
  console.log('2. 确认API调用使用正确的URL');
  console.log('3. 验证开发服务器正在运行');
  console.log('4. 检查CORS设置');
}

// 运行调试
debugWorkCreation().catch(console.error);