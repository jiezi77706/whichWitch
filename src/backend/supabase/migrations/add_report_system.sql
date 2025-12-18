-- ============================================
-- Report System for Works
-- 举报系统数据库结构
-- ============================================

-- 1. 举报类型枚举
CREATE TYPE report_type AS ENUM (
  'copyright_infringement',  -- 抄袭/版权侵犯
  'inappropriate_content',   -- 违规内容
  'spam',                   -- 垃圾信息
  'harassment',             -- 骚扰
  'other'                   -- 其他
);

-- 2. 举报状态枚举
CREATE TYPE report_status AS ENUM (
  'pending',        -- 待处理
  'under_review',   -- 审核中
  'ai_processing',  -- AI处理中
  'resolved',       -- 已解决
  'rejected',       -- 已拒绝
  'escalated'       -- 升级处理
);

-- 3. 举报表
CREATE TABLE IF NOT EXISTS work_reports (
  id SERIAL PRIMARY KEY,
  
  -- 基本信息
  reported_work_id BIGINT NOT NULL,
  reporter_address VARCHAR(42) NOT NULL,
  report_type report_type NOT NULL,
  reason TEXT NOT NULL CHECK (LENGTH(reason) <= 300),
  
  -- 抄袭相关
  alleged_copied_work_id BIGINT NULL, -- 被抄袭的作品ID
  
  -- 状态信息
  status report_status DEFAULT 'pending',
  
  -- AI分析结果
  ai_analysis JSONB NULL,
  ai_similarity_score DECIMAL(5,2) NULL, -- 相似度评分 0-100
  ai_verdict TEXT NULL,
  
  -- 审核信息
  moderator_address VARCHAR(42) NULL,
  moderator_notes TEXT NULL,
  resolution_notes TEXT NULL,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- 外键约束
  FOREIGN KEY (reported_work_id) REFERENCES works(work_id) ON DELETE CASCADE,
  FOREIGN KEY (alleged_copied_work_id) REFERENCES works(work_id) ON DELETE SET NULL
);

-- 4. AI仲裁报告表
CREATE TABLE IF NOT EXISTS ai_arbitration_reports (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL UNIQUE,
  
  -- 分析结果
  overall_similarity_score DECIMAL(5,2) NOT NULL, -- 整体相似度 0-100%
  
  -- 争议区域分析
  disputed_areas JSONB NOT NULL, -- 角色特征/配色方案/构图等
  
  -- 时间线对比
  timeline_analysis JSONB NOT NULL,
  
  -- AI建议
  ai_recommendation TEXT NOT NULL,
  ai_confidence DECIMAL(5,2) NOT NULL, -- AI置信度
  
  -- 详细分析数据
  detailed_analysis JSONB NOT NULL,
  
  -- 生成时间
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (report_id) REFERENCES work_reports(id) ON DELETE CASCADE
);

-- 5. 举报统计视图
CREATE OR REPLACE VIEW report_statistics AS
SELECT 
  reported_work_id,
  COUNT(*) as total_reports,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
  COUNT(CASE WHEN report_type = 'copyright_infringement' THEN 1 END) as copyright_reports,
  COUNT(CASE WHEN report_type = 'inappropriate_content' THEN 1 END) as content_reports,
  MAX(created_at) as last_report_date
FROM work_reports
GROUP BY reported_work_id;

-- ============================================
-- 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_work_reports_work_id ON work_reports(reported_work_id);
CREATE INDEX IF NOT EXISTS idx_work_reports_reporter ON work_reports(reporter_address);
CREATE INDEX IF NOT EXISTS idx_work_reports_status ON work_reports(status);
CREATE INDEX IF NOT EXISTS idx_work_reports_type ON work_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_work_reports_created ON work_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_arbitration_report_id ON ai_arbitration_reports(report_id);

-- ============================================
-- 函数
-- ============================================

