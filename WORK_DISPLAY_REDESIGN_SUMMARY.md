# 作品显示和授权系统重新设计

## 第一部分：上传页面授权逻辑修改

### ✅ 已完成的修改

1. **强制许可证选择**
   - 当用户选择"Allow Remixing"时，必须选择许可证类型才能上传
   - 添加了红色警告提示："⚠️ License Required - Please select a license type to enable remixing"
   - 上传按钮在未选择许可证时被禁用

2. **许可证信息保存到数据库**
   - 修改了`WorkUploadData`接口，添加`licenseSelection`字段
   - 更新了`work-upload.service.ts`，将许可证信息传递给API
   - 修改了`/api/works/create`路由，调用数据库函数保存许可证信息
   - 使用现有的`save_work_license`数据库函数保存许可证选项

3. **数据库集成**
   - 利用现有的`license_options`和`work_licenses`表
   - 许可证信息包括：商业使用、衍生作品、NFT铸造、ShareAlike等选项
   - 自动匹配预定义的许可证类型（CC BY, CC BY-NC等）

### 文件修改列表
- `components/whichwitch/upload-view.tsx` - 添加许可证验证逻辑
- `lib/services/work-upload.service.ts` - 添加许可证数据传递
- `lib/supabase/services/work.service.ts` - 更新接口定义
- `app/api/works/create/route.ts` - 添加许可证保存逻辑

## 第二部分：作品显示页面重新设计

### ✅ 广场页面（Square View）优化

**问题**：按钮过于拥挤，影响视觉效果

**解决方案**：
- 在广场页面只显示图标按钮，不显示文字
- 保留hover提示（title属性）
- 按钮包括：
  - 🔀 Remix请求（GitFork图标）
  - 🛡️ AI内容审核（Shield图标）  
  - 📚 收藏作品（Bookmark图标）

### ✅ 作品详情页面重新布局

按照您的要求，重新组织了详情页面的信息层次：

#### 1. 作品基本信息
- 作品标题和作者
- 作品描述/故事
- 材料信息
- 关键词标签

#### 2. 授权类型信息
- 显示是否允许Remix
- 显示许可证类型和费用
- 区分"Remixing Allowed"和"All Rights Reserved"

#### 3. 用户行为按钮
- ❤️ 点赞（Like）
- 📚 收藏（Collect）
- 🔀 请求Remix（Request Remix）
- 💰 打赏创作者（Tip Creator）

#### 4. 作者行为按钮（仅作者可见）
- 🛡️ AI内容审核（AI Content Review）
- 🎨 铸造NFT（Mint as NFT）
- 🛒 上架销售（List for Sale）
- ⛓️ 上链铸造（Mint to Blockchain）

#### 5. NFT状态显示（非作者用户）
- NFT状态徽章
- 购买NFT按钮（如果在售）
- NFT查看状态

#### 6. Creation Genealogy
- 保持原有的家谱树显示
- 显示衍生作品统计

### 权限控制逻辑

```typescript
// 作者权限检查
work.creator_address?.toLowerCase() === address?.toLowerCase()
```

- **作者**：可以看到所有创作者行为按钮
- **非作者**：只能看到用户行为按钮和NFT购买选项

### 文件修改列表
- `components/whichwitch/work-card.tsx` - 重新设计布局和权限控制

## 技术实现细节

### 1. 许可证数据流
```
Upload Form → WorkUploadData → work-upload.service → API Route → Database
```

### 2. 权限显示逻辑
```
Square View: 只显示图标
Detail View: 
  - 基本信息
  - 授权信息  
  - 用户行为
  - 作者行为（条件显示）
  - NFT状态
  - 家谱树
```

### 3. 数据库结构
- `works` 表：基本作品信息
- `work_licenses` 表：许可证选择
- `license_options` 表：预定义许可证类型

## 用户体验改进

### 上传流程
1. 用户选择"Allow Remixing"
2. **必须**选择许可证类型（新增强制要求）
3. 许可证信息自动保存到数据库
4. 前端显示选中的许可证详情

### 浏览体验
1. **广场页面**：简洁的图标按钮，不占用过多空间
2. **详情页面**：清晰的信息层次，按功能分组
3. **权限控制**：作者和普通用户看到不同的操作选项

## 下一步计划

### 需要完善的功能
1. **许可证信息显示**：在详情页面显示具体的许可证类型和条款
2. **许可证查询**：从数据库读取并显示作品的许可证信息
3. **视觉优化**：进一步优化按钮布局和间距
4. **响应式设计**：确保在不同屏幕尺寸下的良好显示

### API端点需要添加
- `GET /api/works/[id]/license` - 获取作品许可证信息
- `PUT /api/works/[id]/license` - 更新作品许可证信息

### 前端组件需要完善
- 许可证信息显示组件
- 许可证编辑组件（作者专用）
- 响应式布局优化

## 测试建议

### 上传流程测试
1. 测试不选择许可证时无法上传
2. 测试选择不同许可证类型的保存
3. 验证许可证信息正确保存到数据库

### 显示效果测试
1. 在广场页面验证图标按钮显示
2. 在详情页面验证信息层次
3. 测试作者/非作者权限显示差异
4. 验证各种屏幕尺寸下的显示效果