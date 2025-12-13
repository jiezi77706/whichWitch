# 🚀 部署安全检查清单

## ✅ 已修复的安全问题

### 1. API密钥安全
- [x] 移除代码中硬编码的API密钥
- [x] 更新.env.example移除真实密钥
- [x] 修复文档中的密钥泄露

### 2. 环境变量保护
- [x] 更新.gitignore忽略所有.env文件
- [x] 创建.env.production.template模板
- [x] 添加环境变量验证工具

### 3. 部署工具
- [x] 创建部署前安全检查脚本
- [x] 添加pre-deploy npm脚本
- [x] 创建生产环境日志工具

## ⚠️ 需要手动处理的问题

### 1. Console输出清理
代码中存在大量console.log/error输出，建议：
- 使用`src/utils/logger.js`替换所有console调用
- 在生产环境中禁用调试输出

### 2. 生产环境配置
部署前需要：
1. 复制`.env.production.template`为`.env.production`
2. 填入真实的生产环境变量
3. 确保所有API密钥和私钥安全存储

### 3. Vercel环境变量设置
在Vercel控制台中设置以下环境变量：
```
QWEN_API_KEY=your_real_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_byte_encryption_key
```

## 🔧 部署命令

### 安全检查
```bash
npm run security-check
```

### 完整部署前检查
```bash
npm run pre-deploy
```

### Vercel部署
```bash
vercel --prod
```

## 🛡️ 安全最佳实践

1. **永远不要**在代码中硬编码敏感信息
2. **定期轮换**API密钥和访问令牌
3. **使用环境变量**管理所有配置
4. **启用HTTPS**和安全头
5. **定期更新**依赖包
6. **监控**生产环境日志

## 📋 部署后验证

- [ ] 网站正常访问
- [ ] API接口正常工作
- [ ] 数据库连接正常
- [ ] AI功能正常
- [ ] Web3功能正常
- [ ] 无敏感信息泄露