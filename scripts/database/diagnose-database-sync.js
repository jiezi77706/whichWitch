#!/usr/bin/env node

/**
 * 诊断数据库同步问题
 * 检查为什么作品没有保存到Supabase
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 数据库同步问题诊断\n');

console.log('📋 问题描述:');
console.log('✅ NFT铸造成功 (在Sepolia浏览器可见)');
console.log('❌ 作品未保存到Supabase数据库');
console.log('❌ 广场页面看不到新作品');

console.log('\n🔍 可能的原因:');

const possibleCauses = [
  {
    issue: 'API调用失败',
    description: '前端调用/api/works/create失败',
    checkMethod: '检查浏览器控制台错误',
    priority: '🔥 高'
  },
  {
    issue: 'Supabase连接问题',
    description: 'Supabase服务端连接失败',
    checkMethod: '检查环境变量和网络连接',
    priority: '🔥 高'
  },
  {
    issue: '数据格式错误',
    description: '传递给API的数据格式不正确',
    checkMethod: '检查API请求payload',
    priority: '🟡 中'
  },
  {
    issue: '权限问题',
    description: 'Supabase权限配置错误',
    checkMethod: '检查service role key',
    priority: '🟡 中'
  },
  {
    issue: '表结构问题',
    description: 'works表不存在或结构不匹配',
    checkMethod: '检查Supabase表结构',
    priority: '🟢 低'
  },
  {
    issue: '流程中断',
    description: '区块链成功但数据库步骤被跳过',
    checkMethod: '检查集成服务逻辑',
    priority: '🔥 高'
  }
];

possibleCauses.forEach((item, index) => {
  console.log(`\n${index + 1}. ${item.priority} ${item.issue}`);
  console.log(`   问题: ${item.description}`);
  console.log(`   检查: ${item.checkMethod}`);
});

console.log('\n🛠️ 调试步骤:');

console.log('\n步骤1: 检查浏览器控制台');
console.log('- 打开浏览器开发者工具 (F12)');
console.log('- 查看Console标签的错误信息');
console.log('- 查看Network标签的API请求');
console.log('- 特别关注/api/works/create的请求状态');

console.log('\n步骤2: 检查Supabase配置');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl) {
  console.log(`✅ Supabase URL: ${supabaseUrl}`);
} else {
  console.log('❌ Supabase URL: 未配置');
}

if (supabaseKey) {
  console.log(`✅ Service Role Key: ${supabaseKey.substring(0, 20)}...`);
} else {
  console.log('❌ Service Role Key: 未配置');
}

console.log('\n步骤3: 测试API端点');
console.log('手动测试API:');
console.log('curl -X POST http://localhost:3000/api/works/create \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"workId":999,"creatorAddress":"0xtest","title":"Test Work"}\'');

console.log('\n步骤4: 检查数据库表');
console.log('登录Supabase控制台:');
console.log(`${supabaseUrl.replace('supabase.co', 'supabase.com/dashboard/project')}`);
console.log('检查works表是否存在和数据');

console.log('\n🔧 快速修复方案:');

const quickFixes = [
  {
    fix: '重新上传作品',
    steps: [
      '1. 打开浏览器开发者工具',
      '2. 重新上传一个作品',
      '3. 观察Console和Network标签',
      '4. 记录任何错误信息'
    ]
  },
  {
    fix: '手动保存到数据库',
    steps: [
      '1. 获取NFT的workId和metadata',
      '2. 通过Supabase控制台手动插入',
      '3. 验证数据是否正确显示'
    ]
  },
  {
    fix: '检查集成服务',
    steps: [
      '1. 检查work-nft-integration.service.ts',
      '2. 验证createWork调用',
      '3. 添加更多日志输出'
    ]
  }
];

quickFixes.forEach((item, index) => {
  console.log(`\n方案${index + 1}: ${item.fix}`);
  item.steps.forEach(step => console.log(`   ${step}`));
});

console.log('\n🎯 立即行动计划:');

console.log('1. 🔍 立即检查 (5分钟):');
console.log('   - 打开浏览器控制台');
console.log('   - 重新上传一个作品');
console.log('   - 观察错误信息');

console.log('\n2. 🛠️ 快速修复 (10分钟):');
console.log('   - 根据错误信息修复API');
console.log('   - 测试数据库连接');
console.log('   - 验证修复效果');

console.log('\n3. ✅ 验证成功 (5分钟):');
console.log('   - 上传新作品');
console.log('   - 检查广场页面');
console.log('   - 确认数据同步');

console.log('\n📞 需要提供的信息:');
console.log('如果问题持续，请提供:');
console.log('- 浏览器控制台截图');
console.log('- Network标签的API请求详情');
console.log('- 具体的错误信息');
console.log('- 上传的作品信息');

console.log('\n🚀 开始调试！打开浏览器控制台并重新上传作品。');