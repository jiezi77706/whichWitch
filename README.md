# WhichWitch - Web3 创作平台

一个基于区块链的创作平台，支持 NFT 创作、衍生作品管理和 AI 助手功能。

## 🚀 核心功能

### 🎨 创作管理
- **原创作品注册** - 在区块链上注册原创作品
- **衍生作品管理** - 管理和追踪衍生作品关系
- **NFT 铸造** - 将作品铸造为 NFT
- **版权保护** - 基于智能合约的版权管理

### 🤖 AI 助手
- **创作助手** - AI 驱动的创作建议和头脑风暴
- **交易助手** - 市场分析和交易建议
- **钱包管理** - Web3 教育和财务管理建议
- **智能聊天** - 上下文感知的 AI 对话

### 🏪 NFT 市场
- **NFT 交易** - 买卖 NFT 作品
- **挂单管理** - 灵活的挂单和出价系统
- **跨链支付** - 支持多链交易
- **市场统计** - 实时市场数据分析

### 🌐 社交网络
- **CyberGraph 集成** - 去中心化社交图谱
- **创作者档案** - 个性化创作者页面
- **社交互动** - 关注、点赞、评论功能

## 🛠 技术栈

### 前端
- **Next.js 14** - React 全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Wagmi + RainbowKit** - Web3 连接
- **Axios** - HTTP 客户端

### 区块链
- **ZetaChain** - 主要部署网络
- **Ethereum Sepolia** - 测试网络
- **Hardhat** - 智能合约开发
- **Ethers.js** - 区块链交互

### 后端服务
- **Node.js + Express** - API 服务器
- **Supabase** - 数据库和认证
- **通义千问 API** - AI 服务
- **IPFS (Pinata)** - 去中心化存储

## 📦 项目结构

```
whichWitch/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── auth/              # 认证页面
│   ├── ai-assistant/      # AI 助手页面
│   ├── marketplace/       # NFT 市场
│   ├── cybergraph/        # 社交功能
│   └── test-web3/         # Web3 测试
├── components/            # React 组件
├── contexts/              # React Context
├── lib/                   # 工具库
│   ├── api.ts            # API 客户端
│   └── hooks/            # 自定义 Hooks
├── src/                   # 后端源码
│   ├── backend/          # Express 服务器
│   ├── contracts/        # 智能合约
│   └── utils/            # 工具函数
├── types/                 # TypeScript 类型定义
├── scripts/              # 部署和工具脚本
└── docs/                 # 项目文档
```

