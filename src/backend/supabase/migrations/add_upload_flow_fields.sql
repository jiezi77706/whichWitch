-- ============================================
-- WhichWitch v2.0 上传流程优化
-- 添加支持分离数据库存储和区块链mint的字段
-- ============================================

-- 为works表添加新字段
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS is_on_chain BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66),
ADD COLUMN IF NOT EXISTS temp_work_id BIGINT, -- 临时ID，用于关联
ADD COLUMN IF NOT EXISTS upload_status VARCHAR(20) DEFAULT 'database_only'; -- database_only, minted, nft_minted

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_works_on_chain ON works(is_on_chain);
CREATE INDEX IF NOT EXISTS idx_works_upload_status ON works(upload_status);
CREATE INDEX IF NOT EXISTS idx_works_blockchain_tx ON works(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_works_temp_id ON works(temp_work_id);

-- 添加注释
COMMENT ON COLUMN works.is_on_chain IS '是否已上链';
COMMENT ON COLUMN works.blockchain_tx_hash IS '区块链交易哈希';
COMMENT ON COLUMN works.temp_work_id IS '临时工作ID，用于关联数据库记录和区块链记录';
COMMENT ON COLUMN works.upload_status IS '上传状态：database_only(仅数据库), minted(已mint), nft_minted(已铸造NFT)';

-- 更新现有记录（假设现有记录都已上链）
UPDATE works 
SET 
  is_on_chain = true,
  upload_status = 'minted'
WHERE is_on_chain IS NULL OR is_on_chain = false;

-- 创建视图：包含上传状态的作品详情
CREATE OR REPLACE VIEW work_details_with_status AS
SELECT 
  w.*,
  ws.like_count,
  ws.remix_count,
  ws.tip_count,
  ws.total_tips,
  ws.view_count,
  ws.nft_minted,
  ws.nft_sales_count,
  ws.nft_total_volume,
  ws.nft_current_owner,
  nc.is_minted as nft_is_minted,
  nc.owner_address as nft_owner,
  nc.is_listed as nft_is_listed,
  nc.list_price as nft_price,
  CASE 
    WHEN w.upload_status = 'database_only' THEN 'Database Only'
    WHEN w.upload_status = 'minted' AND nc.is_minted = true THEN 'NFT Available'
    WHEN w.upload_status = 'minted' AND nc.is_minted = false THEN 'Mintable'
    ELSE 'Unknown'
  END as display_status
FROM works w
LEFT JOIN work_stats ws ON w.work_id = ws.work_id
LEFT JOIN nft_cache nc ON w.work_id = nc.work_id
ORDER BY w.created_at DESC;

-- 创建函数：更新作品上传状态
CREATE OR REPLACE FUNCTION update_work_upload_status(
  p_work_id BIGINT,
  p_status VARCHAR(20),
  p_tx_hash VARCHAR(66) DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE works 
  SET 
    upload_status = p_status,
    blockchain_tx_hash = COALESCE(p_tx_hash, blockchain_tx_hash),
    is_on_chain = CASE 
      WHEN p_status IN ('minted', 'nft_minted') THEN true 
      ELSE is_on_chain 
    END,
    updated_at = NOW()
  WHERE work_id = p_work_id;
  
  -- 记录状态变更日志
  INSERT INTO work_status_log (work_id, old_status, new_status, tx_hash, created_at)
  SELECT 
    p_work_id,
    upload_status,
    p_status,
    p_tx_hash,
    NOW()
  FROM works 
  WHERE work_id = p_work_id;
END;
$$ LANGUAGE plpgsql;

-- 创建状态变更日志表
CREATE TABLE IF NOT EXISTS work_status_log (
  id SERIAL PRIMARY KEY,
  work_id BIGINT NOT NULL,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  tx_hash VARCHAR(66),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_work_status_log_work_id ON work_status_log(work_id);
CREATE INDEX IF NOT EXISTS idx_work_status_log_created ON work_status_log(created_at DESC);