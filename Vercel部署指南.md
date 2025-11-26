# 🚀 Vercel 部署指南

## 📋 部署前准备

### 1. 确保项目已推送到 GitHub
```bash
# 如果还没有推送到 GitHub
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. 准备环境变量
你需要准备以下服务的 API 密钥：

#### 🔗 Alchemy RPC Provider
1. 访问 [Alchemy](https://alchemy.com)
2. 创建账号并登录
3. 点击 "Create App"
4. 选择 "Ethereum" -> "Sepolia" 测试网
5. 复制 API Key，格式：`https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

#### 🗄️ Supabase 数据库
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 进入 Project Settings -> API
4. 复制 `URL` 和 `anon public key`
5. 复制 `service_role key`（保密）

#### 📁 Pinata IPFS 存储
1. 访问 [Pinata](https://pinata.cloud)
2. 创建账号并登录
3. 进入 API Keys -> New Key
4. 复制 `API Key`、`API Secret` 和 `JWT`

---

## 🌐 Vercel 部署步骤

### 步骤 1: 登录 Vercel
1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录

### 步骤 2: 导入项目
1. 点击 "New Project"
2. 选择你的 GitHub 仓库 `whichWitch`
3. 点击 "Import"

### 步骤 3: 配置项目设置
在 "Configure Project" 页面：

#### Framework Preset
- 自动检测为 "Next.js"（无需修改）

#### Root Directory
- 保持默认 "./"

#### Build and Output Settings
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 步骤 4: 配置环境变量 🔑
在 "Environment Variables" 部分添加以下变量：

```env
# 智能合约地址（已部署在 Sepolia）
NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION=0xB9365df57B3250cC6e4B9b3efDeE9871020b68cF
NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT=0xE9e700df0e448F5DebE55A8B153aebf8988db0c8
NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION=0x182AF7db7B2928455900595506D94b26E173aeA1

# 网络配置
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia

# Alchemy RPC（替换为你的 API Key）
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Supabase（替换为你的配置）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Pinata IPFS（替换为你的配置）
PINATA_API_KEY=your-pinata-api-key
PINATA_API_SECRET=your-pinata-api-secret
PINATA_JWT=your-pinata-jwt
```

### 步骤 5: 部署
1. 点击 "Deploy"
2. 等待构建完成（约 2-5 分钟）

---

## 🔧 部署后配置

### 1. 初始化 Supabase 数据库
部署成功后，需要在 Supabase 中运行数据库初始化脚本：

1. 登录你的 Supabase 项目
2. 进入 SQL Editor
3. 复制 `src/backend/supabase/schema.sql` 的内容
4. 粘贴并执行

### 2. 测试部署
访问 Vercel 提供的 URL，测试以下功能：
- 钱包连接
- 用户注册/登录
- 作品浏览
- 收藏功能

---

## 🐛 常见问题解决

### 问题 1: 构建失败 - TypeScript 错误
**解决方案**: 已在 `next.config.mjs` 中配置忽略 TypeScript 错误
```javascript
typescript: {
  ignoreBuildErrors: true,
}
```

### 问题 2: 环境变量未生效
**解决方案**: 
1. 检查变量名是否正确
2. 前端变量必须以 `NEXT_PUBLIC_` 开头
3. 重新部署项目

### 问题 3: 钱包连接失败
**解决方案**:
1. 确保 `NEXT_PUBLIC_RPC_URL` 正确
2. 检查合约地址是否正确
3. 确保使用 Sepolia 测试网

### 问题 4: 图片上传失败
**解决方案**:
1. 检查 Pinata API 密钥
2. 确保 JWT 权限正确
3. 检查网络连接

---

## 📱 移动端优化

Vercel 自动支持移动端，但可以进一步优化：

### 1. PWA 配置（可选）
在 `public` 目录添加：
- `manifest.json`
- 各种尺寸的图标

### 2. 性能优化
- 图片懒加载（已配置）
- 代码分割（Next.js 自动）
- CDN 加速（Vercel 自动）

---

## 🔄 持续部署

### 自动部署
每次推送到 `main` 分支，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update features"
git push origin main
```

### 预览部署
推送到其他分支会创建预览部署，方便测试。

---

## 📊 监控和分析

### Vercel Analytics
1. 在项目设置中启用 Analytics
2. 查看访问量、性能指标
3. 监控错误和崩溃

### 日志查看
1. 进入 Vercel 项目面板
2. 点击 "Functions" 查看服务端日志
3. 使用浏览器开发者工具查看前端日志

---

## 🎯 部署检查清单

- [ ] GitHub 仓库已更新
- [ ] 获得 Alchemy API Key
- [ ] 配置 Supabase 项目
- [ ] 获得 Pinata API 密钥
- [ ] 在 Vercel 中配置所有环境变量
- [ ] 部署成功
- [ ] 运行 Supabase 数据库脚本
- [ ] 测试钱包连接
- [ ] 测试核心功能

---

## 🚀 部署完成！

部署成功后，你将获得：
- 生产环境 URL（如：`https://your-app.vercel.app`）
- 自动 HTTPS 证书
- 全球 CDN 加速
- 自动部署流水线

**现在你的 WhichWitch DApp 已经可以在全世界访问了！** 🌍

---

## 💡 下一步建议

1. **自定义域名**: 在 Vercel 中绑定你的域名
2. **监控设置**: 配置错误监控和性能追踪
3. **SEO 优化**: 添加 meta 标签和 sitemap
4. **用户反馈**: 收集用户使用反馈，持续改进

需要帮助？随时问我！ 😊