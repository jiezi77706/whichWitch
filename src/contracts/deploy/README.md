# WhichWitch 合约部署指南

## 概述

这个目录包含了部署 WhichWitch 合约系统的所有必要文件和脚本。

## 文件说明

- `DeploymentScript.sol` - 部署说明文档
- `deploy.js` - Hardhat 部署脚本
- `Deploy.s.sol` - Foundry 部署脚本
- `config.example.json` - 配置文件示例
- `README.md` - 本文件

## 部署步骤

### 方法一：使用 Hardhat

1. **安装依赖**
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

2. **配置 hardhat.config.js**
```javascript
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY]
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

3. **设置环境变量**
```bash
export PRIVATE_KEY="your_private_key_here"
export PLATFORM_WALLET="0x1234567890123456789012345678901234567890"
```

4. **运行部署脚本**
```bash
# 部署到 Base Sepolia 测试网
npx hardhat run deploy/deploy.js --network base-sepolia

# 部署到 Base 主网
npx hardhat run deploy/deploy.js --network base
```

### 方法二：使用 Foundry

1. **安装 Foundry**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **设置环境变量**
```bash
export PRIVATE_KEY="your_private_key_here"
export PLATFORM_WALLET="0x1234567890123456789012345678901234567890"
```

3. **运行部署脚本**
```bash
# 部署到 Base Sepolia 测试网
forge script deploy/Deploy.s.sol --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY --broadcast

# 部署到 Base 主网
forge script deploy/Deploy.s.sol --rpc-url https://mainnet.base.org --private-key $PRIVATE_KEY --broadcast
```

## 配置说明

### 合约关系配置

部署完成后，脚本会自动配置以下合约关系：

```solidity
// CreationManager 配置
creationManager.setAuthorizationManager(authorizationManagerAddress);
creationManager.setNFTManager(nftManagerAddress);

// PaymentManager 配置
paymentManager.setAuthorizationManager(authorizationManagerAddress);
paymentManager.setRoyaltyManager(royaltyManagerAddress);

// NFTManager 配置
nftManager.setCreationManager(creationManagerAddress);
nftManager.setRoyaltyManager(royaltyManagerAddress);

// RoyaltyManager 配置
royaltyManager.setPaymentManager(paymentManagerAddress);
```

### 为什么需要这些配置？

1. **CreationManager** 需要知道 AuthorizationManager 的地址来验证用户是否有权限创建二创作品
2. **CreationManager** 需要知道 NFTManager 的地址来支持 NFT 铸造功能
3. **PaymentManager** 需要知道 AuthorizationManager 的地址来接收授权费支付
4. **PaymentManager** 需要知道 RoyaltyManager 的地址来委托版税分配
5. **NFTManager** 需要知道 CreationManager 的地址来获取作品信息
6. **NFTManager** 需要知道 RoyaltyManager 的地址来处理版税
7. **RoyaltyManager** 需要知道 PaymentManager 的地址来接收授权费分配

## 部署后验证

部署完成后，脚本会自动验证配置是否正确。你也可以手动验证：

```javascript
// 检查 CreationManager 配置
const authManager = await creationManager.authorizationManager();
const nftManager = await creationManager.nftManager();
console.log("AuthorizationManager:", authManager);
console.log("NFTManager:", nftManager);

// 检查其他合约配置...
```

## 安全注意事项

1. **私钥安全**: 永远不要在代码中硬编码私钥，使用环境变量
2. **平台钱包**: 使用多签钱包作为平台钱包以提高安全性
3. **测试网测试**: 在主网部署前，先在测试网充分测试
4. **Gas 费用**: 部署需要消耗 Gas，确保账户有足够的 ETH
5. **合约验证**: 部署后在区块链浏览器上验证合约代码

## 部署成本估算

基于当前的合约复杂度，预估的 Gas 消耗：

- CreationManager: ~2,500,000 gas
- PaymentManager: ~2,000,000 gas
- AuthorizationManager: ~1,500,000 gas
- NFTManager: ~3,000,000 gas
- RoyaltyManager: ~2,000,000 gas
- NFTMarketplace: ~2,500,000 gas
- 配置交易: ~500,000 gas

**总计约 14,000,000 gas**

在 Base 网络上（gas price ~0.001 gwei），总成本约 $0.01-0.1

## 故障排除

### 常见问题

1. **"Already set" 错误**: 某些配置函数只能调用一次，如果重复部署可能遇到此错误
2. **"Invalid address" 错误**: 检查所有地址是否正确，特别是平台钱包地址
3. **Gas 不足**: 增加 gas limit 或检查账户余额
4. **网络连接**: 确保 RPC URL 正确且网络稳定

### 重新部署

如果需要重新部署某个合约：

1. 部署新合约
2. 调用相关的设置函数更新地址
3. 更新前端配置文件中的合约地址

## 后续步骤

部署完成后：

1. 保存 `deployed-addresses.json` 文件
2. 更新前端配置文件
3. 在区块链浏览器上验证合约
4. 进行功能测试
5. 设置监控和告警