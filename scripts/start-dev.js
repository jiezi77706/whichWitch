const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动 whichWitch 开发环境...\n');

// 启动后端服务器
console.log('📡 启动后端 API 服务器...');
const backend = spawn('node', ['api/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: 3001 }
});

// 等待一秒后启动前端
setTimeout(() => {
  console.log('🎨 启动前端开发服务器...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit'
  });

  frontend.on('close', (code) => {
    console.log(`前端服务器退出，代码: ${code}`);
    backend.kill();
  });
}, 1000);

backend.on('close', (code) => {
  console.log(`后端服务器退出，代码: ${code}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭服务器...');
  backend.kill();
  process.exit(0);
});