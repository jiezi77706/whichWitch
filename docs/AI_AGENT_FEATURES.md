# AI Agent 功能说明

## 概述

whichWitch 平台的 AI Agent 专注于四个核心功能，为用户提供全方位的创作和交易支持。

## 核心功能

### 1. 创作助手 🎨

#### 功能描述
- **作品简介生成**: 为没有简介的作品自动生成吸引人的描述
- **创作建议**: 提供头脑风暴和后续创作方向
- **授权方式建议**: 根据作品类型推荐合适的授权模式

#### API 端点
- `POST /api/ai/generate-description` - 生成作品简介
- `POST /api/ai/brainstorm` - 头脑风暴和创作建议

#### 使用场景
```javascript
// 生成作品简介
const response = await aiAPI.generateWorkDescription({
  workTitle: "数字艺术：未来城市",
  workType: "数字艺术",
  userInput: "一幅描绘2050年智慧城市的数字插画",
  userProfile: { experience: "beginner" }
});

// 头脑风暴
const ideas = await aiAPI.brainstormIdeas({
  workTitle: "数字艺术：未来城市",
  currentDescription: "现有描述",
  creativeGoals: "希望引发对未来科技的思考"
});
```

#### 输出内容
- 专业的作品简介（100-200字）
- 3-5个创作发展方向
- 授权方式推荐及理由
- 市场定位建议

### 2. 交易助手 📈

#### 功能描述
- **市场分析**: 基于最新 NFT 交易数据提供市场洞察
- **交易建议**: 个性化的买卖时机和价格策略
- **风险评估**: 交易风险分析和防范建议

#### API 端点
- `GET /api/ai/market-analysis` - 市场分析
- `POST /api/ai/trading-advice` - 个性化交易建议
- `GET /api/ai/market-data` - 获取市场数据

#### 使用场景
```javascript
// 市场分析
const analysis = await aiAPI.getMarketAnalysis({
  riskLevel: 'medium',
  investmentGoal: 'long-term'
});

// 个性化交易建议
const advice = await aiAPI.getTradingAdvice({
  walletAddress: '0x...',
  userPreferences: { riskLevel: 'medium' }
});
```

#### 输出内容
- 市场趋势分析
- 推荐的购买机会和价格区间
- 销售策略建议
- 风险提醒和控制措施
- 投资组合优化建议

### 3. 钱包管理助手 💰

#### 功能描述
- **Web3 基础教育**: 为新手普及区块链和钱包知识
- **安全管理**: 提供钱包安全防护指导
- **财务规划**: 个性化的数字资产管理建议

#### API 端点
- `POST /api/ai/web3-education` - Web3 知识普及
- `POST /api/ai/wallet-management` - 财务管理建议
- `GET /api/auth/wallet-security` - 获取安全建议

#### 使用场景
```javascript
// Web3 教育
const education = await aiAPI.getWeb3Education({
  question: "什么是私钥？如何安全保管？",
  userLevel: "beginner"
});

// 钱包管理建议
const management = await aiAPI.getWalletManagement({
  walletAddress: '0x...',
  userGoals: { securityLevel: 'high' }
});
```

#### 输出内容
- 通俗易懂的概念解释
- 实际操作指导
- 安全注意事项和最佳实践
- 个性化的资产配置建议
- 风险管理策略

### 4. 邮箱登录自动创建钱包 🔐

#### 功能描述
- **自动钱包生成**: 邮箱注册时自动创建专属钱包
- **安全加密**: 使用用户密码加密私钥存储
- **安全教育**: 提供钱包安全使用指导

#### API 端点
- `POST /api/auth/email-register` - 邮箱注册（自动创建钱包）
- `POST /api/auth/email-login` - 邮箱登录
- `POST /api/auth/reset-password` - 重置密码

#### 使用场景
```javascript
// 邮箱注册（自动创建钱包）
const response = await authAPI.emailRegister({
  email: "user@example.com",
  password: "securepassword",
  confirmPassword: "securepassword"
});

// 返回钱包信息和安全建议
console.log(response.wallet.address); // 钱包地址
console.log(response.securityAdvice); // 安全建议
```

#### 输出内容
- 自动生成的钱包地址
- 加密存储的私钥
- 助记词（用于恢复）
- 详细的安全使用指南
- 钱包管理最佳实践

## 智能聊天功能 💬

### 功能描述
- **上下文理解**: 根据用户问题自动路由到相应的专业助手
- **多领域支持**: 涵盖创作、交易、钱包管理等各个方面
- **个性化回复**: 基于用户背景提供定制化建议

### API 端点
- `POST /api/ai/chat` - 通用智能聊天

### 使用场景
```javascript
const response = await aiAPI.chat({
  query: "我是新手，如何开始在平台创作？",
  userContext: {
    userLevel: "beginner",
    interests: ["digital art"]
  }
});
```

## 前端集成

### AI 助手页面
访问 `/ai-assistant` 页面体验完整的 AI 助手功能：

- **创作助手标签**: 作品简介生成和创作建议
- **交易助手标签**: 市场分析和交易建议  
- **钱包管理标签**: Web3 教育和财务管理
- **智能聊天标签**: 自由对话和问题解答

### 认证页面
访问 `/auth` 页面进行用户注册和登录：

- **邮箱注册**: 自动创建钱包，提供安全指导
- **邮箱登录**: 连接已有钱包账户
- **钱包登录**: MetaMask 直接登录

## 技术特点

### AI 模型
- 使用阿里云通义千问 (Qwen) API
- 针对不同场景优化的提示词
- 温度参数调节确保回复质量

### 安全性
- 私钥加密存储，使用用户密码保护
- 助记词安全生成和备份提醒
- 完整的安全教育和最佳实践指导

### 数据集成
- 实时区块链数据获取
- 市场数据分析和趋势预测
- 用户行为分析和个性化推荐

## 测试和验证

### 功能测试
```bash
# 运行 AI 功能测试
node scripts/test-ai-features.js

# 启动完整开发环境
npm run dev:full

# 访问测试页面
# http://localhost:3000/ai-assistant
# http://localhost:3000/auth
```

### API 测试
```bash
# 健康检查
curl http://localhost:3001/api/health

# 测试创作助手
curl -X POST http://localhost:3001/api/ai/generate-description \
  -H "Content-Type: application/json" \
  -d '{"workTitle":"测试作品","workType":"数字艺术"}'
```

## 使用建议

### 创作者
1. 使用创作助手生成专业的作品简介
2. 通过头脑风暴获取创作灵感
3. 根据建议选择合适的授权方式

### 投资者
1. 定期查看市场分析了解趋势
2. 根据个人风险偏好获取交易建议
3. 使用风险评估功能控制投资风险

### 新手用户
1. 通过 Web3 教育了解基础知识
2. 学习钱包安全管理最佳实践
3. 使用智能聊天解答疑问

## 未来扩展

### 计划功能
- 多语言支持
- 语音交互
- 图像识别和分析
- 更精准的市场预测
- 社区互动功能

### 技术优化
- 响应速度优化
- 更智能的上下文理解
- 个性化学习能力
- 离线功能支持