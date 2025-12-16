# WhichWitch 合约系统架构 v2.0

## 概述

WhichWitch 项目已升级为支持NFT铸造、跨链支付和完整版税分配的综合创作平台。系统分为两个主要部分：Base链上的核心功能和ZetaChain上的跨链支付处理。

## 核心功能

### 1. 作品创作权NFT化
- 每个上传的作品可以铸造为NFT，代表创作权
- NFT可以在市场上买卖
- **NFT销售收入即时到账**，不存储在合约中

### 2. 二创授权系统（保留原功能）
- 创作者可以为作品设置授权费
- 用户支付授权费后可以创建二创作品
- **授权费存储在合约中**，统一提现时收取3.5%手续费

### 3. NFT交易市场
- NFT持有者可以上架出售
- 买家可以购买NFT获得创作权
- **版税即时分配**，平台收取2.5%交易费

### 4. 跨链支付系统
- 通过ZetaChain支持全链支付
- 支持授权费支付、NFT购买和打赏
- 统一的跨链支付体验

## 合约架构

### Base链合约

#### CreationManager.sol
- **功能**: 管理作品注册和创作关系树
- **新增**: 与NFTManager集成
- **关键方法**:
  - `registerOriginalWork()`: 注册原创作品
  - `registerDerivativeWork()`: 注册二创作品
  - `getCreatorChain()`: 获取完整创作者链

#### NFTManager.sol ⭐ 新增
- **功能**: ERC721 NFT合约，代表作品创作权
- **关键方法**:
  - `mintWorkNFT()`: 为作品铸造NFT
  - `getWorkTokenId()`: 获取作品对应的NFT ID
  - `isWorkNFTMinted()`: 检查作品是否已铸造NFT

#### NFTMarketplace.sol ⭐ 新增
- **功能**: NFT交易市场，支持即时版税分配
- **特点**: NFT销售收入即时到账，不存储在合约中
- **关键方法**:
  - `listToken()`: 上架NFT
  - `buyToken()`: 购买NFT (即时分配版税)
  - `cancelListing()`: 取消上架
  - `getActiveListings()`: 获取活跃listings

#### RoyaltyManager.sol ⭐ 新增
- **功能**: 授权费版税分配逻辑 (NFT销售已改为即时到账)
- **分配规则**:
  - 授权费: 40%直接创作者 + 40%原创作者 + 20%中间创作者
- **关键方法**:
  - `distributeAuthorizationRoyalty()`: 分配授权费版税
  - `withdraw()`: 用户提取收益 (收取3.5%手续费)

#### PaymentManager.sol (升级)
- **功能**: 保持原有功能，集成RoyaltyManager
- **升级**: 委托版税分配给RoyaltyManager以保持一致性

#### AuthorizationManager.sol (保持不变)
- **功能**: 管理二创授权和许可费支付
- **保持**: 原有所有功能不变

### ZetaChain合约

#### ZetaPaymentManager.sol ⭐ 新增
- **功能**: 全链支付处理器
- **支持的支付类型**:
  - 授权费支付
  - NFT购买
  - 创作者打赏
- **关键方法**:
  - `initiateAuthorizationPayment()`: 发起授权费跨链支付
  - `initiateNFTPurchasePayment()`: 发起NFT购买跨链支付
  - `initiateTipPayment()`: 发起打赏跨链支付

## 版税分配机制

### NFT销售版税 (即时到账)
```
总金额 = 100%
├── 卖家: 70% (即时到账)
├── 原创作者: 20% (即时到账)
└── 中间创作者: 10% (即时到账，平均分配)
```

### 授权费分配 (存储在合约中)
```
总金额 = 100%
├── 直接创作者: 40% (存储在合约)
├── 原创作者: 40% (存储在合约)
└── 中间创作者: 20% (存储在合约，平均分配)
```

### 平台费用
- NFT交易: 2.5% 平台费 (即时收取)
- 授权费和打赏提取: 3.5% 手续费

## 使用流程

### 1. 作品上传和NFT铸造
```solidity
// 1. 注册作品
uint256 workId = creationManager.registerOriginalWork(
    licenseFee,
    derivativeAllowed,
    metadataURI
);

// 2. 铸造NFT
uint256 tokenId = nftManager.mintWorkNFT(workId, tokenURI);

// 3. 上架NFT (可选)
nftMarketplace.listToken(tokenId, price);
```

### 2. 二创授权
```solidity
// 1. 支付授权费
authorizationManager.requestAuthorization{value: licenseFee}(workId);

// 2. 注册二创作品
uint256 derivativeWorkId = creationManager.registerDerivativeWork(
    parentWorkId,
    licenseFee,
    derivativeAllowed,
    metadataURI
);
```

### 3. NFT购买
```solidity
// 购买NFT (版税即时到账)
nftMarketplace.buyToken{value: price}(tokenId);
```

### 4. 跨链支付
```solidity
// 从任意链支付授权费
zetaPaymentManager.initiateAuthorizationPayment{value: amount}(
    targetChainId,
    targetContract,
    workId
);
```

## 部署配置

### 部署顺序
1. **Base链基础合约**: CreationManager → PaymentManager → AuthorizationManager
2. **Base链NFT合约**: NFTManager → RoyaltyManager → NFTMarketplace
3. **合约关系配置**: 设置各合约间的地址引用
4. **ZetaChain合约**: ZetaPaymentManager
5. **跨链配置**: 设置支持的链和中继器

### 关键配置
```solidity
// 设置合约关系
creationManager.setAuthorizationManager(authorizationManager);
creationManager.setNFTManager(nftManager);
paymentManager.setRoyaltyManager(royaltyManager);
nftManager.setCreationManager(creationManager);
// ... 其他配置
```

## 安全特性

- **重入攻击防护**: 所有涉及ETH转账的函数使用ReentrancyGuard
- **权限控制**: 严格的合约间调用权限管理
- **输入验证**: 全面的参数验证和错误处理
- **紧急机制**: 紧急提取和暂停功能
- **Gas优化**: 自定义错误和优化的数据结构

## 监控和维护

- **事件监听**: 完整的事件日志用于链下处理
- **余额监控**: 实时监控合约和用户余额
- **跨链状态**: 跨链支付状态追踪
- **异常处理**: 完善的错误处理和恢复机制

## 升级说明

本次升级完全向后兼容，保留了所有原有功能：
- ✅ 原有的二创授权系统完全保留
- ✅ 原有的支付和分润逻辑保持不变
- ✅ 新增NFT功能不影响现有工作流
- ✅ 跨链支付作为额外选项，不替代原有支付方式

## 技术栈

- **Solidity**: ^0.8.20
- **OpenZeppelin**: 安全的合约库
- **ZetaChain**: 跨链互操作性
- **ERC721**: NFT标准
- **ReentrancyGuard**: 重入攻击防护

## 下一步开发

1. 前端集成新的NFT功能
2. ZetaChain跨链桥集成
3. 移动端支持
4. 高级版税分配策略
5. 社区治理功能