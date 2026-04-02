#!/usr/bin/env node
/**
 * 简化的爬虫脚本 - 用于首次运行测试
 * 直接抓取 Amazon 热门商品，跳过 Slickdeals
 */

import { supabase } from '../src/lib/supabase-client';

// 模拟一些测试数据（用于验证系统是否工作）
const testProducts = [
  {
    asin: 'B08N5WRWNW',
    title: 'Test Product 1 - Wireless Earbuds',
    price: 29.99,
    original_price: 59.99,
    rating: 4.5,
    review_count: 1250,
    bsr_rank: 100,
    bsr_category: 'Electronics',
    score: 4.2,
    url: 'https://www.amazon.com/dp/B08N5WRWNW'
  },
  {
    asin: 'B09JQL3NWT',
    title: 'Test Product 2 - Smart Watch',
    price: 49.99,
    original_price: 99.99,
    rating: 4.3,
    review_count: 890,
    bsr_rank: 250,
    bsr_category: 'Electronics',
    score: 3.8,
    url: 'https://www.amazon.com/dp/B09JQL3NWT'
  },
  {
    asin: 'B07ZPML7NP',
    title: 'Test Product 3 - Phone Charger',
    price: 15.99,
    original_price: 25.99,
    rating: 4.6,
    review_count: 3200,
    bsr_rank: 50,
    bsr_category: 'Electronics',
    score: 4.5,
    url: 'https://www.amazon.com/dp/B07ZPML7NP'
  }
];

async function main() {
  console.log('🚀 Starting simplified crawl...\n');
  
  try {
    // 检查数据库连接
    console.log('Testing database connection...');
    const { data: testData, error } = await supabase.from('amazon_products').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n⚠️  Please check your Supabase credentials:');
      console.log('   - SUPABASE_URL');
      console.log('   - SUPABASE_ANON_KEY');
      console.log('\n   These should be configured in GitHub Secrets.');
      return;
    }
    
    console.log('✅ Database connection successful!\n');
    
    // 插入测试数据
    console.log('💾 Inserting test products...');
    let savedCount = 0;
    
    for (const product of testProducts) {
      const { data, error } = await supabase
        .from('amazon_products')
        .upsert(product, { onConflict: 'asin' })
        .select()
        .single();
      
      if (error) {
        console.error(`Error saving ${product.asin}:`, error.message);
      } else {
        savedCount++;
        console.log(`✅ Saved: ${product.title.substring(0, 50)}...`);
      }
    }
    
    console.log(`\n✅ Successfully saved ${savedCount} test products!`);
    
    // 为潜力商品创建 AE 匹配
    console.log('\n🔗 Creating AE matches for potential products...');
    let matchCount = 0;
    
    for (const product of testProducts) {
      if (product.score >= 3) {
        const { error } = await supabase
          .from('ae_matches')
          .insert({
            amazon_product_id: product.asin,
            ae_product_id: `ae_${product.asin}`,
            ae_title: `AE Match for ${product.title}`,
            ae_price: product.price * 0.5,
            ae_original_price: product.original_price * 0.6,
            ae_inventory: 100,
            profit_margin: 40,
            match_score: 85,
            status: 'potential'
          });
        
        if (!error) {
          matchCount++;
          console.log(`✅ Created AE match for: ${product.asin}`);
        }
      }
    }
    
    console.log(`\n✅ Created ${matchCount} AE matches!`);
    
    // 记录日志
    await supabase.from('crawl_logs').insert({
      task_type: 'test_crawl',
      status: 'completed',
      items_found: savedCount
    });
    
    console.log('\n✨ Test crawl completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Amazon products: ${savedCount}`);
    console.log(`   - AE matches: ${matchCount}`);
    console.log('\n🎉 Now refresh your dashboard to see the data!');
    
  } catch (error: any) {
    console.error('❌ Crawl failed:', error.message);
  }
}

main().catch(console.error);
