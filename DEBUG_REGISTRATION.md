# 🐛 注册问题调试指南

## 🔍 我刚刚做的修复

1. **修复了 CSP (Content Security Policy) 问题**
   - 添加了 `'unsafe-eval'` 和 `'unsafe-inline'` 到 script-src
   - 允许连接到 Supabase、Alchemy 和 Pinata
   - 代码已推送，Vercel 会自动重新部署

2. **等待 Vercel 重新部署**
   - 大约需要 2-3 分钟
   - 部署完成后再次尝试注册

---

## 📋 手动检查步骤

### 步骤 1: 在浏览器中测试 Supabase 连接

1. 打开你的 Vercel 网站
2. 按 `F12` 打开开发者工具
3. 切换到 **Console** 标签
4. 粘贴并运行以下代码：

```javascript
// 测试 Supabase 连接
fetch('https://csdhiozlgawtjsfglglh.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZGhpb3psZ2F3dGpzZmdsZ2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjg2NzUsImV4cCI6MjA3OTcwNDY3NX0.k4ozRLHddlYyDtRLVFIIDgNAK4OIRRMJ5QQWfsr51VI'
  }
})
.then(r => r.json())
.then(d => console.log('✅ Supabase connected:', d))
.catch(e => console.error('❌ Supabase error:', e))
```

**预期结果**: 应该看到 `✅ Supabase connected:` 和一些数据

---

### 步骤 2: 测试用户表

在浏览器控制台运行：

```javascript
// 测试查询 users 表
fetch('https://csdhiozlgawtjsfglglh.supabase.co/rest/v1/users?select=*&limit=1', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZGhpb3psZ2F3dGpzZmdsZ2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjg2NzUsImV4cCI6MjA3OTcwNDY3NX0.k4ozRLHddlYyDtRLVFIIDgNAK4OIRRMJ5QQWfsr51VI',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZGhpb3psZ2F3dGpzZmdsZ2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjg2NzUsImV4cCI6MjA3OTcwNDY3NX0.k4ozRLHddlYyDtRLVFIIDgNAK4OIRRMJ5QQWfsr51VI'
  }
})
.then(r => r.json())
.then(d => console.log('✅ Users table:', d))
.catch(e => console.error('❌ Users table error:', e))
```

**预期结果**: 应该看到 `✅ Users table:` 和一个空数组 `[]` 或现有用户

---

### 步骤 3: 测试创建用户

在浏览器控制台运行：

```javascript
// 测试创建用户
fetch('https://csdhiozlgawtjsfglglh.supabase.co/rest/v1/users', {
  method: 'POST',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZGhpb3psZ2F3dGpzZmdsZ2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjg2NzUsImV4cCI6MjA3OTcwNDY3NX0.k4ozRLHddlYyDtRLVFIIDgNAK4OIRRMJ5QQWfsr51VI',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZGhpb3psZ2F3dGpzZmdsZ2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjg2NzUsImV4cCI6MjA3OTcwNDY3NX0.k4ozRLHddlYyDtRLVFIIDgNAK4OIRRMJ5QQWfsr51VI',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    wallet_address: '0xtest123456789',
    platform_id: 'WW-TEST001',
    name: 'Test User',
    bio: 'Test bio',
    skills: ['Testing']
  })
})
.then(r => r.json())
.then(d => console.log('✅ User created:', d))
.catch(e => console.error('❌ Create user error:', e))
```

**预期结果**: 应该看到 `✅ User created:` 和新用户的数据

---

## 🔧 可能的问题和解决方案

### 问题 1: CSP 错误仍然存在
**解决**: 
- 等待 Vercel 重新部署完成（2-3分钟）
- 清除浏览器缓存（Ctrl+Shift+Delete）
- 硬刷新页面（Ctrl+Shift+R）

### 问题 2: "permission denied for table users"
**解决**: 在 Supabase SQL Editor 中运行：
```sql
-- 临时禁用 RLS 进行测试
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
```

### 问题 3: "relation 'users' does not exist"
**解决**: 重新运行 `SUPABASE_SETUP.md` 中的完整 SQL 脚本

### 问题 4: 网络错误
**检查**:
1. Supabase 项目是否暂停
2. API 密钥是否正确
3. 网络连接是否正常

---

## 📞 获取详细错误信息

在注册失败后，在浏览器控制台运行：

```javascript
// 查看最近的错误
console.log('Last error:', window.lastError)
```

然后把错误信息发给我，我可以更精确地帮你诊断！

---

## ⏰ 下一步

1. **等待 2-3 分钟** Vercel 重新部署
2. **清除浏览器缓存**
3. **重新尝试注册**
4. **如果还是失败**，运行上面的测试脚本并把结果发给我

祝好运！🍀