/**
 * 环境变量验证工具
 * 确保所有必需的环境变量都已设置
 */

const requiredEnvVars = {
  development: [
    'QWEN_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'JWT_SECRET'
  ],
  production: [
    'QWEN_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ]
};

function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ 缺少必需的环境变量:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    
    if (env === 'production') {
      throw new Error('生产环境缺少必需的环境变量，部署失败');
    } else {
      console.warn('⚠️  开发环境缺少环境变量，某些功能可能无法正常工作');
    }
  } else {
    console.log('✅ 所有必需的环境变量已设置');
  }
}

module.exports = { validateEnvironment };