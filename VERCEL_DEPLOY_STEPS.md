# 🚀 Vercel 部署步骤

## 📋 准备工作
✅ 代码已推送到 GitHub  
✅ 环境变量已准备好

## 🌐 开始部署

### 1. 访问 Vercel
打开：https://vercel.com

### 2. 登录
点击 "Login" → 选择 "Continue with GitHub"

### 3. 导入项目
1. 点击 "New Project"
2. 找到并选择 `whichWitch` 仓库
3. 点击 "Import"

### 4. 配置项目
**Framework Preset**: Next.js（自动检测）  
**Root Directory**: ./（默认）  
**Build Command**: `npm run build`（默认）  
**Output Directory**: `.next`（默认）

### 5. 添加环境变量 🔑
在 "Environment Variables" 部分，逐个添加以下变量：

```
NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION=0xB9365df57B3250cC6e4B9b3efDeE9871020b68cF
NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT=0xE9e700df0e448F5DebE55A8B153aebf8988db0c8
NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION=0x182AF7db7B2928455900595506D94b26E173aeA1
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/Jf9AtHozZzalDMkqCamE
NEXT_PUBLIC_SUPABASE_URL=https://csdhiozlgawtjsfglglh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZGhpb3psZ2F3dGpzZmdsZ2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjg2NzUsImV4cCI6MjA3OTcwNDY3NX0.k4ozRLHddlYyDtRLVFIIDgNAK4OIRRMJ5QQWfsr51VI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZGhpb3psZ2F3dGpzZmdsZ2xoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyODY3NSwiZXhwIjoyMDc5NzA0Njc1fQ.d6xGASHHw8AOkf-smkjmlawyclYERqgyfdRywBen98s
PINATA_API_KEY=0f64e9a610081fda5bb3
PINATA_API_SECRET=e1372099de3293d6f94ff1c53126539d254eea4b70aba0c4a76a04fd2d30ce96
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxNDMxNWM0YS04ZTNiLTQzOGMtODNmNC04YzAwMzBlYjllMjkiLCJlbWFpbCI6Im1sdXh1bnFpQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIwZjY0ZTlhNjEwMDgxZmRhNWJiMyIsInNjb3BlZEtleVNlY3JldCI6ImUxMzcyMDk5ZGUzMjkzZDZmOTRmZjFjNTMxMjY1MzlkMjU0ZWVhNGI3MGFiYTBjNGE3NmEwNGZkMmQzMGNlOTYiLCJleHAiOjE3OTU2ODc1NzN9.j8fvmHxFSEnJHeSBmTJz4lZSLve_WI3Ad7gZzurh4o0
```

### 6. 部署
点击 "Deploy" 按钮，等待 2-5 分钟构建完成。

## 🔧 部署后配置

### 1. 初始化数据库
1. 访问：https://supabase.com/dashboard
2. 进入你的项目：csdhiozlgawtjsfglglh
3. 点击 "SQL Editor"
4. 复制 `src/backend/supabase/schema.sql` 的内容
5. 粘贴并点击 "Run" 执行

### 2. 测试部署
访问 Vercel 提供的 URL，测试：
- 钱包连接
- 用户注册
- 作品浏览
- 收藏功能

## 🎉 完成！
你的 WhichWitch DApp 现在已经在线了！

## 📞 需要帮助？
如果遇到问题，检查：
1. Vercel 的构建日志
2. 浏览器控制台错误
3. 环境变量是否正确设置