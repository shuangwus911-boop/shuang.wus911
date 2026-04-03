import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// Supabase 客户端配置
// ============================================

// 读取环境变量，兼容两种命名方式：
// - NEXT_PUBLIC_ 前缀: 用于前端 (Vercel 部署)
// - 无前缀: 用于后端脚本 (GitHub Actions 爬虫)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 环境变量校验：缺失时给出明确警告而非静默使用占位符
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables!\n' +
    '  Required: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)\n' +
    '  Required: NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)\n' +
    '  Current SUPABASE_URL:', supabaseUrl ? '✅ set' : '❌ missing',
    '\n  Current SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ set' : '❌ missing'
  );
}

/**
 * 前端客户端 (anon key) - 只读权限
 * 用于 Dashboard 数据展示
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * 服务端客户端 (service_role key) - 完全权限
 * 仅在爬虫脚本中使用，用于写入数据
 * 启用 RLS 后，anon key 只有只读权限，写入操作需要 service_role key
 */
export function getServiceClient(): SupabaseClient {
  if (!supabaseServiceKey) {
    console.warn(
      '[Supabase] SUPABASE_SERVICE_ROLE_KEY not set, falling back to anon client.\n' +
      '  Write operations may fail if RLS is enabled.'
    );
    return supabase;
  }
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey
  );
}

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
