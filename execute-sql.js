const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gcfkdnevhvhqmnzelnec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZmtkbmV2aHZocW1uemVsbmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTI4ODgsImV4cCI6MjA5MDQyODg4OH0.ABx9350kHFMCvAXhn_x42hXmgWwvWjli6L4e1MOKKv8';

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
CREATE TABLE IF NOT EXISTS amazon_products (
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

CREATE TABLE IF NOT EXISTS ae_matches (
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

CREATE TABLE IF NOT EXISTS crawl_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
`;

async function executeSQL() {
  try {
    // Try to execute SQL via RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // If RPC doesn't exist, try direct table creation
      console.log('Trying direct table creation...');
      
      // Check if tables exist by querying them
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (tablesError) {
        console.error('Error checking tables:', tablesError);
      } else {
        console.log('Existing tables:', tables);
      }
    } else {
      console.log('SQL executed successfully:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

executeSQL();
