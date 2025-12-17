-- ============================================
-- WhichWitch v2.0 NFT功能数据库扩展 (修正版)
-- 修复了PostgreSQL函数语法错误
-- ============================================

-- ============================================
-- 1. NFT状态缓存表
-- ============================================
CREATE TABLE IF NOT EXISTS nft_cache (
  work_id BIGINT PRIMARY KEY,
  token_id BIGINT,
  is_minted BOOLEAN DEFAULT false,
  owner_address VARCHAR(42),
  is_listed BOOLEAN DEFAULT false,
  list_price VARCHAR(50), -- ETH价格字符串
  marketplace_listing_id BIGINT,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_nft_cache_work_id ON nft_cache(work_id);
CREATE INDEX IF NOT EXISTS idx_nft_cache_token_id ON nft_cache(token_id);
CREATE INDEX IF NOT EXISTS idx_nft_cache_owner ON nft_cache(owner_address);
CREATE INDEX IF NOT EXISTS idx_nft_cache_listed ON nft_cache(is_listed);

-- ============================================
-- 2. NFT交易历史表
-- ============================================
CREATE TABLE IF NOT EXISTS nft_transactions (
  id SERIAL PRIMARY KEY,
  work_id BIGINT NOT NULL,
  token_id BIGINT NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- mint, list, buy, cancel, transfer
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  price VARCHAR(50), -- ETH价格字符串
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price VARCHAR(50),
  platform_fee VARCHAR(50), -- 平台费用
  royalty_amount VARCHAR(50), -- 版税金额
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_nft_tx_work_id ON nft_transactions(work_id);
CREATE INDEX IF NOT EXISTS idx_nft_tx_token_id ON nft_transactions(token_id);
CREATE INDEX IF NOT EXISTS idx_nft_tx_type ON nft_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_nft_tx_from ON nft_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_nft_tx_to ON nft_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_nft_tx_hash ON nft_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_nft_tx_created ON nft_transactions(created_at DESC);

-- ============================================
-- 3. 版税分配记录表
-- ============================================
CREATE TABLE IF NOT EXISTS royalty_distributions (
  id SERIAL PRIMARY KEY,
  work_id BIGINT NOT NULL,
  transaction_id INTEGER, -- 关联NFT交易
  distribution_type VARCHAR(20) NOT NULL, -- nft_sale, authorization_fee, tip
  total_amount VARCHAR(50) NOT NULL, -- 总金额
  recipients JSONB NOT NULL, -- 接收者和金额 [{"address": "0x...", "amount": "0.1", "role": "seller"}]
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES nft_transactions(id) ON DELETE SET NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_royalty_work_id ON royalty_distributions(work_id);
CREATE INDEX IF NOT EXISTS idx_royalty_type ON royalty_distributions(distribution_type);
CREATE INDEX IF NOT EXISTS idx_royalty_tx_hash ON royalty_distributions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_royalty_created ON royalty_distributions(created_at DESC);

-- ============================================
-- 4. 跨链支付记录表
-- ============================================
CREATE TABLE IF NOT EXISTS cross_chain_payments (
  id SERIAL PRIMARY KEY,
  work_id BIGINT,
  payment_type VARCHAR(20) NOT NULL, -- authorization, tip, nft_purchase
  source_chain_id INTEGER NOT NULL,
  target_chain_id INTEGER NOT NULL,
  source_tx_hash VARCHAR(66) NOT NULL,
  target_tx_hash VARCHAR(66),
  zeta_tx_hash VARCHAR(66),
  amount VARCHAR(50) NOT NULL,
  source_token VARCHAR(42), -- 源链代币地址
  target_token VARCHAR(42), -- 目标链代币地址
  sender_address VARCHAR(42) NOT NULL,
  recipient_address VARCHAR(42) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed, reverted
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE SET NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cross_chain_work_id ON cross_chain_payments(work_id);
CREATE INDEX IF NOT EXISTS idx_cross_chain_source_tx ON cross_chain_payments(source_tx_hash);
CREATE INDEX IF NOT EXISTS idx_cross_chain_target_tx ON cross_chain_payments(target_tx_hash);
CREATE INDEX IF NOT EXISTS idx_cross_chain_zeta_tx ON cross_chain_payments(zeta_tx_hash);
CREATE INDEX IF NOT EXISTS idx_cross_chain_status ON cross_chain_payments(status);
CREATE INDEX IF NOT EXISTS idx_cross_chain_sender ON cross_chain_payments(sender_address);
CREATE INDEX IF NOT EXISTS idx_cross_chain_recipient ON cross_chain_payments(recipient_address);

-- ============================================
-- 5. 用户NFT收藏表（用户拥有的NFT）
-- ============================================
CREATE TABLE IF NOT EXISTS user_nft_collection (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(42) NOT NULL,
  work_id BIGINT NOT NULL,
  token_id BIGINT NOT NULL,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acquired_price VARCHAR(50), -- 获得时的价格
  acquired_tx_hash VARCHAR(66),
  is_current_owner BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_nft_user ON user_nft_collection(user_address);
CREATE INDEX IF NOT EXISTS idx_user_nft_work_id ON user_nft_collection(work_id);
CREATE INDEX IF NOT EXISTS idx_user_nft_token_id ON user_nft_collection(token_id);
CREATE INDEX IF NOT EXISTS idx_user_nft_current ON user_nft_collection(is_current_owner);

-- ============================================
-- 6. 扩展work_stats表，添加NFT相关统计
-- ============================================
ALTER TABLE work_stats 
ADD COLUMN IF NOT EXISTS nft_minted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nft_sales_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS nft_total_volume VARCHAR(50) DEFAULT '0', -- 总交易量
ADD COLUMN IF NOT EXISTS nft_floor_price VARCHAR(50), -- 地板价
ADD COLUMN IF NOT EXISTS nft_last_sale_price VARCHAR(50), -- 最后成交价
ADD COLUMN IF NOT EXISTS nft_current_owner VARCHAR(42); -- 当前拥有者

-- ============================================
-- 7. 更新函数：同步NFT状态 (修正语法)
-- ============================================
CREATE OR REPLACE FUNCTION sync_nft_status(
  p_work_id BIGINT,
  p_token_id BIGINT DEFAULT NULL,
  p_is_minted BOOLEAN DEFAULT NULL,
  p_owner_address VARCHAR(42) DEFAULT NULL,
  p_is_listed BOOLEAN DEFAULT NULL,
  p_list_price VARCHAR(50) DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO nft_cache (
    work_id, token_id, is_minted, owner_address, is_listed, list_price, last_sync
  )
  VALUES (
    p_work_id, p_token_id, p_is_minted, p_owner_address, p_is_listed, p_list_price, NOW()
  )
  ON CONFLICT (work_id)
  DO UPDATE SET
    token_id = COALESCE(p_token_id, nft_cache.token_id),
    is_minted = COALESCE(p_is_minted, nft_cache.is_minted),
    owner_address = COALESCE(p_owner_address, nft_cache.owner_address),
    is_listed = COALESCE(p_is_listed, nft_cache.is_listed),
    list_price = COALESCE(p_list_price, nft_cache.list_price),
    last_sync = NOW(),
    updated_at = NOW();
    
  -- 同时更新work_stats
  UPDATE work_stats 
  SET 
    nft_minted = COALESCE(p_is_minted, nft_minted),
    nft_current_owner = COALESCE(p_owner_address, nft_current_owner),
    last_updated = NOW()
  WHERE work_id = p_work_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. 记录NFT交易的函数 (修正语法)
-- ============================================
CREATE OR REPLACE FUNCTION record_nft_transaction(
  p_work_id BIGINT,
  p_token_id BIGINT,
  p_transaction_type VARCHAR(20),
  p_from_address VARCHAR(42),
  p_to_address VARCHAR(42),
  p_price VARCHAR(50),
  p_tx_hash VARCHAR(66),
  p_block_number BIGINT DEFAULT NULL,
  p_platform_fee VARCHAR(50) DEFAULT NULL,
  p_royalty_amount VARCHAR(50) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  transaction_id INTEGER;
BEGIN
  INSERT INTO nft_transactions (
    work_id, token_id, transaction_type, from_address, to_address, 
    price, tx_hash, block_number, platform_fee, royalty_amount
  )
  VALUES (
    p_work_id, p_token_id, p_transaction_type, p_from_address, p_to_address,
    p_price, p_tx_hash, p_block_number, p_platform_fee, p_royalty_amount
  )
  RETURNING id INTO transaction_id;
  
  -- 更新统计
  IF p_transaction_type = 'buy' THEN
    UPDATE work_stats 
    SET 
      nft_sales_count = nft_sales_count + 1,
      nft_last_sale_price = p_price,
      nft_current_owner = p_to_address,
      last_updated = NOW()
    WHERE work_id = p_work_id;
    
    -- 更新总交易量
    UPDATE work_stats 
    SET nft_total_volume = (
      COALESCE(CAST(nft_total_volume AS DECIMAL), 0) + CAST(p_price AS DECIMAL)
    )::VARCHAR
    WHERE work_id = p_work_id;
  END IF;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. 创建视图：NFT市场数据
-- ============================================
CREATE OR REPLACE VIEW nft_market_view AS
SELECT 
  w.work_id,
  w.title,
  w.creator_address,
  w.image_url,
  w.tags,
  nc.token_id,
  nc.is_minted,
  nc.owner_address,
  nc.is_listed,
  nc.list_price,
  ws.nft_sales_count,
  ws.nft_total_volume,
  ws.nft_floor_price,
  ws.nft_last_sale_price,
  ws.like_count,
  w.created_at
FROM works w
LEFT JOIN nft_cache nc ON w.work_id = nc.work_id
LEFT JOIN work_stats ws ON w.work_id = ws.work_id
WHERE nc.is_minted = true
ORDER BY w.created_at DESC;

-- ============================================
-- 10. 创建视图：用户NFT收藏
-- ============================================
CREATE OR REPLACE VIEW user_nft_portfolio AS
SELECT 
  unc.user_address,
  w.work_id,
  w.title,
  w.creator_address,
  w.image_url,
  unc.token_id,
  unc.acquired_at,
  unc.acquired_price,
  nc.list_price as current_list_price,
  nc.is_listed,
  ws.nft_last_sale_price,
  ws.nft_floor_price
FROM user_nft_collection unc
JOIN works w ON unc.work_id = w.work_id
LEFT JOIN nft_cache nc ON w.work_id = nc.work_id
LEFT JOIN work_stats ws ON w.work_id = ws.work_id
WHERE unc.is_current_owner = true
ORDER BY unc.acquired_at DESC;

-- ============================================
-- 11. 添加触发器：自动更新时间戳
-- ============================================
CREATE TRIGGER update_nft_cache_updated_at 
BEFORE UPDATE ON nft_cache
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_chain_updated_at 
BEFORE UPDATE ON cross_chain_payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_nft_updated_at 
BEFORE UPDATE ON user_nft_collection
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. 创建索引优化查询性能
-- ============================================
-- 复合索引用于常见查询
CREATE INDEX IF NOT EXISTS idx_nft_cache_minted_listed ON nft_cache(is_minted, is_listed);
CREATE INDEX IF NOT EXISTS idx_nft_tx_work_type_created ON nft_transactions(work_id, transaction_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_nft_user_current ON user_nft_collection(user_address, is_current_owner);

-- ============================================
-- 完成！修正版数据库扩展
-- ============================================
-- 运行此脚本后，数据库将支持完整的NFT功能
-- 包括状态缓存、交易历史、版税分配、跨链支付等
-- 修正了PostgreSQL函数语法错误（$$ 替代 $）

-- 验证表是否创建成功
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'nft_cache', 
    'nft_transactions', 
    'royalty_distributions', 
    'user_nft_collection', 
    'cross_chain_payments'
  )
ORDER BY table_name;