-- Row Level Security (RLS) 策略
-- 在 Supabase SQL Editor 中执行此脚本
-- 确保 anon key 只能读取数据，不能增删改

-- ============================================
-- 1. 启用 RLS
-- ============================================
ALTER TABLE amazon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ae_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Amazon Products 表策略
-- ============================================

-- anon 角色只能读取
CREATE POLICY "anon_read_products" ON amazon_products
  FOR SELECT
  TO anon
  USING (true);

-- service_role 拥有完全权限（用于爬虫写入）
CREATE POLICY "service_write_products" ON amazon_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. AE Matches 表策略
-- ============================================

-- anon 角色只能读取
CREATE POLICY "anon_read_matches" ON ae_matches
  FOR SELECT
  TO anon
  USING (true);

-- service_role 拥有完全权限
CREATE POLICY "service_write_matches" ON ae_matches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. Crawl Logs 表策略
-- ============================================

-- anon 角色只能读取
CREATE POLICY "anon_read_logs" ON crawl_logs
  FOR SELECT
  TO anon
  USING (true);

-- service_role 拥有完全权限
CREATE POLICY "service_write_logs" ON crawl_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
