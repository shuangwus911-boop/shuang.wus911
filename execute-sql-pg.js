const { Client } = require('pg');

// Supabase connection string from the dashboard
const connectionString = 'postgresql://postgres:[YOUR-PASSWORD]@db.gcfkdnevhvhqmnzelnec.supabase.co:5432/postgres';

const SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

DROP TRIGGER IF EXISTS update_amazon_updated_at ON amazon_products;
CREATE TRIGGER update_amazon_updated_at
  BEFORE UPDATE ON amazon_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

async function executeSQL() {
  console.log('Note: This script requires the database password.');
  console.log('Please set the DATABASE_PASSWORD environment variable.');
  console.log('You can find the password in your Supabase dashboard under Database Settings.');
  
  const password = process.env.DATABASE_PASSWORD;
  if (!password) {
    console.error('Error: DATABASE_PASSWORD environment variable not set.');
    console.error('Please run: export DATABASE_PASSWORD=your_password');
    process.exit(1);
  }
  
  const connStr = connectionString.replace('[YOUR-PASSWORD]', password);
  
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    await client.query(SQL);
    console.log('SQL executed successfully!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log('\nTables created:');
    result.rows.forEach(row => console.log(' -', row.table_name));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

executeSQL();
