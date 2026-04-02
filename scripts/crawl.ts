#!/usr/bin/env node
/**
 * 主爬虫脚本
 * 执行完整的监控流程：
 * 1. 爬取 Slickdeals
 * 2. 抓取 Amazon 详情
 * 3. 计算评分
 * 4. 匹配 AE 商品
 * 5. 保存到数据库
 */

import { crawlSlickdeals, extractASINFromUrl } from '../src/lib/slickdeals-scraper';
import { scrapeAmazonProduct } from '../src/lib/amazon-scraper';
import { findAEMatches, calculateMatchScore } from '../src/lib/ae-matcher';
import { calculateProductScore, calculateProfitMargin, isPotentialProduct } from '../src/lib/scoring';
import { supabase } from '../src/lib/supabase-client';
import { proxyPool } from '../src/lib/proxy-manager';

async function main() {
  console.log('🚀 Starting competitor monitoring crawl...');
  
  const startTime = Date.now();
  
  try {
    // Step 0: 初始化代理池
    console.log('\n📦 Initializing proxy pool...');
    await proxyPool.fetchProxies();
    console.log(`Available proxies: ${proxyPool.getAvailableCount()}`);
    
    // Step 1: 爬取 Slickdeals
    console.log('\n🔍 Crawling Slickdeals...');
    const slickdealsDeals = await crawlSlickdeals();
    console.log(`Found ${slickdealsDeals.length} Amazon deals`);
    
    if (slickdealsDeals.length === 0) {
      console.warn('No deals found on Slickdeals');
      return;
    }
    
    // 记录日志
    await createCrawlLog('slickdeals_crawl', 'completed', slickdealsDeals.length);
    
    // Step 2: 提取 ASIN 并抓取 Amazon 详情
    console.log('\n📊 Scraping Amazon product details...');
    const amazonProducts = [];
    
    for (const deal of slickdealsDeals) {
      const asin = extractASINFromUrl(deal.url);
      
      if (!asin) {
        console.log(`⚠️  Skip ${deal.title}: No ASIN found`);
        continue;
      }
      
      // 检查是否已存在（避免重复抓取）
      const { data: existing } = await supabase
        .from('amazon_products')
        .select('id, updated_at')
        .eq('asin', asin)
        .single();
      
      const existingProduct = existing as any;
      if (existingProduct && existingProduct.updated_at && new Date(existingProduct.updated_at).getTime() > Date.now() - 86400000) {
        console.log(`⏭️  Skip ${asin}: Recently updated (${existingProduct.updated_at})`);
        continue;
      }
      
      console.log(`🛒 Scraping ASIN: ${asin}`);
      const productData = await scrapeAmazonProduct(asin);
      
      if (!productData) {
        console.warn(`❌ Failed to scrape ${asin}`);
        continue;
      }
      
      // 计算评分
      const score = calculateProductScore({
        rating: productData.rating,
        reviewCount: productData.reviewCount,
        bsrRank: productData.bsrRank,
        bsrCategory: productData.bsrCategory,
        price: productData.price,
        originalPrice: productData.originalPrice
      });
      
      console.log(`✅ ${asin}: Score ${score.toFixed(2)} stars`);
      
      amazonProducts.push({
        ...productData,
        score
      });
      
      // 限速：每 2 秒一个请求，避免被封
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n📈 Scraped ${amazonProducts.length} Amazon products`);
    await createCrawlLog('amazon_scrape', 'completed', amazonProducts.length);
    
    // Step 3: 保存到数据库
    console.log('\n💾 Saving to database...');
    const savedProducts: any[] = [];
    
    for (const product of amazonProducts) {
      const { data, error } = await supabase
        .from('amazon_products')
        .upsert({
          asin: product.asin,
          title: product.title,
          price: product.price,
          original_price: product.originalPrice,
          rating: product.rating,
          review_count: product.reviewCount,
          bsr_rank: product.bsrRank,
          bsr_category: product.bsrCategory,
          score: product.score,
          images: product.images,
          url: product.url
        }, {
          onConflict: 'asin'
        })
        .select()
        .single();
      
      if (error) {
        console.error(`Error saving ${product.asin}:`, error.message);
      } else {
        savedProducts.push(data);
        console.log(`💾 Saved ${product.asin}`);
      }
    }
    
    // Step 4: 为 3-5 星商品匹配 AE 商品
    console.log('\n🔗 Finding AliExpress matches...');
    const potentialProducts = savedProducts.filter(p => isPotentialProduct(p.score));
    console.log(`Found ${potentialProducts.length} potential products (score >= 3)`);
    
    let matchCount = 0;
    
    for (const product of potentialProducts) {
      console.log(`\n🔍 Matching AE for ASIN: ${product.asin}`);
      
      const aeMatches = await findAEMatches(product.title, product.price);
      
      if (aeMatches.length === 0) {
        console.log(`⚠️  No AE matches for ${product.asin}`);
        continue;
      }
      
      // 保存匹配结果
      for (const aeProduct of aeMatches) {
        const profitMargin = calculateProfitMargin(product.price, aeProduct.salePrice);
        const matchScore = calculateMatchScore(product.title, aeProduct.title);
        
        const { error } = await supabase
          .from('ae_matches')
          .insert({
            amazon_product_id: product.id,
            ae_product_id: aeProduct.productId,
            ae_title: aeProduct.title,
            ae_price: aeProduct.salePrice,
            ae_original_price: aeProduct.originalPrice,
            ae_inventory: aeProduct.inventory,
            profit_margin: profitMargin,
            match_score: matchScore,
            status: 'potential'
          });
        
        if (error) {
          console.error(`Error saving AE match:`, error.message);
        } else {
          matchCount++;
          console.log(`✅ Matched: ${aeProduct.title.substring(0, 50)}... (Profit: ${profitMargin}%)`);
        }
      }
      
      // 限速
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n💡 Total AE matches: ${matchCount}`);
    await createCrawlLog('ae_match', 'completed', matchCount);
    
    // Step 5: 输出统计
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
    
    console.log('\n✅ Crawl completed!');
    console.log(`⏱️  Duration: ${duration} minutes`);
    console.log(`📦 Amazon products: ${savedProducts.length}`);
    console.log(`🎯 Potential products: ${potentialProducts.length}`);
    console.log(`🔗 AE matches: ${matchCount}`);
    
    // 输出潜力商品列表
    if (potentialProducts.length > 0) {
      console.log('\n🌟 Top Potential Products:');
      potentialProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.title.substring(0, 60)}... (${p.score}⭐, $${p.price})`);
        });
    }
    
  } catch (error: any) {
    console.error('❌ Crawl failed:', error.message);
    await createCrawlLog('main_crawl', 'failed', 0, error.message);
    process.exit(1);
  }
}

/**
 * 创建爬取日志
 */
async function createCrawlLog(
  taskType: string,
  status: string,
  itemsFound: number,
  errorMessage?: string
) {
  try {
    await supabase
      .from('crawl_logs')
      .insert({
        task_type: taskType,
        status,
        items_found: itemsFound,
        error_message: errorMessage
      });
  } catch (error) {
    console.error('Failed to save crawl log:', error);
  }
}

// 运行主函数
main().catch(console.error);