-- 提交举报函数
CREATE OR REPLACE FUNCTION submit_work_report(
  p_reported_work_id BIGINT,
  p_reporter_address VARCHAR(42),
  p_report_type report_type,
  p_reason TEXT,
  p_alleged_copied_work_id BIGINT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_report_id INTEGER;
BEGIN
  -- 验证举报理由长度
  IF LENGTH(p_reason) > 300 THEN
    RAISE EXCEPTION 'Report reason cannot exceed 300 characters';
  END IF;
  
  -- 验证不能举报自己的作品
  IF EXISTS (
    SELECT 1 FROM works 
    WHERE work_id = p_reported_work_id 
    AND creator_address = LOWER(p_reporter_address)
  ) THEN
    RAISE EXCEPTION 'Cannot report your own work';
  END IF;
  
  -- 插入举报记录
  INSERT INTO work_reports (
    reported_work_id,
    reporter_address,
    report_type,
    reason,
    alleged_copied_work_id
  ) VALUES (
    p_reported_work_id,
    LOWER(p_reporter_address),
    p_report_type,
    p_reason,
    p_alleged_copied_work_id
  ) RETURNING id INTO v_report_id;
  
  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;

-- 更新举报状态函数
CREATE OR REPLACE FUNCTION update_report_status(
  p_report_id INTEGER,
  p_status report_status,
  p_moderator_address VARCHAR(42) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE work_reports 
  SET 
    status = p_status,
    moderator_address = COALESCE(p_moderator_address, moderator_address),
    moderator_notes = COALESCE(p_notes, moderator_notes),
    updated_at = NOW(),
    resolved_at = CASE WHEN p_status IN ('resolved', 'rejected') THEN NOW() ELSE resolved_at END
  WHERE id = p_report_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 保存AI仲裁报告函数
CREATE OR REPLACE FUNCTION save_ai_arbitration_report(
  p_report_id INTEGER,
  p_similarity_score DECIMAL(5,2),
  p_disputed_areas JSONB,
  p_timeline_analysis JSONB,
  p_recommendation TEXT,
  p_confidence DECIMAL(5,2),
  p_detailed_analysis JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_arbitration_id INTEGER;
BEGIN
  -- 插入AI仲裁报告
  INSERT INTO ai_arbitration_reports (
    report_id,
    overall_similarity_score,
    disputed_areas,
    timeline_analysis,
    ai_recommendation,
    ai_confidence,
    detailed_analysis
  ) VALUES (
    p_report_id,
    p_similarity_score,
    p_disputed_areas,
    p_timeline_analysis,
    p_recommendation,
    p_confidence,
    p_detailed_analysis
  ) RETURNING id INTO v_arbitration_id;
  
  -- 更新举报记录
  UPDATE work_reports 
  SET 
    ai_similarity_score = p_similarity_score,
    ai_verdict = p_recommendation,
    status = CASE 
      WHEN p_similarity_score >= 70 THEN 'escalated'::report_status
      WHEN p_similarity_score >= 30 THEN 'under_review'::report_status
      ELSE 'resolved'::report_status
    END,
    updated_at = NOW()
  WHERE id = p_report_id;
  
  RETURN v_arbitration_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 触发器
-- ============================================

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_report_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_report_timestamp
BEFORE UPDATE ON work_reports
FOR EACH ROW
EXECUTE FUNCTION update_report_timestamp();

-- ============================================
-- 权限和安全
-- ============================================

-- RLS策略（如果启用了行级安全）
-- ALTER TABLE work_reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_arbitration_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 注释
-- ============================================

COMMENT ON TABLE work_reports IS '作品举报记录表';
COMMENT ON TABLE ai_arbitration_reports IS 'AI仲裁报告表';
COMMENT ON COLUMN work_reports.reason IS '举报理由，最多300字符';
COMMENT ON COLUMN work_reports.alleged_copied_work_id IS '被抄袭的作品ID（仅抄袭举报）';
COMMENT ON COLUMN ai_arbitration_reports.overall_similarity_score IS '整体相似度评分 0-100%';
COMMENT ON COLUMN ai_arbitration_reports.disputed_areas IS '争议区域分析JSON';
COMMENT ON COLUMN ai_arbitration_reports.timeline_analysis IS '时间线对比分析JSON';