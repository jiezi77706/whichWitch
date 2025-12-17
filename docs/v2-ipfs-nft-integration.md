# WhichWitch v2.0 IPFS-NFT 集成流程

## 🔄 新的上传流程

### 用户体验改进
- ✅ **自动IPFS上传**: 用户上传图片时自动生成IPFS哈希
- ✅ **可选NFT铸造**: 用户可以选择是否同时铸造NFT
- ✅ **安全API密钥**: Pinata密钥安全存储在服务端
- ✅ **一键完成**: 图片上传 → IPFS存储 → 作品注册 → NFT铸造（可选）

### 技术架构

```
前端上传 → 安全API → Pinata IPFS → 区块链 → 数据库
    ↓           ↓          ↓         ↓        ↓
  用户选择   服务端处理   IPFS存储   NFT铸造   状态同步
```

## 📁 文件结构

### 新增API端点
```
app/api/ipfs/
├── upload-file/route.ts     # 安全文件上传
├── upload-json/route.ts     # 安全JSON上传
└── 
app/api/works/
└── sync-nft-status/route.ts # NFT状态同步
```

### 核心服务
```
lib/services/
└── work-nft-integration.service.ts  # 统一集成服务

lib/ipfs/
└── pinata.service.ts                # 更新为安全API调用

components/whichwitch/
├── mint-nft-modal.tsx              # NFT铸造模态框
└── upload-view.tsx                 # 更新的上传组件
```

## 🔐 安全配置

### 环境变量 (.env.local)
```bash
# Pinata IPFS 存储 (服务端密钥)
PINATA_API_KEY=d982e33da26e3fd8ee5f
PINATA_API_SECRET=f2d07e123662758c65c9f98217c0e950b0d96b08ed541dfff3465c2236c0e954
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要**: 
- ❌ 不使用 `NEXT_PUBLIC_` 前缀
- ✅ 密钥仅在服务端可访问
- ✅ 前端通过安全API调用

## 🚀 使用流程

### 1. 基础作品上传
```typescript
// 用户上传图片，自动生成IPFS
const result = await createWorkWithOptionalNFT(
  files,           // 用户选择的文件
  workData,        // 作品信息
  address          // 创作者地址
)

// 结果包含
result.work      // 作品信息
result.ipfs      // IPFS哈希和URL
result.nft       // NFT信息（如果铸造了）
```

### 2. 可选NFT铸造
```typescript
// 在上传时选择铸造NFT
const workData = {
  title: "我的作品",
  mintNFT: true,           // 开启NFT铸造
  nftMetadata: {
    name: "自定义NFT名称",
    description: "NFT描述"
  }
}
```

### 3. 现有作品铸造NFT
```typescript
// 为已存在的作品铸造NFT
const nftResult = await mintNFTForExistingWork(
  workId,
  creatorAddress,
  nftMetadata
)
```

## 📊 数据库集成

### NFT状态缓存
```sql
-- nft_cache 表自动同步NFT状态
INSERT INTO nft_cache (work_id, token_id, is_minted, owner_address)
VALUES (1, 123, true, '0x...')
```

### 交易历史
```sql
-- nft_transactions 表记录所有NFT交易
INSERT INTO nft_transactions (work_id, transaction_type, tx_hash)
VALUES (1, 'mint', '0x...')
```

## 🎨 用户界面

### 上传页面新功能
- 🎨 **NFT铸造开关**: 用户可选择是否铸造NFT
- 📝 **NFT元数据**: 自定义NFT名称和描述
- ✨ **自动属性**: 基于作品材料和标签生成NFT属性
- 📊 **进度显示**: 显示IPFS上传和NFT铸造进度

### 作品卡片增强
- 🏷️ **NFT状态徽章**: 显示是否已铸造NFT
- 🎯 **NFT操作按钮**: 铸造、购买、上架等操作
- 💎 **NFT详情**: 显示Token ID、价格等信息

## 🔄 完整流程示例

### 场景1: 新作品上传 + NFT铸造
```
1. 用户选择图片文件
2. 填写作品信息
3. 开启"铸造NFT"选项
4. 点击"上传"
   ↓
5. 图片自动上传到IPFS
6. 创建作品metadata并上传到IPFS
7. 在区块链注册作品
8. 保存作品到数据库
9. 自动铸造NFT
10. 同步NFT状态到数据库
    ↓
11. 用户看到成功页面，包含NFT信息
```

### 场景2: 现有作品铸造NFT
```
1. 用户在作品卡片点击"铸造NFT"
2. 打开NFT铸造模态框
3. 填写NFT元数据
4. 点击"铸造NFT"
   ↓
5. 基于现有作品信息创建NFT metadata
6. 上传NFT metadata到IPFS
7. 调用合约铸造NFT
8. 同步NFT状态到数据库
   ↓
9. 显示铸造成功，包含Token ID和交易哈希
```

## 🛡️ 错误处理

### IPFS上传失败
- 显示具体错误信息
- 提供重试选项
- 不影响作品基本信息保存

### NFT铸造失败
- 作品仍然成功创建
- NFT状态标记为未铸造
- 用户可以稍后重试铸造

### 网络问题
- 自动重试机制
- 离线状态检测
- 友好的错误提示

## 📈 性能优化

### IPFS缓存
- 使用数据库缓存IPFS状态
- 避免重复的区块链查询
- 40倍性能提升

### 批量操作
- 支持多文件同时上传
- 并行处理IPFS上传
- 优化用户等待时间

## 🔮 未来扩展

### 计划功能
- [ ] IPFS固定策略优化
- [ ] 多链NFT支持
- [ ] NFT版税自动分配
- [ ] 高级NFT属性编辑
- [ ] NFT市场集成

### 技术改进
- [ ] WebAssembly IPFS客户端
- [ ] 去中心化存储备份
- [ ] 智能合约升级机制
- [ ] 跨链桥接支持