#!/usr/bin/env node
/**
 * 简化的爬虫脚本 - 用于测试
 */

import puppeteer from 'puppeteer-core';

async function testSlickdeals() {
  console.log('🧪 Testing Slickdeals crawl with Puppeteer...\n');
  
  let browser;
  
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Navigating to slickdeals.net/f/ ...');
    await page.goto('https://slickdeals.net/f/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    console.log('Waiting for deals to load...');
    await page.waitForSelector('.deal-item, .deal, [data-dealid]', { timeout: 10000 })
      .catch(() => console.log('Timeout, continuing anyway...'));
    
    // 提取 deals
    const deals = await page.evaluate(() => {
      const dealElements = document.querySelectorAll('.deal-item, .deal, [data-dealid]');
      const results: any[] = [];
      
      dealElements.forEach(el => {
        const title = el.querySelector('.deal-title a, .deal__title a')?.textContent?.trim() || '';
        const link = el.querySelector('.deal-title a, .deal__title a')?.getAttribute('href') || '';
        const price = el.querySelector('.price, .deal__price')?.textContent?.trim() || '';
        
        if (title && (title.toLowerCase().includes('amazon') || link.includes('amazon'))) {
          results.push({ title, price, link });
        }
      });
      
      return results;
    });
    
    console.log(`\n✅ Found ${deals.length} Amazon deals:\n`);
    deals.slice(0, 10).forEach((deal, i) => {
      console.log(`${i + 1}. ${deal.title.substring(0, 60)}... | ${deal.price || 'N/A'}`);
    });
    
    console.log('\n\n✨ Test completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testSlickdeals();
