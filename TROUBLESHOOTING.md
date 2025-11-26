# 🔧 故障排查指南

## 问题：注册失败

### 🔍 诊断步骤

#### 1. 检查浏览器控制台错误
1. 打开你的 Vercel 部署网站
2. 按 `F12` 打开开发者工具
3. 切换到 **Console** 标签
4. 尝试注册
5. 查看是否有红色错误信息

**常见错误**：
- `Failed to fetch` - 网络问题或 Supabase 连接失败
- `relation "users" does not exist` - 数据库表未创建
- `permission denied` - RLS 策略问题
- `duplicate key value` - 钱包地址或平台 ID 已存在

#### 2. 检查 Supabase 数据库

**步骤 A: 确认表已创建**
1. 访问：https://supabase.com/dashboard
2. 选择项目：`csdhiozlgawtjsfglglh`
3. 点击 **Table Editor**
4. 确认以下表存在：
   - ✅ users
   - ✅ works
   - ✅ folders
   - ✅ collections
   - ✅ authorization_requests

**步骤 B: 测试数据库连接**
1. 在 Supabase 点击 **SQL Editor**
2. 运行测试查询：
```sql
SELECT * FROM users LIMIT 1;
```
3. 如果显示 "Success" 或 "0 rows"，说明表存在
4. 如果显示错误，需要运行初始化脚本

#### 3. 检查 Vercel 环境变量

1. 访问：https://vercel.com
2. 进入你的项目
3. 点击 **Settings** → **Environment Variables**
4. 确认以下变量存在且正确：

```
NEXT_PUBLIC_SUPABASE_URL=https://csdhiozlgawtjsfglglh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**如果修改了环境变量**：
1. 点击 **Deployments**
2. 点击最新部署右侧的 **...** 菜单
3. 选择 **Redeploy**

#### 4. 检查 Supabase RLS 策略

如果表存在但仍然无法注册，可能是 RLS 策略问题。

**临时解决方案（仅用于测试）**：
1. 在 Supabase SQL Editor 中运行：
```sql
-- 临时禁用 RLS（仅用于测试）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

2. 尝试注册
3. 如果成功，说明是 RLS 策略问题
4. 重新启用 RLS：
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

**永久解决方案**：
运行完整的数据库初始化脚本（见 `SUPABASE_SETUP.md`）

---

## 🐛 常见问题和解决方案

### 问题 1: "relation 'users' does not exist"
**原因**: 数据库表未创建  
**解决**: 运行 `SUPABASE_SETUP.md` 中的 SQL 脚本

### 问题 2: "permission denied for table users"
**原因**: RLS 策略配置错误  
**解决**: 
1. 检查 Supabase 中的 RLS 策略
2. 确保运行了完整的初始化脚本
3. 临时禁用 RLS 测试（见上面）

### 问题 3: "duplicate key value violates unique constraint"
**原因**: 钱包地址已注册  
**解决**: 
1. 检查数据库中是否已有该钱包地址
2. 如果是测试，可以删除该记录：
```sql
DELETE FROM users WHERE wallet_address = '0x你的钱包地址';
```

### 问题 4: "Failed to fetch" 或网络错误
**原因**: 
- Supabase URL 或 API Key 错误
- 网络连接问题
- CORS 问题

**解决**:
1. 检查 Vercel 环境变量
2. 检查 Supabase 项目是否暂停
3. 在 Supabase Dashboard 检查 API 设置

### 问题 5: 钱包连接成功但注册按钮无响应
**原因**: JavaScript 错误  
**解决**:
1. 检查浏览器控制台错误
2. 清除浏览器缓存
3. 尝试硬刷新（Ctrl+Shift+R 或 Cmd+Shift+R）

---

## 📊 完整诊断流程

```
1. 打开浏览器控制台 (F12)
   ↓
2. 连接钱包
   ↓
3. 填写注册信息
   ↓
4. 点击注册
   ↓
5. 查看控制台错误信息
   ↓
6. 根据错误类型：
   ├─ "relation does not exist" → 运行数据库初始化脚本
   ├─ "permission denied" → 检查 RLS 策略
   ├─ "duplicate key" → 删除旧记录或使用新钱包
   └─ "Failed to fetch" → 检查环境变量和网络
```

---

## 🆘 还是无法解决？

提供以下信息：
1. 浏览器控制台的完整错误信息（截图）
2. Supabase Table Editor 的截图（显示表列表）
3. Vercel 环境变量的截图（隐藏敏感信息）
4. 你的钱包地址（前6位和后4位）

我会帮你进一步诊断！