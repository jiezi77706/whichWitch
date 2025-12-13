# CyberGraphSync 部署指南

## 概述

CyberGraphSync 合约用于将 whichWitch 平台的内容同步到 CyberGraph 链上，构建去中心化的社交图谱。

## 部署步骤

### 1. 环境准备

确保你的 `.env` 文件包含以下配置：

```bash
# 基础配置
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# 已部署的合约地址（需要先部署 CreationManager）
CREATION_MANAGER_ADDRESS=0x...

# CyberGraph 配置
CYBERGRAPH_API_URL=https://api.cybergraph.io
CYBERGRAPH_API_KEY=your_api_key_here
```

### 2. 部署 CyberGraphSync 合约

```bash
# 部署到测试网
npx hardhat run scripts/deploy-cybergraph.js --network sepolia

# 部署到 ZetaChain 测试网
npx hardhat run scripts/deploy-cybergraph.js --network zeta_testnet

# 部署到本地网络
npx hardhat run scripts/deploy-cybergraph.js --network localhost
```

### 3. 配置参数说明

#### 构造函数参数

- `_creationManager`: CreationManager 合约地址
- `_cyberGraphRelay`: CyberGraph 中继服务地址
- `initialOwner`: 合约所有者地址

#### _cyberGraphRelay 参数配置

`_cyberGraphRelay` 是一个关键参数，有以下几种配置方式：

**方式 1: 使用部署者地址（开发/测试）**
```javascript
const cyberGraphRelay = deployer.address;
```

**方式 2: 使用专门的中继服务地址（生产）**
```javascript
const cyberGraphRelay = "0x1234567890123456789012345678901234567890";
```

**方式 3: 使用多签钱包地址（高安全性）**
```javascript
const cyberGraphRelay = "0xMultiSigWalletAddress";
```

### 4. 启动中继服务

中继服务负责监听同步事件并处理与 CyberGraph 的通信：

```bash
# 启动中继服务
node scripts/start-cybergraph-relay.js
```

### 5. 验证部署

部署完成后，验证合约配置：

```javascript
// 检查合约配置
const cyberGraphSync = await ethers.getContractAt("CyberGraphSync", contractAddress);

console.log("CreationManager:", await cyberGraphSync.creationManager());
console.log("CyberGraph Relay:", await cyberGraphSync.cyberGraphRelay());
console.log("Owner:", await cyberGraphSync.owner());
console.log("Sync Fee:", await cyberGraphSync.syncFee());
```

## 使用方法

### 同步作品到 CyberGraph

```javascript
// 同步单个作品
await cyberGraphSync.syncWorkToCyberGraph(
  workId,           // 作品ID
  0,                // ContentType.OriginalWork
  "QmHash...",      // IPFS 内容哈希
  '{"title":"..."}', // 元数据 JSON
  '{"connections":[]}', // 社交连接数据
  { value: ethers.parseEther("0.001") } // 同步费用
);

// 批量同步作品
await cyberGraphSync.batchSyncWorks(
  [workId1, workId2],
  [0, 1], // ContentType 数组
  ["QmHash1...", "QmHash2..."],
  ['{"title":"Work1"}', '{"title":"Work2"}'],
  { value: ethers.parseEther("0.002") } // 总费用
);
```

### 更新创作者档案

```javascript
await cyberGraphSync.updateCreatorProfile(
  "username",           // CyberGraph 用户名
  '{"bio":"..."}' // 档案数据 JSON
);
```

### 创建社交关系

```javascript
await cyberGraphSync.createSocialRelation(
  followingAddress,  // 关注的地址
  0                 // 关系类型: 0=follow, 1=collaborate, 2=derivative
);
```

## 管理功能

### 更新中继服务地址

```javascript
// 只有合约所有者可以调用
await cyberGraphSync.setCyberGraphRelay(newRelayAddress);
```

### 调整同步费用

```javascript
// 设置新的同步费用（以 wei 为单位）
await cyberGraphSync.setSyncFee(ethers.parseEther("0.002"));
```

### 提取合约余额

```javascript
// 提取收集的同步费用
await cyberGraphSync.withdraw();
```

## 事件监听

合约会发出以下事件：

```javascript
// 监听同步事件
cyberGraphSync.on('ContentSyncInitiated', (syncId, workId, creator, contentType, contentHash) => {
  console.log(`同步开始: ${syncId}`);
});

cyberGraphSync.on('ContentSynced', (syncId, cyberGraphId, timestamp) => {
  console.log(`同步完成: ${syncId} -> ${cyberGraphId}`);
});

cyberGraphSync.on('CreatorProfileUpdated', (creator, cyberGraphHandle, timestamp) => {
  console.log(`档案更新: ${creator} -> ${cyberGraphHandle}`);
});
```

## 安全注意事项

1. **私钥安全**: 确保中继服务的私钥安全存储
2. **权限控制**: 只有授权地址可以确认同步和标记失败
3. **费用管理**: 定期提取合约中的同步费用
4. **监控**: 监控中继服务的运行状态和同步成功率

## 故障排除

### 常见问题

1. **部署失败**: 检查 Solidity 版本兼容性（需要 ^0.8.20）
2. **同步失败**: 检查中继服务是否正常运行
3. **权限错误**: 确保调用者是作品的创作者
4. **费用不足**: 确保发送足够的 ETH 作为同步费用

### 日志查看

```bash
# 查看中继服务日志
tail -f cybergraph-relay.log

# 查看合约事件
npx hardhat run scripts/monitor-events.js --network <network>
```

## 网络配置

### 测试网络

- **Sepolia**: 适合开发测试
- **ZetaChain Testnet**: 跨链功能测试

### 主网络

- **Ethereum Mainnet**: 生产环境
- **ZetaChain Mainnet**: 跨链生产环境

## 相关文档

- [CyberGraph API 文档](https://docs.cybergraph.io)
- [whichWitch 合约架构](./CONTRACT_ARCHITECTURE.md)
- [部署检查清单](../DEPLOYMENT_CHECKLIST.md)