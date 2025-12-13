# whichWitch API 文档

## 基础信息

- **Base URL**: `http://localhost:3001` (开发环境)
- **Content-Type**: `application/json`
- **网络**: ZetaChain 测试网 (Chain ID: 7001)

## 认证

目前 API 不需要认证，但建议在生产环境中实现 JWT 认证。

## 响应格式

所有 API 响应都遵循以下格式：

```json
{
  "success": true,
  "data": {}, // 成功时的数据
  "error": "错误信息" // 失败时的错误信息
}
```

## API 端点

### 系统相关

#### 健康检查
```
GET /api/health
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "message": "whichWitch API is running",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "network": "ZetaChain Testnet",
    "contracts": {
      "CreationManager": "0x944b55A957d63970506E1733fA5ccD4342d19FC8",
      "NFTManager": "0x8C46877629FeA27ced23345Ab8E9EeCb4c302C0c",
      "NFTMarketplace": "0x8A4664807daFa6017Aa1dE55bf974E9515c6eFb1"
    }
  }
}
```

### 区块链相关

#### 获取网络状态
```
GET /api/blockchain/network/status
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "network": "ZetaChain Testnet",
    "chainId": 7001,
    "rpcUrl": "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
    "walletAddress": "0x...",
    "balance": "1.234",
    "platformFee": 250,
    "contracts": {
      "CreationManager": "0x944b55A957d63970506E1733fA5ccD4342d19FC8",
      "NFTManager": "0x8C46877629FeA27ced23345Ab8E9EeCb4c302C0c"
    }
  }
}
```

#### 创建作品
```
POST /api/blockchain/works
```

**请求体**:
```json
{
  "title": "作品标题",
  "description": "作品描述",
  "contentHash": "QmIPFSHash...",
  "price": "0.1",
  "isPublic": true
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "workId": "1",
    "txHash": "0x...",
    "blockNumber": 12345
  }
}
```

#### 获取作品信息
```
GET /api/blockchain/works/:workId
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "creator": "0x...",
    "price": "0.1",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "isPublic": true,
    "exists": true
  }
}
```

#### 获取用户作品列表
```
GET /api/blockchain/users/:address/works
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "creator": "0x...",
      "price": "0.1",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isPublic": true
    }
  ]
}
```

#### 铸造 NFT
```
POST /api/blockchain/nfts/mint
```

**请求体**:
```json
{
  "to": "0x...",
  "workId": "1",
  "tokenURI": "https://api.whichwitch.com/metadata/1"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "tokenId": "1",
    "txHash": "0x...",
    "blockNumber": 12345
  }
}
```

#### 获取 NFT 信息
```
GET /api/blockchain/nfts/:tokenId
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "tokenId": "1",
    "owner": "0x...",
    "tokenURI": "https://api.whichwitch.com/metadata/1",
    "workId": "1"
  }
}
```

### 市场相关

#### 上架 NFT
```
POST /api/blockchain/marketplace/list
```

**请求体**:
```json
{
  "tokenId": "1",
  "price": "0.5"
}
```

#### 购买 NFT
```
POST /api/blockchain/marketplace/buy
```

**请求体**:
```json
{
  "tokenId": "1",
  "price": "0.5"
}
```

#### 获取市场上架列表
```
GET /api/blockchain/marketplace/listings
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "tokenId": "1",
      "owner": "0x...",
      "tokenURI": "https://...",
      "workId": "1",
      "seller": "0x...",
      "price": "0.5",
      "isActive": true
    }
  ]
}
```

### 支付相关

#### 处理支付
```
POST /api/blockchain/payments/process
```

**请求体**:
```json
{
  "buyer": "0x...",
  "seller": "0x...",
  "amount": "0.1",
  "workId": "1"
}
```

### 交易相关

#### 获取交易状态
```
GET /api/blockchain/transactions/:txHash
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "status": "success", // "pending" | "success" | "failed"
    "blockNumber": 12345,
    "gasUsed": "21000",
    "effectiveGasPrice": "1000000000"
  }
}
```

#### 获取账户余额
```
GET /api/blockchain/accounts/:address/balance
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "balance": "1.234",
    "currency": "ZETA"
  }
}
```

### AI 相关

#### AI 查询
```
POST /api/ai/query
```

**请求体**:
```json
{
  "message": "用户查询内容",
  "context": "可选的上下文信息"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "response": "AI 回复内容",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 错误处理

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

### 常见错误码

- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

### 区块链相关错误

- `insufficient funds`: 余额不足
- `transaction reverted`: 交易被回滚
- `network error`: 网络连接错误
- `contract not found`: 合约不存在

## 使用示例

### JavaScript/TypeScript

```javascript
// 使用 fetch API
const response = await fetch('http://localhost:3001/api/blockchain/network/status');
const data = await response.json();

if (data.success) {
  console.log('网络状态:', data.data);
} else {
  console.error('错误:', data.error);
}

// 使用项目中的 API 客户端
import { transactionAPI } from '../lib/api';

try {
  const networkStatus = await blockchainAPI.getNetworkStatus();
  console.log('网络状态:', networkStatus.data);
} catch (error) {
  console.error('获取网络状态失败:', error.message);
}
```

### cURL

```bash
# 获取网络状态
curl -X GET http://localhost:3001/api/blockchain/network/status

# 创建作品
curl -X POST http://localhost:3001/api/blockchain/works \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试作品",
    "description": "这是一个测试作品",
    "contentHash": "QmTest123",
    "price": "0.1",
    "isPublic": true
  }'
```

## 开发注意事项

1. **网络配置**: 确保连接到正确的网络 (ZetaChain 测试网)
2. **Gas 费用**: 所有交易都需要支付 ZETA 作为 Gas 费用
3. **异步操作**: 区块链交易是异步的，需要等待确认
4. **错误处理**: 妥善处理网络错误和交易失败情况
5. **数据验证**: 在发送交易前验证所有参数

## 测试工具

- **Postman**: 用于 API 测试
- **区块浏览器**: https://zetachain-athens-3.blockscout.com
- **测试页面**: http://localhost:3000/test-web3

## 相关文档

- [设置指南](./SETUP_GUIDE.md)
- [合约架构](./CONTRACT_ARCHITECTURE.md)
- [前端集成](./FRONTEND_INTEGRATION.md)