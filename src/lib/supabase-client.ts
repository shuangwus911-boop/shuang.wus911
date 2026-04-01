import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 类型定义
export interface AmazonProduct {
  id: string;
  asin: string;
  title: string;
  price: number;
  original_price?: number;
  rating: number;
  review_count: number;
  bsr_rank: number;
  bsr_category?: string;
  score: number;
  images?: string[];
  url: string;
  created_at: string;
  updated_at: string;
}

export interface AEMatch {
  id: string;
  amazon_product_id: string;
  ae_product_id: string;
  ae_title?: string;
  ae_price: number;
  ae_original_price?: number;
  ae_inventory: number;
  profit_margin?: number;
  match_score?: number;
  status: 'potential' | 'verified' | 'rejected';
  created_at: string;
}

export interface CrawlLog {
  id: string;
  task_type: string;
  status: string;
  items_found: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}
