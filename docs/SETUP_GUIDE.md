# whichWitch 项目设置指南

## 快速开始

### 1. 环境变量配置

复制 `.env.example` 到 `.env.local` 并填入你的配置：

```bash
cp .env.example .env.local
```

### 2. 必要的环境变量

```bash
# ============================================
# ZetaChain 网络配置
# ============================================
NEXT_PUBLIC_CHAIN_ID=7001
NEXT_PUBLIC_NETWORK_NAME=zetachain_testnet
NEXT_PUBLIC_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public

# ============================================
# 部署配置
# ============================================
RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
PRIVATE_KEY=your_private_key_here

# ============================================
# 智能合约地址（已部署到 ZetaChain 测试网）
# ============================================
CREATION_MANAGER_ADDRESS=0x944b55A957d63970506E1733fA5ccD4342d19FC8
AUTHORIZATION_MANAGER_ADDRESS=0x5988C2aF3eB0D6504feF8C00Ed948AA9c3f339F8
PAYMENT_MANAGER_ADDRESS=0xE2FC71225F9681418C2bF41ED64Fc9CBfe7b737c
NFT_MANAGER_ADDRESS=0x8C46877629FeA27ced23345Ab8E9EeCb4c302C0c
MARKETPLACE_ADDRESS=0x8A4664807daFa6017Aa1dE55bf974E9515c6eFb1
ZETA_BRIDGE_ADDRESS=0x47190893b0bD6316eeA4c29833CC829AF7024827

# ============================================
# 前端配置
# ============================================
NEXT_PUBLIC_NFT_MANAGER_ADDRESS=0x8C46877629FeA27ced23345Ab8E9EeCb4c302C0c
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x8A4664807daFa6017Aa1dE55bf974E9515c6eFb1
NEXT_PUBLIC_CREATION_MANAGER_ADDRESS=0x944b55A957d63970506E1733fA5ccD4342d19FC8
NEXT_PUBLIC_PAYMENT_MANAGER_ADDRESS=0xE2FC71225F9681418C2bF41ED64Fc9CBfe7b737c
NEXT_PUBLIC_API_URL=http://localhost:3001

# ============================================
# Wallet Connect
# ============================================
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发环境

```bash
# 启动完整开发环境（前端 + 后端）
npm run dev:full

# 或者分别启动
npm run start:api  # 后端 API (端口 3001)
npm run dev        # 前端 (端口 3000)
```

### 5. 访问测试页面

打开浏览器访问：
- 主页: http://localhost:3000
- Web3 测试页面: http://localhost:3000/test-web3
- API 健康检查: http://localhost:3001/api/health

## 功能测试

### 1. 钱包连接测试

1. 安装 MetaMask 浏览器扩展
2. 添加 ZetaChain 测试网络：
   - 网络名称: ZetaChain Athens Testnet
   - RPC URL: https://zetachain-athens-evm.blockpi.network/v1/rpc/public
   - Chain ID: 7001
   - 货币符号: ZETA
   - 区块浏览器: https://zetachain-athens-3.blockscout.com

3. 获取测试 ZETA 代币：
   - 访问 [ZetaChain 水龙头](https://labs.zetachain.com/get-zeta)
   - 输入你的钱包地址获取测试代币

### 2. 合约交互测试

访问 `/test-web3` 页面进行以下测试：

1. **连接钱包**: 点击"连接钱包"按钮
2. **网络检查**: 确认连接到 ZetaChain 测试网
3. **创建作品**: 测试创建作品功能
4. **铸造 NFT**: 测试 NFT 铸造功能
5. **市场交易**: 测试 NFT 上架和购买功能

### 3. API 测试

```bash
# 健康检查
curl http://localhost:3001/api/health

# 获取网络状态
curl http://localhost:3001/api/blockchain/network/status

# 获取市场列表
curl http://localhost:3001/api/blockchain/marketplace/listings
```

## 开发工具

### 1. 合约编译和部署

```bash
# 编译合约
npm run compile

# 部署到 ZetaChain 测试网
npm run deploy:zeta

# 测试合约功能
npm run test:web3
```

### 2. 代码检查

```bash
# ESLint 检查
npm run lint

# 类型检查
npx tsc --noEmit
```

## 故障排除

### 常见问题

1. **钱包连接失败**
   - 确认 MetaMask 已安装并解锁
   - 检查网络配置是否正确
   - 确认有足够的 ZETA 代币支付 Gas

2. **合约调用失败**
   - 检查合约地址是否正确
   - 确认网络连接正常
   - 查看浏览器控制台错误信息

3. **API 请求失败**
   - 确认后端服务器正在运行
   - 检查 CORS 配置
   - 验证环境变量设置

### 日志查看

```bash
# 查看前端日志
# 打开浏览器开发者工具 -> Console

# 查看后端日志
# 终端中查看 API 服务器输出

# 查看区块链交易
# 访问 https://zetachain-athens-3.blockscout.com
```

## 生产部署

### 1. 环境变量

更新生产环境的环境变量：

```bash
# 生产环境 RPC
RPC_URL=https://your-production-rpc-url

# 生产环境合约地址
CREATION_MANAGER_ADDRESS=0x...
# ... 其他合约地址

# 生产环境 API URL
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### 2. 构建和部署

```bash
# 构建前端
npm run build

# 启动生产服务器
npm start
```

## 相关文档

- [合约架构文档](./CONTRACT_ARCHITECTURE.md)
- [API 文档](./API_DOCUMENTATION.md)
- [CyberGraph 集成](./CYBERGRAPH_DEPLOYMENT.md)
- [部署检查清单](../DEPLOYMENT_CHECKLIST.md)