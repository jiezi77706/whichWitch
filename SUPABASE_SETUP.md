# 🗄️ Supabase 数据库初始化指南

## ⚠️ 重要：必须先初始化数据库才能使用注册功能！

### 📋 步骤 1: 登录 Supabase

1. 访问：https://supabase.com/dashboard
2. 登录你的账号
3. 选择项目：`csdhiozlgawtjsfglglh`

### 📋 步骤 2: 打开 SQL Editor

1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New Query** 创建新查询

### 📋 步骤 3: 执行数据库脚本

复制以下完整的 SQL 脚本并执行：

```sql
-- WhichWitch 数据库表结构
-- 在 Supabase SQL Editor 中运行此文件

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  platform_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  bio TEXT,
  skills TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_platform_id ON users(platform_id);

-- ============================================
-- 2. 作品表（链下元数据）
-- ============================================
CREATE TABLE IF NOT EXISTS works (
  id SERIAL PRIMARY KEY,
  work_id BIGINT UNIQUE NOT NULL,
  creator_address VARCHAR(42) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  story TEXT,
  image_url TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  material TEXT[],
  tags TEXT[],
  allow_remix BOOLEAN DEFAULT true,
  license_fee VARCHAR(50),
  parent_work_id BIGINT,
  is_remix BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (parent_work_id) REFERENCES works(work_id) ON DELETE SET NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_works_work_id ON works(work_id);
CREATE INDEX IF NOT EXISTS idx_works_creator ON works(creator_address);
CREATE INDEX IF NOT EXISTS idx_works_parent ON works(parent_work_id);
CREATE INDEX IF NOT EXISTS idx_works_created_at ON works(created_at DESC);

-- ============================================
-- 3. 收藏夹文件夹表
-- ============================================
CREATE TABLE IF NOT EXISTS folders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_id);

-- ============================================
-- 4. 收藏表
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  work_id BIGINT NOT NULL,
  folder_id INTEGER NOT NULL,
  note TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
  UNIQUE(user_id, work_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_work ON collections(work_id);
CREATE INDEX IF NOT EXISTS idx_collections_folder ON collections(folder_id);

-- ============================================
-- 5. 授权请求表
-- ============================================
CREATE TABLE IF NOT EXISTS authorization_requests (
  id SERIAL PRIMARY KEY,
  requester_address VARCHAR(42) NOT NULL,
  work_id BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  tx_hash VARCHAR(66),
  error_message TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE,
  UNIQUE(requester_address, work_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_auth_requests_requester ON authorization_requests(requester_address);
CREATE INDEX IF NOT EXISTS idx_auth_requests_work ON authorization_requests(work_id);
CREATE INDEX IF NOT EXISTS idx_auth_requests_status ON authorization_requests(status);

-- ============================================
-- 6. 更新时间戳触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_works_updated_at ON works;
CREATE TRIGGER update_works_updated_at
  BEFORE UPDATE ON works
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_auth_requests_updated_at ON authorization_requests;
CREATE TRIGGER update_auth_requests_updated_at
  BEFORE UPDATE ON authorization_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. RLS (Row Level Security) 策略
-- ============================================
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_requests ENABLE ROW LEVEL SECURITY;

-- 用户表策略：所有人可读，只能更新自己的数据
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);

-- 作品表策略：所有人可读，创作者可以更新
CREATE POLICY "Works are viewable by everyone" ON works
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert works" ON works
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update own works" ON works
  FOR UPDATE USING (true);

-- 文件夹策略：用户只能看到和操作自己的文件夹
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own folders" ON folders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (true);

-- 收藏策略：用户只能看到和操作自己的收藏
CREATE POLICY "Users can view own collections" ON collections
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own collections" ON collections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (true);

-- 授权请求策略：所有人可读，可以创建和更新
CREATE POLICY "Authorization requests are viewable by everyone" ON authorization_requests
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create authorization requests" ON authorization_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update authorization requests" ON authorization_requests
  FOR UPDATE USING (true);

-- ============================================
-- 完成！
-- ============================================
-- 数据库初始化完成
-- 现在可以使用 WhichWitch DApp 了
```

### 📋 步骤 4: 执行脚本

1. 将上面的 SQL 脚本粘贴到 SQL Editor 中
2. 点击右下角的 **Run** 按钮
3. 等待执行完成（应该显示 "Success"）

### 📋 步骤 5: 验证表是否创建成功

1. 在左侧菜单点击 **Table Editor**
2. 你应该看到以下表：
   - ✅ users
   - ✅ works
   - ✅ folders
   - ✅ collections
   - ✅ authorization_requests

### 🎉 完成！

现在回到你的 Vercel 部署的网站，重新尝试注册，应该可以成功了！

### 🐛 如果还是失败

检查浏览器控制台（F12）的错误信息，可能的原因：
1. 环境变量配置错误
2. Supabase RLS 策略问题
3. 网络连接问题

需要帮助？把错误信息发给我！