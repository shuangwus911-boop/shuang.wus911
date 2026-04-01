const puppeteer = require('puppeteer-core');

const SQL = `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS amazon_products (
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

CREATE TABLE IF NOT EXISTS ae_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amazon_product_id UUID REFERENCES amazon_products(id) ON DELETE CASCADE,
  ae_product_id VARCHAR(50) NOT NULL,
  ae_title TEXT,
  ae_price DECIMAL(10,2) NOT NULL,
  ae_original_price DECIMAL(10,2),
  ae_inventory INTEGER DEFAULT 999,
  profit_margin DECIMAL(5,2),
  match_score DECIMAL(5,4),
  status VARCHAR(20) DEFAULT 'potential' CHECK (status IN ('potential', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crawl_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  items_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_amazon_score ON amazon_products(score DESC);
CREATE INDEX IF NOT EXISTS idx_amazon_created ON amazon_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_status ON ae_matches(status);
CREATE INDEX IF NOT EXISTS idx_ae_profit ON ae_matches(profit_margin DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_amazon_updated_at
  BEFORE UPDATE ON amazon_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();`;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50
  });
  
  const page = await browser.newPage();
  await page.goto('https://supabase.com/dashboard/project/gcfkdnevhvhqmnzelnec/sql');
  
  console.log('Please login if needed, then press Enter to continue...');
  
  // Wait for user to be logged in and page to load
  await page.waitForTimeout(5000);
  
  // Try to find and click "New" button
  try {
    const newButton = await page.$('button:has-text("New"), button:has-text("新的")');
    if (newButton) await newButton.click();
  } catch (e) {
    console.log('New button not found, continuing...');
  }
  
  await page.waitForTimeout(2000);
  
  // Find the Monaco editor and set its value
  await page.evaluate((sql) => {
    // Try to find the editor instance
    const editors = window.monaco?.editor?.getEditors?.() || [];
    if (editors.length > 0) {
      editors[0].setValue(sql);
      return true;
    }
    
    // Fallback: try to find textarea
    const textarea = document.querySelector('textarea[role="textbox"]');
    if (textarea) {
      textarea.value = sql;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    
    return false;
  }, SQL);
  
  console.log('SQL injected, waiting before run...');
  await page.waitForTimeout(3000);
  
  // Click run button
  const runButton = await page.$('button:has-text("Run"), button:has-text("跑步")');
  if (runButton) {
    await runButton.click();
    console.log('Run button clicked');
  }
  
  await page.waitForTimeout(10000);
  await browser.close();
})();
