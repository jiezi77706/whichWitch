# 智能合约修复总结

## 修复的问题

### 1. ✅ Tip 功能错误
**问题**: 前端调用 `processPayment` 但合约中只有 `tipCreator`
**修复**: 
- 在 `PaymentManager.sol` 中添加 `processPayment(uint256 workId)` 函数
- 该函数从 `CreationManager` 获取作品创作者地址，然后进行打赏
- 保留原有的 `tipCreator(address creator)` 函数用于直接打赏

### 2. ✅ 二创付款失败 - Payment Distribution 错误
**问题**: 
- `AuthorizationManager` 使用 `getCreatorChain` 获取完整创作者链，然后手动排除最后一个
- 收益分配逻辑在边界情况下可能出错

**修复**:
- 修改 `AuthorizationManager.sol` 直接使用 `getAncestors` 获取祖先数组
- 优化 `PaymentManager.sol` 中的 `distributeRevenue` 函数：
  - 明确处理 0 个祖先（原创作品）
  - 明确处理 1 个祖先（只有原创者和直接创作者）
  - 明确处理多个祖先（原创者 + 中间创作者）
  - 修复余数分配逻辑，确保所有金额都被正确分配

### 3. ✅ Withdraw 功能
**问题**: 前端调用 `withdrawRevenue` 但合约函数名是 `withdraw`
**修复**: 更新前端代码使用正确的函数名 `withdraw`

## 收益分配逻辑

### 场景 1: 原创作品（无祖先）
- 直接创作者: 40%
- 其余 60% 也给直接创作者

### 场景 2: 一级衍生（1个祖先 - 原创者）
- 直接创作者: 40%
- 原创者: 40% + 20% = 60%

### 场景 3: 多级衍生（多个祖先）
- 直接创作者: 40%
- 原创者: 40%
- 中间祖先平分: 20%

## 合约部署步骤

### 1. 部署顺序
```bash
# 1. 部署 PaymentManager（需要 platform wallet 地址）
forge create src/PaymentManager.sol:PaymentManager \
  --constructor-args <PLATFORM_WALLET_ADDRESS> \
  --private-key <YOUR_PRIVATE_KEY> \
  --rpc-url <RPC_URL>

# 2. 部署 CreationManager（需要 PaymentManager 地址）
forge create src/CreationManager.sol:CreationManager \
  --constructor-args <PAYMENT_MANAGER_ADDRESS> \
  --private-key <YOUR_PRIVATE_KEY> \
  --rpc-url <RPC_URL>

# 3. 部署 AuthorizationManager（需要 CreationManager 和 PaymentManager 地址）
forge create src/AuthorizationManager.sol:AuthorizationManager \
  --constructor-args <CREATION_MANAGER_ADDRESS> <PAYMENT_MANAGER_ADDRESS> \
  --private-key <YOUR_PRIVATE_KEY> \
  --rpc-url <RPC_URL>
```

### 2. 初始化设置
```bash
# 在 PaymentManager 中设置 CreationManager
cast send <PAYMENT_MANAGER_ADDRESS> \
  "setCreationManager(address)" <CREATION_MANAGER_ADDRESS> \
  --private-key <YOUR_PRIVATE_KEY> \
  --rpc-url <RPC_URL>

# 在 PaymentManager 中设置 AuthorizationManager
cast send <PAYMENT_MANAGER_ADDRESS> \
  "setAuthorizationManager(address)" <AUTHORIZATION_MANAGER_ADDRESS> \
  --private-key <YOUR_PRIVATE_KEY> \
  --rpc-url <RPC_URL>

# 在 CreationManager 中设置 AuthorizationManager
cast send <CREATION_MANAGER_ADDRESS> \
  "setAuthorizationManager(address)" <AUTHORIZATION_MANAGER_ADDRESS> \
  --private-key <YOUR_PRIVATE_KEY> \
  --rpc-url <RPC_URL>
```

### 3. 更新前端配置
更新 `src/ui/lib/web3/contracts/addresses.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  creation: '<CREATION_MANAGER_ADDRESS>',
  payment: '<PAYMENT_MANAGER_ADDRESS>',
  authorization: '<AUTHORIZATION_MANAGER_ADDRESS>',
} as const;
```

## 测试验证

### 1. 测试 Tip 功能
```typescript
// 使用 work ID 打赏
await processPayment(BigInt(workId), "0.01")

// 直接打赏创作者
await tipCreator(creatorAddress, "0.01")
```

### 2. 测试二创付款
```typescript
// 申请授权（会自动分配收益）
await requestAuthorization(BigInt(parentWorkId))
```

### 3. 测试提现
```typescript
// 查看余额
const balance = await getCreatorRevenue(address)

// 提现
await withdrawRevenue()
```

## 前端更新内容

1. ✅ 更新 `PaymentManagerABI` 添加新函数
2. ✅ 添加 `tipCreator` 服务函数
3. ✅ 修复 `withdrawRevenue` 函数名
4. ✅ Profile 页面添加 Withdraw 按钮交互

## 注意事项

1. **Platform Wallet**: 部署时需要提供平台钱包地址，用于收取 10% 提现手续费
2. **Gas 优化**: 使用 pull payment 模式，用户需要主动提现
3. **安全性**: 使用 ReentrancyGuard 防止重入攻击
4. **权限控制**: 只有 AuthorizationManager 可以调用 distributeRevenue
