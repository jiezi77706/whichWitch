#!/usr/bin/env node

/**
 * 项目清理脚本
 * 删除不必要的文件和目录，整理项目结构
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 开始清理项目...\n');

// 需要删除的文件和目录
const itemsToDelete = [
  // 临时文件
  'temp_backup/',
  'teammate-package.json',
  
  // 重复的配置文件
  '.env.production.template',
  
  // 构建缓存
  '.next/',
  'dist/',
  'build/',
  
  // 日志文件
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
];

// 检查并删除项目根目录下的不必要文件
function cleanupRootDirectory() {
  console.log('📁 清理根目录...');
  
  itemsToDelete.forEach(item => {
    const fullPath = path.join(process.cwd(), item);
    
    if (fs.existsSync(fullPath)) {
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`  ✅ 删除目录: ${item}`);
        } else {
          fs.unlinkSync(fullPath);
          console.log(`  ✅ 删除文件: ${item}`);
        }
      } catch (error) {
        console.log(`  ❌ 删除失败: ${item} - ${error.message}`);
      }
    }
  });
}

// 检查项目结构完整性
function validateProjectStructure() {
  console.log('\n🔍 验证项目结构...');
  
  const requiredDirectories = [
    'app',
    'components', 
    'contexts',
    'lib',
    'src/backend',
    'src/contracts',
    'types'
  ];
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'tailwind.config.js',
    '.env.example',
    'README.md'
  ];
  
  let allValid = true;
  
  requiredDirectories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`  ❌ 缺少目录: ${dir}`);
      allValid = false;
    } else {
      console.log(`  ✅ 目录存在: ${dir}`);
    }
  });
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`  ❌ 缺少文件: ${file}`);
      allValid = false;
    } else {
      console.log(`  ✅ 文件存在: ${file}`);
    }
  });
  
  return allValid;
}

// 生成项目统计信息
function generateProjectStats() {
  console.log('\n📊 项目统计信息...');
  
  const stats = {
    totalFiles: 0,
    totalDirectories: 0,
    codeFiles: {
      typescript: 0,
      javascript: 0,
      solidity: 0,
      json: 0
    }
  };
  
  function countFiles(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          stats.totalDirectories++;
          countFiles(fullPath);
        } else if (stat.isFile()) {
          stats.totalFiles++;
          
          const ext = path.extname(item).toLowerCase();
          switch (ext) {
            case '.ts':
            case '.tsx':
              stats.codeFiles.typescript++;
              break;
            case '.js':
            case '.jsx':
              stats.codeFiles.javascript++;
              break;
            case '.sol':
              stats.codeFiles.solidity++;
              break;
            case '.json':
              stats.codeFiles.json++;
              break;
          }
        }
      });
    } catch (error) {
      // 忽略权限错误
    }
  }
  
  countFiles('.');
  
  console.log(`  📁 总目录数: ${stats.totalDirectories}`);
  console.log(`  📄 总文件数: ${stats.totalFiles}`);
  console.log(`  📝 TypeScript 文件: ${stats.codeFiles.typescript}`);
  console.log(`  📝 JavaScript 文件: ${stats.codeFiles.javascript}`);
  console.log(`  📝 Solidity 文件: ${stats.codeFiles.solidity}`);
  console.log(`  📝 JSON 文件: ${stats.codeFiles.json}`);
}

// 主函数
function main() {
  try {
    cleanupRootDirectory();
    const isValid = validateProjectStructure();
    generateProjectStats();
    
    console.log('\n🎉 项目清理完成！');
    
    if (isValid) {
      console.log('✅ 项目结构完整，可以正常运行');
    } else {
      console.log('⚠️  项目结构不完整，请检查缺少的文件和目录');
    }
    
    console.log('\n📋 下一步操作：');
    console.log('  1. 检查 .env.local 配置');
    console.log('  2. 运行 npm install 安装依赖');
    console.log('  3. 运行 npm run dev 启动开发服务器');
    console.log('  4. 运行 npm run build 测试构建');
    
  } catch (error) {
    console.error('❌ 清理过程中出现错误:', error.message);
    process.exit(1);
  }
}

main();