import * as cheerio from 'cheerio';

export interface AEProduct {
  productId: string;
  title: string;
  salePrice: number;
  originalPrice?: number;
  inventory: number;
  imageUrl: string;
  affiliateUrl: string;
}

/**
 * 在 AliExpress 上搜索匹配商品
 */
export async function findAEMatches(
  amazonTitle: string,
  amazonPrice: number,
  imageUrl?: string
): Promise<AEProduct[]> {
  try {
    // 方案 1: 文本搜索（无需 API Key）
    let searchResults = await searchByText(amazonTitle);
    
    // 方案 2: 如果有图片，尝试图片搜索（需要 API Key，暂时跳过）
    // if (imageUrl) {
    //   const imageResults = await searchByImage(imageUrl);
    //   searchResults.push(...imageResults);
    // }
    
    console.log(`Found ${searchResults.length} potential AE matches`);
    
    // 筛选符合条件的商品：价格 < 80% Amazon 价 && 库存 > 10
    const matches = searchResults
      .filter(product => {
        const priceRatio = amazonPrice > 0 ? product.salePrice / amazonPrice : 1;
        return priceRatio < 0.8 && product.inventory > 10;
      })
      .sort((a, b) => a.salePrice - b.salePrice)
      .slice(0, 5); // 只保留最便宜的 5 个
    
    console.log(`Filtered to ${matches.length} matching products`);
    return matches;
    
  } catch (error) {
    console.error('Error finding AE matches:', error);
    return [];
  }
}

/**
 * 通过文本搜索 AE 商品
 */
async function searchByText(title: string): Promise<AEProduct[]> {
  try {
    // 使用第三方免 API 服务（有调用限制）
    const demoKey = 'demo'; // SerpApi 提供免费额度
    const searchUrl = `https://serpapi.com/search.json?engine=aliexpress&q=${encodeURIComponent(title)}&api_key=${demoKey}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.organic_results && Array.isArray(data.organic_results)) {
        return data.organic_results.map((item: any) => ({
          productId: item.product_id || '',
          title: item.title || '',
          salePrice: parseFloat(item.sale_price?.replace('$', '') || '0'),
          originalPrice: item.original_price ? parseFloat(item.original_price.replace('$', '')) : undefined,
          inventory: item.inventory ?? 999,
          imageUrl: item.image || '',
          affiliateUrl: item.link || ''
        }));
      }
    }
    
    // 如果 API 失败，降级到直接抓取
    console.log('SerpApi failed, falling back to direct scraping');
    return await fallbackScrapeAE(title);
    
  } catch (error) {
    console.warn('Text search failed, using fallback:', error);
    return await fallbackScrapeAE(title);
  }
}

/**
 * 备用方案：直接抓取 AE 搜索结果页
 */
async function fallbackScrapeAE(title: string): Promise<AEProduct[]> {
  try {
    const searchUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(title)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!response.ok) {
      throw new Error(`AE responded with ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const products: AEProduct[] = [];
    
    // AE 的选择器经常变化，这里使用通用选择器
    $('[data-item], .list-item, .product-item').each((_, element) => {
      const $el = $(element);
      
      const title = $el.find('.multi--titleText, .product-title').first().text().trim();
      if (!title) return;
      
      const priceEl = $el.find('.price-current, .sale-price').first();
      const priceText = priceEl.text().replace(/[^0-9.]/g, '');
      const salePrice = parseFloat(priceText) || 0;
      
      const originalPriceEl = $el.find('.price-original, .original-price').first();
      const originalPriceText = originalPriceEl.text().replace(/[^0-9.]/g, '');
      const originalPrice = originalPriceText ? parseFloat(originalPriceText) : undefined;
      
      const imageSrc = $el.find('img').first().attr('src') || '';
      
      const link = $el.find('a').first().attr('href') || '';
      const fullLink = link.startsWith('http') ? link : `https://www.aliexpress.com${link}`;
      
      // 从 data 属性获取商品 ID
      const productId = $el.attr('data-item-id') || 
                       $el.attr('data-product-id') || 
                       extractProductIdFromUrl(fullLink) || '';
      
      products.push({
        productId,
        title,
        salePrice,
        originalPrice,
        inventory: 999, // 无法直接获取，假设充足
        imageUrl: imageSrc,
        affiliateUrl: fullLink
      });
    });
    
    console.log(`Direct scraped ${products.length} products from AE`);
    return products;
    
  } catch (error) {
    console.error('Fallback scraping failed:', error);
    return [];
  }
}

/**
 * 从 AE URL 中提取商品 ID
 */
function extractProductIdFromUrl(url: string): string | null {
  const match = url.match(/item\/(\d+)\.html/);
  return match ? match[1] : null;
}

/**
 * 计算匹配置信度（基于标题相似度）
 */
export function calculateMatchScore(amazonTitle: string, aeTitle: string): number {
  // 简单的 Jaccard 相似度
  const amazonWords = new Set(amazonTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const aeWords = new Set(aeTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  
  const intersection = [...amazonWords].filter(w => aeWords.has(w)).length;
  const union = new Set([...amazonWords, ...aeWords]).size;
  
  return union > 0 ? intersection / union : 0;
}
