-- 竞对商品监控数据库 Schema
-- 在 Supabase SQL Editor 中执行此脚本

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Amazon 商品表
CREATE TABLE amazon_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  asin VARCHAR(10) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  bsr_rank INTEGER DEFAULT 0,
  bsr_category VARCHAR(255),
  score DECIMAL(3,2) DEFAULT 0 CHECK (score >= 1 AND score <= 5),
  images TEXT[],
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AE 匹配表
CREATE TABLE ae_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amazon_product_id UUID REFERENCES amazon_products(id) ON DELETE CASCADE,
  ae_product_id VARCHAR(50) NOT NULL,
  ae_title TEXT,
  ae_price DECIMAL(10,2) NOT NULL,
  ae_original_price DECIMAL(10,2),
  ae_inventory INTEGER DEFAULT 999,
  profit_margin DECIMAL(5,2), -- 利润率 (%)
  match_score DECIMAL(5,4), -- 匹配置信度
  status VARCHAR(20) DEFAULT 'potential' CHECK (status IN ('potential', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 监控日志表
CREATE TABLE crawl_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  items_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 索引优化
CREATE INDEX idx_amazon_score ON amazon_products(score DESC);
CREATE INDEX idx_amazon_created ON amazon_products(created_at DESC);
CREATE INDEX idx_ae_status ON ae_matches(status);
CREATE INDEX idx_ae_profit ON ae_matches(profit_margin DESC);

-- 自动更新 updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_amazon_updated_at
  BEFORE UPDATE ON amazon_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建存储过程：获取潜力商品（3-5 星且有 AE 匹配）
CREATE OR REPLACE FUNCTION get_potential_products(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  amazon_id UUID,
  asin VARCHAR,
  title TEXT,
  amazon_price DECIMAL,
  score DECIMAL,
  ae_price DECIMAL,
  profit_margin DECIMAL,
  ae_product_id VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id,
    ap.asin,
    ap.title,
    ap.price,
    ap.score,
    am.ae_price,
    am.profit_margin,
    am.ae_product_id
  FROM amazon_products ap
  JOIN ae_matches am ON ap.id = am.amazon_product_id
  WHERE ap.score >= 3.0 
    AND am.status = 'potential'
  ORDER BY ap.score DESC, am.profit_margin DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 创建视图：今日数据概览
CREATE OR REPLACE VIEW daily_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_products,
  COUNT(CASE WHEN score >= 3 THEN 1 END) as good_products,
  COUNT(DISTINCT am.id) as total_matches,
  AVG(am.profit_margin) as avg_profit_margin
FROM amazon_products ap
LEFT JOIN ae_matches am ON ap.id = am.amazon_product_id
GROUP BY DATE(created_at)
ORDER BY date DESC;
