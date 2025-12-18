-- ============================================
-- WhichWitch NFT Marketplace System
-- 支持完整的NFT交易流程：上传→铸造→出售→交易
-- ============================================

-- ============================================
-- 1. NFT Marketplace Listings 表 (核心交易表)
-- ============================================
CREATE TABLE IF NOT EXISTS nft_marketplace_listings (
  id SERIAL PRIMARY KEY,
  work_id BIGINT NOT NULL,
  token_id BIGINT NOT NULL,
  seller_address VARCHAR(42) NOT NULL,
  price VARCHAR(50) NOT NULL, -- ETH价格字符串
  currency VARCHAR(10) DEFAULT 'ETH',
  listing_type VARCHAR(20) DEFAULT 'fixed_price', -- fixed_price, auction, offer
  is_active BOOLEAN DEFAULT true,
  is_sold BOOLEAN DEFAULT false,
  
  -- 拍卖相关字段
  auction_start_time TIMESTAMP WITH TIME ZONE,
  auction_end_time TIMESTAMP WITH TIME ZONE,
  reserve_price VARCHAR(50), -- 保留价
  highest_bid VARCHAR(50), -- 最高出价
  highest_bidder VARCHAR(42), -- 最高出价者
  
  -- 交易信息
  sold_price VARCHAR(50), -- 成交价格
  sold_to VARCHAR(42), -- 买家地址
  sold_at TIMESTAMP WITH TIME ZONE, -- 成交时间
  sale_tx_hash VARCHAR(66), -- 成交交易哈希
  
  -- 费用信息
  platform_fee_percentage DECIMAL(5,2) DEFAULT 2.5, -- 平台费用百分比
  royalty_percentage DECIMAL(5,2) DEFAULT 5.0, -- 版税百分比
  
  -- 元数据
  metadata JSONB, -- 额外的listing信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_marketplace_work_id ON nft_marketplace_listings(work_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_token_id ON nft_marketplace_listings(token_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON nft_marketplace_listings(seller_address);
CREATE INDEX IF NOT EXISTS idx_marketplace_active ON nft_marketplace_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_sold ON nft_marketplace_listings(is_sold);
CREATE INDEX IF NOT EXISTS idx_marketplace_price ON nft_marketplace_listings(CAST(price AS DECIMAL));
CREATE INDEX IF NOT EXISTS idx_marketplace_created ON nft_marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_type ON nft_marketplace_listings(listing_type);

-- ============================================
-- 2. NFT Offers 表 (出价系统)
-- ============================================
CREATE TABLE IF NOT EXISTS nft_offers (
  id SERIAL PRIMARY KEY,
  work_id BIGINT NOT NULL,
  token_id BIGINT NOT NULL,
  listing_id INTEGER, -- 关联到marketplace listing
  
  -- 出价信息
  bidder_address VARCHAR(42) NOT NULL,
  offer_price VARCHAR(50) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ETH',
  expiry_time TIMESTAMP WITH TIME ZONE,
  
  -- 状态
  status VARCHAR(20) DEFAULT 'active', -- active, accepted, rejected, expired, cancelled
  is_accepted BOOLEAN DEFAULT false,
  
  -- 交易信息
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_tx_hash VARCHAR(66),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES nft_marketplace_listings(id) ON DELETE SET NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_offers_work_id ON nft_offers(work_id);
CREATE INDEX IF NOT EXISTS idx_offers_token_id ON nft_offers(token_id);
CREATE INDEX IF NOT EXISTS idx_offers_bidder ON nft_offers(bidder_address);
CREATE INDEX IF NOT EXISTS idx_offers_listing ON nft_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON nft_offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_price ON nft_offers(CAST(offer_price AS DECIMAL));
CREATE INDEX IF NOT EXISTS idx_offers_expiry ON nft_offers(expiry_time);

-- ============================================
-- 3. NFT Minting Queue 表 (铸造队列)
-- ============================================
CREATE TABLE IF NOT EXISTS nft_minting_queue (
  id SERIAL PRIMARY KEY,
  work_id BIGINT NOT NULL,
  creator_address VARCHAR(42) NOT NULL,
  
  -- IPFS信息
  ipfs_hash VARCHAR(100) NOT NULL, -- Pinata IPFS hash
  metadata_ipfs_hash VARCHAR(100), -- 元数据IPFS hash
  
  -- 铸造状态
  minting_status VARCHAR(20) DEFAULT 'pending', -- pending, minting, completed, failed
  
  -- 区块链信息
  mint_tx_hash VARCHAR(66), -- 铸造交易哈希
  token_id BIGINT, -- 铸造后的token ID
  contract_address VARCHAR(42), -- NFT合约地址
  
  -- 错误信息
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- 时间戳
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  minted_at TIMESTAMP WITH TIME ZONE,
  
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_minting_work_id ON nft_minting_queue(work_id);
CREATE INDEX IF NOT EXISTS idx_minting_creator ON nft_minting_queue(creator_address);
CREATE INDEX IF NOT EXISTS idx_minting_status ON nft_minting_queue(minting_status);
CREATE INDEX IF NOT EXISTS idx_minting_ipfs ON nft_minting_queue(ipfs_hash);
CREATE INDEX IF NOT EXISTS idx_minting_requested ON nft_minting_queue(requested_at DESC);

-- ============================================
-- 4. Marketplace Statistics 表 (市场统计)
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_statistics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- 交易统计
  total_sales INTEGER DEFAULT 0,
  total_volume VARCHAR(50) DEFAULT '0', -- ETH
  average_price VARCHAR(50) DEFAULT '0',
  
  -- 用户统计
  active_sellers INTEGER DEFAULT 0,
  active_buyers INTEGER DEFAULT 0,
  new_listings INTEGER DEFAULT 0,
  
  -- NFT统计
  total_nfts_minted INTEGER DEFAULT 0,
  total_nfts_listed INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(date)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_marketplace_stats_date ON marketplace_statistics(date DESC);

-- ============================================
-- 5. 视图：Marketplace Active Listings (活跃交易)
-- ============================================
CREATE OR REPLACE VIEW marketplace_active_listings AS
SELECT 
  ml.id as listing_id,
  ml.work_id,
  ml.token_id,
  ml.seller_address,
  ml.price,
  ml.currency,
  ml.listing_type,
  ml.created_at as listed_at,
  
  -- 作品信息
  w.title,
  w.creator_address,
  w.image_url,
  w.tags,
  w.material,
  w.description,
  w.story,
  w.allow_remix,
  w.is_remix,
  
  -- 统计信息
  ws.like_count,
  ws.remix_count,
  ws.view_count,
  ws.nft_sales_count,
  ws.nft_total_volume,
  ws.nft_last_sale_price,
  
  -- NFT缓存信息
  nc.is_minted,
  nc.owner_address,
  nc.is_listed,
  
  -- 计算字段
  CASE 
    WHEN ml.listing_type = 'auction' AND ml.auction_end_time > NOW() THEN 'auction_active'
    WHEN ml.listing_type = 'auction' AND ml.auction_end_time <= NOW() THEN 'auction_ended'
    WHEN ml.listing_type = 'fixed_price' THEN 'fixed_price'
    ELSE 'unknown'
  END as listing_status,
  
  -- 拍卖信息
  ml.auction_end_time,
  ml.highest_bid,
  ml.highest_bidder,
  
  -- 出价统计
  (SELECT COUNT(*) FROM nft_offers WHERE work_id = ml.work_id AND status = 'active') as active_offers_count,
  (SELECT MAX(CAST(offer_price AS DECIMAL)) FROM nft_offers WHERE work_id = ml.work_id AND status = 'active') as highest_offer

FROM nft_marketplace_listings ml
JOIN works w ON ml.work_id = w.work_id
LEFT JOIN work_stats ws ON w.work_id = ws.work_id
LEFT JOIN nft_cache nc ON w.work_id = nc.work_id
WHERE ml.is_active = true 
  AND ml.is_sold = false
  AND nc.is_minted = true
ORDER BY ml.created_at DESC;

-- ============================================
-- 6. 视图：User NFT Portfolio (用户NFT组合)
-- ============================================
CREATE OR REPLACE VIEW user_nft_portfolio_extended AS
SELECT 
  nc.owner_address as user_address,
  w.work_id,
  w.title,
  w.creator_address,
  w.image_url,
  w.tags,
  nc.token_id,
  
  -- 当前状态
  nc.is_listed,
  nc.list_price,
  
  -- 市场信息
  ml.id as listing_id,
  ml.listing_type,
  ml.created_at as listed_at,
  
  -- 历史信息
  ws.nft_last_sale_price,
  ws.nft_total_volume,
  ws.nft_sales_count,
  
  -- 出价信息
  (SELECT COUNT(*) FROM nft_offers WHERE work_id = w.work_id AND status = 'active') as active_offers_count,
  (SELECT MAX(CAST(offer_price AS DECIMAL)) FROM nft_offers WHERE work_id = w.work_id AND status = 'active') as highest_offer

FROM nft_cache nc
JOIN works w ON nc.work_id = w.work_id
LEFT JOIN work_stats ws ON w.work_id = ws.work_id
LEFT JOIN nft_marketplace_listings ml ON w.work_id = ml.work_id AND ml.is_active = true
WHERE nc.is_minted = true
  AND nc.owner_address IS NOT NULL
ORDER BY nc.updated_at DESC;

-- ============================================
-- 7. 函数：创建NFT Listing
-- ============================================
CREATE OR REPLACE FUNCTION create_nft_listing(
  p_work_id BIGINT,
  p_token_id BIGINT,
  p_seller_address VARCHAR(42),
  p_price VARCHAR(50),
  p_currency VARCHAR(10) DEFAULT 'ETH',
  p_listing_type VARCHAR(20) DEFAULT 'fixed_price'
)
RETURNS INTEGER AS $
DECLARE
  listing_id INTEGER;
BEGIN
  -- 检查NFT是否存在且属于卖家
  IF NOT EXISTS (
    SELECT 1 FROM nft_cache 
    WHERE work_id = p_work_id 
      AND token_id = p_token_id 
      AND owner_address = p_seller_address
      AND is_minted = true
  ) THEN
    RAISE EXCEPTION 'NFT not found or not owned by seller';
  END IF;
  
  -- 检查是否已有活跃listing
  IF EXISTS (
    SELECT 1 FROM nft_marketplace_listings 
    WHERE work_id = p_work_id 
      AND is_active = true 
      AND is_sold = false
  ) THEN
    RAISE EXCEPTION 'NFT already has an active listing';
  END IF;
  
  -- 创建listing
  INSERT INTO nft_marketplace_listings (
    work_id, token_id, seller_address, price, currency, listing_type
  )
  VALUES (
    p_work_id, p_token_id, p_seller_address, p_price, p_currency, p_listing_type
  )
  RETURNING id INTO listing_id;
  
  -- 更新NFT缓存状态
  UPDATE nft_cache 
  SET 
    is_listed = true,
    list_price = p_price,
    updated_at = NOW()
  WHERE work_id = p_work_id;
  
  RETURN listing_id;
END;
$ LANGUAGE plpgsql;

-- ============================================
-- 8. 函数：完成NFT交易
-- ============================================
CREATE OR REPLACE FUNCTION complete_nft_sale(
  p_listing_id INTEGER,
  p_buyer_address VARCHAR(42),
  p_sale_price VARCHAR(50),
  p_tx_hash VARCHAR(66)
)
RETURNS void AS $
DECLARE
  v_work_id BIGINT;
  v_token_id BIGINT;
  v_seller_address VARCHAR(42);
BEGIN
  -- 获取listing信息
  SELECT work_id, token_id, seller_address 
  INTO v_work_id, v_token_id, v_seller_address
  FROM nft_marketplace_listings 
  WHERE id = p_listing_id AND is_active = true AND is_sold = false;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active listing not found';
  END IF;
  
  -- 更新listing状态
  UPDATE nft_marketplace_listings 
  SET 
    is_sold = true,
    is_active = false,
    sold_price = p_sale_price,
    sold_to = p_buyer_address,
    sold_at = NOW(),
    sale_tx_hash = p_tx_hash,
    updated_at = NOW()
  WHERE id = p_listing_id;
  
  -- 更新NFT缓存 - 转移所有权
  UPDATE nft_cache 
  SET 
    owner_address = p_buyer_address,
    is_listed = false,
    list_price = NULL,
    updated_at = NOW()
  WHERE work_id = v_work_id;
  
  -- 记录交易历史
  INSERT INTO nft_transactions (
    work_id, token_id, transaction_type, from_address, to_address, 
    price, tx_hash
  )
  VALUES (
    v_work_id, v_token_id, 'buy', v_seller_address, p_buyer_address,
    p_sale_price, p_tx_hash
  );
  
  -- 更新用户NFT收藏
  UPDATE user_nft_collection 
  SET is_current_owner = false 
  WHERE work_id = v_work_id AND user_address = v_seller_address;
  
  INSERT INTO user_nft_collection (
    user_address, work_id, token_id, acquired_price, acquired_tx_hash
  )
  VALUES (
    p_buyer_address, v_work_id, v_token_id, p_sale_price, p_tx_hash
  );
  
  -- 更新统计
  UPDATE work_stats 
  SET 
    nft_sales_count = nft_sales_count + 1,
    nft_last_sale_price = p_sale_price,
    nft_current_owner = p_buyer_address,
    nft_total_volume = (
      COALESCE(CAST(nft_total_volume AS DECIMAL), 0) + CAST(p_sale_price AS DECIMAL)
    )::VARCHAR,
    last_updated = NOW()
  WHERE work_id = v_work_id;
END;
$ LANGUAGE plpgsql;

-- ============================================
-- 9. 函数：请求NFT铸造
-- ============================================
CREATE OR REPLACE FUNCTION request_nft_minting(
  p_work_id BIGINT,
  p_creator_address VARCHAR(42),
  p_ipfs_hash VARCHAR(100),
  p_metadata_ipfs_hash VARCHAR(100) DEFAULT NULL
)
RETURNS INTEGER AS $
DECLARE
  queue_id INTEGER;
BEGIN
  -- 检查作品是否存在且属于创建者
  IF NOT EXISTS (
    SELECT 1 FROM works 
    WHERE work_id = p_work_id 
      AND creator_address = p_creator_address
  ) THEN
    RAISE EXCEPTION 'Work not found or not owned by creator';
  END IF;
  
  -- 检查是否已经铸造或在队列中
  IF EXISTS (
    SELECT 1 FROM nft_cache 
    WHERE work_id = p_work_id AND is_minted = true
  ) THEN
    RAISE EXCEPTION 'NFT already minted for this work';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM nft_minting_queue 
    WHERE work_id = p_work_id 
      AND minting_status IN ('pending', 'minting')
  ) THEN
    RAISE EXCEPTION 'NFT minting already in progress';
  END IF;
  
  -- 添加到铸造队列
  INSERT INTO nft_minting_queue (
    work_id, creator_address, ipfs_hash, metadata_ipfs_hash
  )
  VALUES (
    p_work_id, p_creator_address, p_ipfs_hash, p_metadata_ipfs_hash
  )
  RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$ LANGUAGE plpgsql;

-- ============================================
-- 10. 触发器：自动更新时间戳
-- ============================================
CREATE TRIGGER update_marketplace_listings_updated_at 
BEFORE UPDATE ON nft_marketplace_listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_offers_updated_at 
BEFORE UPDATE ON nft_offers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_stats_updated_at 
BEFORE UPDATE ON marketplace_statistics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. 初始化数据
-- ============================================
-- 插入今天的统计记录
INSERT INTO marketplace_statistics (date) 
VALUES (CURRENT_DATE) 
ON CONFLICT (date) DO NOTHING;

-- ============================================
-- 完成！NFT Marketplace System
-- ============================================
-- 此系统支持完整的NFT交易流程：
-- 1. 作品上传 → IPFS存储
-- 2. NFT铸造队列管理
-- 3. Marketplace listing创建
-- 4. 出价系统
-- 5. 交易完成和所有权转移
-- 6. 统计和分析

-- 验证表创建
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'nft_marketplace_listings',
    'nft_offers', 
    'nft_minting_queue',
    'marketplace_statistics'
  )
ORDER BY table_name;