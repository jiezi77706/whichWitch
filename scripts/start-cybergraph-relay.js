const CyberGraphRelay = require('../src/backend/services/cyberGraphRelay');
require('dotenv').config();

async function main() {
  console.log('🚀 启动 CyberGraph 中继服务...');

  // 检查必要的环境变量
  const requiredEnvVars = [
    'PRIVATE_KEY',
    'RPC_URL', 
    'CYBERGRAPH_SYNC_ADDRESS'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ 缺少环境变量: ${envVar}`);
      process.exit(1);
    }
  }

  // 配置中继服务
  const config = {
    privateKey: process.env.PRIVATE_KEY,
    rpcUrl: process.env.RPC_URL,
    cyberGraphSyncAddress: process.env.CYBERGRAPH_SYNC_ADDRESS,
    cyberGraphApiUrl: process.env.CYBERGRAPH_API_URL || 'https://api.cybergraph.io',
    cyberGraphApiKey: process.env.CYBERGRAPH_API_KEY || 'demo-key'
  };

  console.log('配置信息:');
  console.log('- RPC URL:', config.rpcUrl);
  console.log('- CyberGraphSync 地址:', config.cyberGraphSyncAddress);
  console.log('- CyberGraph API:', config.cyberGraphApiUrl);
  console.log();

  try {
    // 创建并启动中继服务
    const relay = new CyberGraphRelay(config);
    await relay.start();

    // 优雅关闭处理
    process.on('SIGINT', () => {
      console.log('\n🛑 收到关闭信号，正在停止服务...');
      relay.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 收到终止信号，正在停止服务...');
      relay.stop();
      process.exit(0);
    });

    // 保持进程运行
    console.log('✅ 中继服务运行中... (按 Ctrl+C 停止)');
    
  } catch (error) {
    console.error('❌ 启动中继服务失败:', error);
    process.exit(1);
  }
}

main().catch(console.error);