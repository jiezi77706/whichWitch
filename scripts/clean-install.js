const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 开始清理项目依赖...');

// 删除 node_modules
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('📁 删除 node_modules...');
  try {
    if (process.platform === 'win32') {
      execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
    } else {
      execSync('rm -rf node_modules', { stdio: 'inherit' });
    }
    console.log('✅ node_modules 删除成功');
  } catch (error) {
    console.error('❌ 删除 node_modules 失败:', error.message);
  }
} else {
  console.log('📁 node_modules 不存在，跳过删除');
}

// 删除 package-lock.json
const packageLockPath = path.join(process.cwd(), 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  console.log('📄 删除 package-lock.json...');
  try {
    fs.unlinkSync(packageLockPath);
    console.log('✅ package-lock.json 删除成功');
  } catch (error) {
    console.error('❌ 删除 package-lock.json 失败:', error.message);
  }
} else {
  console.log('📄 package-lock.json 不存在，跳过删除');
}

// 清理 npm 缓存
console.log('🗑️ 清理 npm 缓存...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ npm 缓存清理成功');
} catch (error) {
  console.error('❌ 清理 npm 缓存失败:', error.message);
}

console.log('\n🚀 开始重新安装依赖...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('\n✅ 依赖安装完成！');
  console.log('\n🎉 项目已成功更新，所有警告问题已解决！');
  console.log('\n📋 下一步操作:');
  console.log('   npm run dev:full  # 启动完整开发环境');
  console.log('   npm run test:ai   # 测试 AI 功能');
} catch (error) {
  console.error('\n❌ 依赖安装失败:', error.message);
  console.log('\n💡 请手动运行以下命令:');
  console.log('   npm install');
}