import * as cheerio from 'cheerio';

export interface SlickdealsDeal {
  title: string;
  url: string;
  price?: string;
  originalPrice?: string;
  discount?: string;
  store?: string;
  isAmazon: boolean;
  postedTime?: string;
  upvotes?: number;
}

/**
 * 爬取 Slickdeals Frontpage 热门交易
 */
export async function crawlSlickdeals(): Promise<SlickdealsDeal[]> {
  try {
    const response = await fetch('https://slickdeals.net/f/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.ok) {
      throw new Error(`Slickdeals responded with status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const deals: SlickdealsDeal[] = [];

    // Slickdeals 使用不同的类名，需要根据实际结构调整
    // 这里使用通用的选择器
    $('.deal-item, .deal, [data-dealid], .frontpage-list .deal').each((_, element) => {
      const $el = $(element);
      
      // 提取标题
      const title = $el.find('.deal-title a, .deal__title a, a[rel="nofollow"]').first().text().trim();
      
      // 提取链接
      const link = $el.find('.deal-title a, .deal__title a, a[rel="nofollow"]').first().attr('href');
      if (!link) return;

      const fullUrl = link.startsWith('http') ? link : `https://slickdeals.net${link}`;

      // 判断是否为 Amazon 商品
      const isAmazon = $el.text().includes('Amazon') || 
                       $el.find('.store-amazon, .amazon').length > 0 ||
                       link.includes('amazon.com');

      // 只保留 Amazon 商品
      if (!isAmazon) return;

      // 提取价格信息
      const price = $el.find('.price, .deal__price, .primary-price').first().text().trim();
      const originalPrice = $el.find('.original-price, .was-price').first().text().trim();
      const discount = $el.find('.discount, .savings').first().text().trim();

      // 提取商店信息
      const store = $el.find('.store-name, .merchant').first().text().trim();

      // 提取发布时间
      const postedTime = $el.find('.posted-time, .deal__age').first().text().trim();

      // 提取点赞数
      const upvotesText = $el.find('.upvotes, .vote-count').first().text().trim();
      const upvotes = parseInt(upvotesText.replace(/[^0-9]/g, '')) || 0;

      deals.push({
        title,
        url: fullUrl,
        price: price || undefined,
        originalPrice: originalPrice || undefined,
        discount: discount || undefined,
        store: store || 'Amazon',
        isAmazon: true,
        postedTime: postedTime || undefined,
        upvotes
      });
    });

    console.log(`Crawled ${deals.length} Amazon deals from Slickdeals`);
    return deals;

  } catch (error) {
    console.error('Error crawling Slickdeals:', error);
    return [];
  }
}

/**
 * 从 Slickdeals 帖子 URL 中提取 Amazon ASIN
 */
export function extractASINFromUrl(url: string): string | null {
  // Amazon URL 格式：https://www.amazon.com/dp/B08N5WRWNW
  const match = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  return match ? match[1] : null;
}
