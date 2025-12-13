# whichWitch AI Agent 快速启动指南

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填入必要配置
# 主要需要配置：
# - QWEN_API_KEY: 阿里云通义千问 API 密钥
# - PRIVATE_KEY: 用于合约交互的私钥（可选）
```

### 3. 启动服务
```bash
# 启动完整开发环境（前端 + 后端）
npm run dev:full

# 或者分别启动
npm run start:api  # 后端 API (端口 3001)
npm run dev        # 前端 (端口 3000)
```

### 4. 访问应用
- **主页**: http://localhost:3000
- **AI 助手**: http://localhost:3000/ai-assistant
- **用户认证**: http://localhost:3000/auth
- **Web3 测试**: http://localhost:3000/test-web3
- **API 健康检查**: http://localhost:3001/api/health

## 🧪 功能测试

### AI 功能测试
```bash
npm run test:ai
```

### 手动测试 API
```bash
# 健康检查
curl http://localhost:3001/api/health

# 创作助手 - 生成作品简介
curl -X POST http://localhost:3001/api/ai/generate-description \
  -H "Content-Type: application/json" \
  -d '{
    "workTitle": "数字艺术作品",
    "workType": "数字艺术",
    "userInput": "一幅未来主义风格的插画"
  }'

# 交易助手 - 市场分析
curl http://localhost:3001/api/ai/market-analysis

# 钱包管理 - Web3 教育
curl -X POST http://localhost:3001/api/ai/web3-education \
  -H "Content-Type: application/json" \
  -d '{
    "question": "什么是私钥？",
    "userLevel": "beginner"
  }'
```

## 🎯 核心功能

### 1. 创作助手 🎨
- **作品简介生成**: 为作品自动生成专业描述
- **创作建议**: 提供头脑风暴和发展方向
- **授权建议**: 推荐合适的授权方式

### 2. 交易助手 📈
- **市场分析**: 基于实时数据的市场洞察
- **交易建议**: 个性化的买卖策略
- **风险评估**: 投资风险分析和控制

### 3. 钱包管理助手 💰
- **Web3 教育**: 区块链基础知识普及
- **安全管理**: 钱包安全防护指导
- **财务规划**: 数字资产管理建议

### 4. 邮箱登录自动创建钱包 🔐
- **自动钱包**: 注册时自动生成专属钱包
- **安全加密**: 私钥加密存储
- **安全教育**: 完整的使用指导

## 📱 前端页面

### AI 助手页面 (`/ai-assistant`)
- **创作助手标签**: 作品简介生成和创作建议
- **交易助手标签**: 市场分析和交易建议
- **钱包管理标签**: Web3 教育和财务管理
- **智能聊天标签**: 自由对话和问题解答

### 认证页面 (`/auth`)
- **邮箱注册**: 自动创建钱包 + 安全指导
- **邮箱登录**: 连接已有账户
- **钱包登录**: MetaMask 直接登录

## 🔧 API 端点

### 创作助手
- `POST /api/ai/generate-description` - 生成作品简介
- `POST /api/ai/brainstorm` - 头脑风暴

### 交易助手
- `GET /api/ai/market-analysis` - 市场分析
- `POST /api/ai/trading-advice` - 交易建议
- `GET /api/ai/market-data` - 市场数据

### 钱包管理
- `POST /api/ai/web3-education` - Web3 教育
- `POST /api/ai/wallet-management` - 财务管理

### 认证系统
- `POST /api/auth/email-register` - 邮箱注册（自动创建钱包）
- `POST /api/auth/email-login` - 邮箱登录
- `POST /api/auth/wallet-login` - 钱包登录

### 通用功能
- `POST /api/ai/chat` - 智能聊天
- `GET /api/health` - 健康检查

## 🛠️ 开发工具

### 合约相关
```bash
npm run compile          # 编译合约
npm run deploy:zeta      # 部署到 ZetaChain 测试网
npm run test:web3        # 测试合约功能
```

### 代码检查
```bash
npm run lint             # ESLint 检查
npx tsc --noEmit        # TypeScript 类型检查
```

## 📋 环境变量说明

### 必需配置
```bash
# AI 服务
QWEN_API_KEY=your_qwen_api_key

# 区块链网络
RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
CHAIN_ID=7001

# 合约地址（ZetaChain 测试网已部署）
CREATION_MANAGER_ADDRESS=0x944b55A957d63970506E1733fA5ccD4342d19FC8
NFT_MANAGER_ADDRESS=0x8C46877629FeA27ced23345Ab8E9EeCb4c302C0c
MARKETPLACE_ADDRESS=0x8A4664807daFa6017Aa1dE55bf974E9515c6eFb1
```

### 可选配置
```bash
# 合约交互（如需后端自动交易）
PRIVATE_KEY=your_private_key

# JWT 安全
JWT_SECRET=your_jwt_secret

# 服务端口
PORT=3001
```

## 🔍 故障排除

### 常见问题

1. **AI API 调用失败**
   - 检查 `QWEN_API_KEY` 是否正确设置
   - 确认网络连接正常

2. **钱包连接失败**
   - 确保安装了 MetaMask
   - 检查网络是否切换到 ZetaChain 测试网

3. **合约调用失败**
   - 确认合约地址配置正确
   - 检查钱包是否有足够的 ZETA 代币

4. **服务启动失败**
   - 检查端口是否被占用
   - 确认所有依赖已正确安装

### 获取帮助
- 查看 [完整文档](docs/AI_AGENT_FEATURES.md)
- 检查 [API 文档](docs/API_DOCUMENTATION.md)
- 运行测试脚本诊断问题

## 🎉 开始使用

1. 启动服务: `npm run dev:full`
2. 访问 AI 助手: http://localhost:3000/ai-assistant
3. 注册账户: http://localhost:3000/auth
4. 开始创作和交易！

---

**注意**: 这是测试版本，请在测试网络上进行所有操作。生产环境部署前请仔细检查所有配置。