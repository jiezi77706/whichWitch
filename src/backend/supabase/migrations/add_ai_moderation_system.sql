-- ============================================
-- WhichWitch AI Moderation System
-- Content Moderation & Copyright Arbitration
-- ============================================

-- 1. Content Moderation Records Table
CREATE TABLE IF NOT EXISTS content_moderation (
  id SERIAL PRIMARY KEY,
  work_id BIGINT NOT NULL,
  creator_address VARCHAR(42) NOT NULL,
  
  -- Moderation Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, under_review
  
  -- AI Analysis Results
  ai_analysis JSONB, -- Full AI analysis report
  nsfw_score DECIMAL(5,2), -- 0-100
  violence_score DECIMAL(5,2), -- 0-100
  hate_score DECIMAL(5,2), -- 0-100
  overall_safety_score DECIMAL(5,2), -- 0-100
  
  -- Detected Issues
  detected_issues TEXT[], -- Array of detected issue types
  flagged_content TEXT[], -- Specific flagged elements
  
  -- Stake Information
  stake_amount VARCHAR(50), -- Token amount staked
  stake_tx_hash VARCHAR(66), -- Blockchain transaction hash
  stake_locked BOOLEAN DEFAULT true,
  
  -- Challenge Period
  challenge_period_end TIMESTAMP WITH TIME ZONE,
  challenge_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 2. Copyright Disputes Table
CREATE TABLE IF NOT EXISTS copyright_disputes (
  id SERIAL PRIMARY KEY,
  
  -- Dispute Parties
  reporter_address VARCHAR(42) NOT NULL,
  accused_address VARCHAR(42) NOT NULL,
  
  -- Works Involved
  original_work_id BIGINT NOT NULL,
  accused_work_id BIGINT NOT NULL,
  
  -- Dispute Details
  dispute_reason TEXT NOT NULL,
  evidence_description TEXT,
  evidence_urls TEXT[], -- URLs to evidence images/documents
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, analyzing, resolved, dismissed
  
  -- AI Arbitration Report
  ai_report JSONB, -- Full AI arbitration report
  similarity_score DECIMAL(5,2), -- 0-100 overall similarity
  
  -- Similarity Analysis Details
  composition_similarity DECIMAL(5,2),
  color_similarity DECIMAL(5,2),
  character_similarity DECIMAL(5,2),
  style_similarity DECIMAL(5,2),
  
  -- Disputed Regions
  disputed_regions JSONB, -- Array of flagged regions with coordinates
  
  -- Timeline Analysis
  original_work_date TIMESTAMP WITH TIME ZONE,
  accused_work_date TIMESTAMP WITH TIME ZONE,
  timeline_analysis TEXT,
  
  -- AI Conclusion
  ai_conclusion TEXT,
  ai_recommendation VARCHAR(50), -- dismiss, warning, takedown, compensation
  confidence_level DECIMAL(5,2), -- AI confidence in conclusion
  
  -- Resolution
  resolution VARCHAR(20), -- pending, reporter_wins, accused_wins, settlement
  resolution_details TEXT,
  resolved_by VARCHAR(20), -- ai, community, admin
  
  -- Locks
  works_locked BOOLEAN DEFAULT true,
  lock_tx_hash VARCHAR(66),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  FOREIGN KEY (original_work_id) REFERENCES works(work_id) ON DELETE CASCADE,
  FOREIGN KEY (accused_work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 3. Moderation Challenges Table
CREATE TABLE IF NOT EXISTS moderation_challenges (
  id SERIAL PRIMARY KEY,
  moderation_id INTEGER NOT NULL,
  challenger_address VARCHAR(42) NOT NULL,
  
  -- Challenge Details
  challenge_reason TEXT NOT NULL,
  challenge_evidence TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, reviewing, upheld, dismissed
  
  -- Review
  review_notes TEXT,
  reviewed_by VARCHAR(20), -- ai, admin
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  FOREIGN KEY (moderation_id) REFERENCES content_moderation(id) ON DELETE CASCADE
);

-- 4. AI Analysis Cache Table (for performance)
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
  id SERIAL PRIMARY KEY,
  content_hash VARCHAR(64) UNIQUE NOT NULL, -- Hash of image content
  analysis_type VARCHAR(50) NOT NULL, -- moderation, similarity
  analysis_result JSONB NOT NULL,
  
  -- Cache metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1
);

-- 5. Dispute Evidence Table
CREATE TABLE IF NOT EXISTS dispute_evidence (
  id SERIAL PRIMARY KEY,
  dispute_id INTEGER NOT NULL,
  
  -- Evidence Details
  evidence_type VARCHAR(50), -- image, document, link, description
  evidence_url TEXT,
  evidence_data JSONB,
  description TEXT,
  
  -- Uploader
  uploaded_by VARCHAR(42) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (dispute_id) REFERENCES copyright_disputes(id) ON DELETE CASCADE
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_content_moderation_work_id ON content_moderation(work_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_status ON content_moderation(status);
CREATE INDEX IF NOT EXISTS idx_content_moderation_creator ON content_moderation(creator_address);
CREATE INDEX IF NOT EXISTS idx_content_moderation_created ON content_moderation(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_copyright_disputes_reporter ON copyright_disputes(reporter_address);
CREATE INDEX IF NOT EXISTS idx_copyright_disputes_accused ON copyright_disputes(accused_address);
CREATE INDEX IF NOT EXISTS idx_copyright_disputes_status ON copyright_disputes(status);
CREATE INDEX IF NOT EXISTS idx_copyright_disputes_original_work ON copyright_disputes(original_work_id);
CREATE INDEX IF NOT EXISTS idx_copyright_disputes_accused_work ON copyright_disputes(accused_work_id);
CREATE INDEX IF NOT EXISTS idx_copyright_disputes_created ON copyright_disputes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_challenges_moderation ON moderation_challenges(moderation_id);
CREATE INDEX IF NOT EXISTS idx_moderation_challenges_status ON moderation_challenges(status);

CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_analysis_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_type ON ai_analysis_cache(analysis_type);

CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute ON dispute_evidence(dispute_id);

-- ============================================
-- Views for Easy Querying
-- ============================================

-- View: Pending Moderations
CREATE OR REPLACE VIEW pending_moderations AS
SELECT 
  cm.*,
  w.title as work_title,
  w.image_url as work_image,
  w.creator_address as work_creator
FROM content_moderation cm
JOIN works w ON cm.work_id = w.work_id
WHERE cm.status = 'pending'
ORDER BY cm.created_at DESC;

-- View: Active Disputes
CREATE OR REPLACE VIEW active_disputes AS
SELECT 
  cd.*,
  w1.title as original_work_title,
  w1.image_url as original_work_image,
  w2.title as accused_work_title,
  w2.image_url as accused_work_image
FROM copyright_disputes cd
JOIN works w1 ON cd.original_work_id = w1.work_id
JOIN works w2 ON cd.accused_work_id = w2.work_id
WHERE cd.status IN ('pending', 'analyzing')
ORDER BY cd.created_at DESC;

-- ============================================
-- Functions
-- ============================================

-- Function: Update moderation status
CREATE OR REPLACE FUNCTION update_moderation_status(
  p_moderation_id INTEGER,
  p_status VARCHAR(20),
  p_ai_analysis JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE content_moderation 
  SET 
    status = p_status,
    ai_analysis = COALESCE(p_ai_analysis, ai_analysis),
    reviewed_at = CASE WHEN p_status IN ('approved', 'rejected') THEN NOW() ELSE reviewed_at END
  WHERE id = p_moderation_id;
  
  -- If approved, unlock stake
  IF p_status = 'approved' THEN
    UPDATE content_moderation 
    SET stake_locked = false 
    WHERE id = p_moderation_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Create dispute and lock works
CREATE OR REPLACE FUNCTION create_copyright_dispute(
  p_reporter_address VARCHAR(42),
  p_accused_address VARCHAR(42),
  p_original_work_id BIGINT,
  p_accused_work_id BIGINT,
  p_dispute_reason TEXT,
  p_evidence_description TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_dispute_id INTEGER;
BEGIN
  -- Create dispute
  INSERT INTO copyright_disputes (
    reporter_address,
    accused_address,
    original_work_id,
    accused_work_id,
    dispute_reason,
    evidence_description,
    original_work_date,
    accused_work_date
  )
  SELECT 
    p_reporter_address,
    p_accused_address,
    p_original_work_id,
    p_accused_work_id,
    p_dispute_reason,
    p_evidence_description,
    w1.created_at,
    w2.created_at
  FROM works w1, works w2
  WHERE w1.work_id = p_original_work_id 
    AND w2.work_id = p_accused_work_id
  RETURNING id INTO v_dispute_id;
  
  RETURN v_dispute_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Resolve dispute
CREATE OR REPLACE FUNCTION resolve_dispute(
  p_dispute_id INTEGER,
  p_resolution VARCHAR(20),
  p_resolution_details TEXT,
  p_resolved_by VARCHAR(20)
)
RETURNS void AS $$
BEGIN
  UPDATE copyright_disputes 
  SET 
    status = 'resolved',
    resolution = p_resolution,
    resolution_details = p_resolution_details,
    resolved_by = p_resolved_by,
    resolved_at = NOW(),
    works_locked = false
  WHERE id = p_dispute_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers
-- ============================================

-- Trigger: Update cache access time
CREATE OR REPLACE FUNCTION update_cache_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed = NOW();
  NEW.access_count = NEW.access_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cache_access
BEFORE UPDATE ON ai_analysis_cache
FOR EACH ROW
EXECUTE FUNCTION update_cache_access();

-- ============================================
-- Initial Data / Comments
-- ============================================

COMMENT ON TABLE content_moderation IS 'AI-powered content moderation records for uploaded works';
COMMENT ON TABLE copyright_disputes IS 'Copyright dispute cases with AI arbitration';
COMMENT ON TABLE moderation_challenges IS 'Challenges to moderation decisions';
COMMENT ON TABLE ai_analysis_cache IS 'Cache for AI analysis results to improve performance';
COMMENT ON TABLE dispute_evidence IS 'Evidence submitted for copyright disputes';

COMMENT ON COLUMN content_moderation.ai_analysis IS 'Full JSON report from Qwen-VL analysis';
COMMENT ON COLUMN copyright_disputes.ai_report IS 'Complete AI arbitration report with similarity analysis';
COMMENT ON COLUMN copyright_disputes.disputed_regions IS 'JSON array of flagged regions with coordinates and descriptions';