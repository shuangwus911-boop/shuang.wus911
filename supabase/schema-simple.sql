-- 竞对商品监控数据库 Schema (简化版)
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建 Amazon 商品表
CREATE TABLE amazon_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asin VARCHAR(10) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  bsr_rank INTEGER DEFAULT 0,
  bsr_category VARCHAR(255),
  score DECIMAL(3,2) DEFAULT 0,
  images TEXT[],
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 AE 匹配表
CREATE TABLE ae_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amazon_product_id UUID REFERENCES amazon_products(id) ON DELETE CASCADE,
  ae_product_id VARCHAR(50) NOT NULL,
  ae_title TEXT,
  ae_price DECIMAL(10,2) NOT NULL,
  ae_original_price DECIMAL(10,2),
  ae_inventory INTEGER DEFAULT 999,
  profit_margin DECIMAL(5,2),
  match_score DECIMAL(5,4),
  status VARCHAR(20) DEFAULT 'potential',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建监控日志表
CREATE TABLE crawl_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  items_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. 创建索引
CREATE INDEX idx_amazon_score ON amazon_products(score DESC);
CREATE INDEX idx_amazon_created ON amazon_products(created_at DESC);
CREATE INDEX idx_ae_status ON ae_matches(status);
CREATE INDEX idx_ae_profit ON ae_matches(profit_margin DESC);

-- 5. 创建自动更新触发器
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
