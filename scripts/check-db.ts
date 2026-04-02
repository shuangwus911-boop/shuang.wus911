#!/usr/bin/env node
/**
 * 数据库检查脚本
 * 验证爬虫数据是否正确保存
 */

import { supabase } from '../src/lib/supabase-client';

async function checkDatabase() {
  console.log('🔍 Checking database...\n');
  
  // 检查 amazon_products 表
  console.log('📦 Amazon Products Table:');
  const { data: amazonProducts, error: amazonError } = await supabase
    .from('amazon_products')
    .select('*')
    .limit(10);
  
  if (amazonError) {
    console.error('Error:', amazonError.message);
  } else {
    console.log(`Total products: ${amazonProducts?.length || 0}`);
    if (amazonProducts && amazonProducts.length > 0) {
      console.log('\nSample products:');
      amazonProducts.forEach(p => {
        console.log(`  - ${p.title?.substring(0, 50)}... | ASIN: ${p.asin} | Score: ${p.score}⭐ | Price: $${p.price}`);
      });
    }
  }
  
  // 检查 ae_matches 表
  console.log('\n\n🔗 AE Matches Table:');
  const { data: aeMatches, error: aeError } = await supabase
    .from('ae_matches')
    .select('*')
    .limit(10);
  
  if (aeError) {
    console.error('Error:', aeError.message);
  } else {
    console.log(`Total matches: ${aeMatches?.length || 0}`);
    if (aeMatches && aeMatches.length > 0) {
      console.log('\nSample matches:');
      aeMatches.forEach(m => {
        console.log(`  - ${m.ae_title?.substring(0, 50)}... | Profit: ${m.profit_margin}% | Score: ${m.match_score}`);
      });
    }
  }
  
  // 检查 crawl_logs 表
  console.log('\n\n📋 Crawl Logs Table:');
  const { data: crawlLogs, error: logsError } = await supabase
    .from('crawl_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (logsError) {
    console.error('Error:', logsError.message);
  } else {
    console.log(`Total logs: ${crawlLogs?.length || 0}`);
    if (crawlLogs && crawlLogs.length > 0) {
      console.log('\nRecent logs:');
      crawlLogs.forEach(log => {
        console.log(`  - [${log.status}] ${log.task_type} | Items: ${log.items_found} | ${new Date(log.created_at).toLocaleString()}`);
      });
    }
  }
}

checkDatabase().catch(console.error);
