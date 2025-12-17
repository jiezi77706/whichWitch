#!/usr/bin/env node

/**
 * 检查数据库中的作品
 */

// 模拟浏览器环境的fetch
global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function checkDatabaseWorks() {
  console.log('🔍 检查数据库中的作品\n');

  try {
    // 获取所有作品
    const response = await fetch('http://localhost:3000/api/works/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const works = await response.json();
      console.log(`✅ 找到 ${works.length} 个作品:`);
      
      works.forEach((work, index) => {
        console.log(`\n${index + 1}. 作品ID: ${work.work_id}`);
        console.log(`   标题: ${work.title}`);
        console.log(`   创作者: ${work.creator_address}`);
        console.log(`   创建时间: ${work.created_at}`);
        console.log(`   图片URL: ${work.image_url}`);
        console.log(`   是否二创: ${work.is_remix}`);
      });

      // 检查是否有最近创建的作品
      const recentWorks = works.filter(work => {
        const createdAt = new Date(work.created_at);
        const now = new Date();
        const diffHours = (now - createdAt) / (1000 * 60 * 60);
        return diffHours < 24; // 24小时内创建的
      });

      console.log(`\n📅 最近24小时内创建的作品: ${recentWorks.length} 个`);
      recentWorks.forEach(work => {
        console.log(`- ${work.title} (ID: ${work.work_id})`);
      });

    } else {
      console.log('❌ 获取作品失败:', response.status, response.statusText);
    }

  } catch (error) {
    console.log('❌ 网络错误:', error.message);
    console.log('💡 请确保开发服务器正在运行: npm run dev');
  }
}

// 运行检查
checkDatabaseWorks().catch(console.error);