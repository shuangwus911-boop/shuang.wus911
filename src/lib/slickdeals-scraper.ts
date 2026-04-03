import * as cheerio from 'cheerio';

export interface SlickdealsDeal {
  title: string;
  url: string;           // Slickdeals 原始 URL
  amazonUrl?: string;     // 解析后的 Amazon URL（如有）
  asin?: string;          // 从 Amazon URL 中提取的 ASIN
  price?: string;
  originalPrice?: string;
  discount?: string;
  store?: string;
  isAmazon: boolean;
  postedTime?: string;
  upvotes?: number;
}

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
};

/**
 * 从任意 URL 中提取 Amazon ASIN
 * 支持多种 Amazon URL 格式
 */
export function extractASINFromUrl(url: string): string | null {
  // 匹配 /dp/XXXXXXXXXX 或 /gp/product/XXXXXXXXXX 或 ?tag=... 中的 ASIN
  const patterns = [
    /(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/i,
    /amazon\.com.*?\/([A-Z0-9]{10})(?:\/|\?|$)/i,
    /asin[=\/]([A-Z0-9]{10})/i
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  return null;
}

/**
 * 跟随 Slickdeals 链接重定向，获取最终的 Amazon URL 和 ASIN
 * Slickdeals 使用类似 /f/17000000-deal-name 的内部 URL，
 * 点击后会通过 302 重定向到实际的 Amazon 商品页面
 */
export async function resolveAmazonUrl(slickdealsUrl: string): Promise<{ amazonUrl: string; asin: string } | null> {
  try {
    // 方法 1: 先检查 URL 本身是否已经包含 ASIN
    const directAsin = extractASINFromUrl(slickdealsUrl);
    if (directAsin) {
      return {
        amazonUrl: `https://www.amazon.com/dp/${directAsin}`,
        asin: directAsin
      };
    }

    // 方法 2: 访问 Slickdeals 页面，从页面内容中提取 Amazon 链接
    const response = await fetch(slickdealsUrl, {
      headers: FETCH_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.warn(`[resolveAmazonUrl] Failed to fetch ${slickdealsUrl}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 在 Slickdeals 帖子页面中查找 Amazon 链接
    // Slickdeals 通常将外部链接放在 "See Deal" 按钮或 class 为 .dealLinks 等位置
    const candidateSelectors = [
      'a.ds-btn[href*="amazon.com"]',
      'a[href*="amazon.com/dp/"]',
      'a[href*="amazon.com/gp/product/"]',
      'a[href*="amzn.to"]',
      '.seeDealsSection a[href*="amazon"]',
      '.continueButton a',
      'a.outclick-link[href*="amazon"]',
      // Slickdeals 经常在 data 属性中保存目标 URL
    ];

    for (const selector of candidateSelectors) {
      const link = $(selector).first().attr('href');
      if (link) {
        const asin = extractASINFromUrl(link);
        if (asin) {
          return { amazonUrl: `https://www.amazon.com/dp/${asin}`, asin };
        }
      }
    }

    // 方法 3: 搜索页面中所有链接，找含有 Amazon ASIN 的
    const allLinks: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && (href.includes('amazon.com') || href.includes('amzn.to') || href.includes('amzn.com'))) {
        allLinks.push(href);
      }
    });

    for (const link of allLinks) {
      const asin = extractASINFromUrl(link);
      if (asin) {
        return { amazonUrl: `https://www.amazon.com/dp/${asin}`, asin };
      }
    }

    // 方法 4: 尝试跟随 amzn.to 短链接
    for (const link of allLinks) {
      if (link.includes('amzn.to') || link.includes('amzn.com')) {
        try {
          const shortResponse = await fetch(link, {
            method: 'HEAD',
            redirect: 'follow',
            headers: FETCH_HEADERS,
            signal: AbortSignal.timeout(10000)
          });
          const finalUrl = shortResponse.url;
          const asin = extractASINFromUrl(finalUrl);
          if (asin) {
            return { amazonUrl: `https://www.amazon.com/dp/${asin}`, asin };
          }
        } catch {
          // 短链接解析失败，跳过
        }
      }
    }

    console.warn(`[resolveAmazonUrl] No Amazon ASIN found in ${slickdealsUrl}`);
    return null;

  } catch (error) {
    console.error(`[resolveAmazonUrl] Error resolving ${slickdealsUrl}:`, error);
    return null;
  }
}

/**
 * 爬取 Slickdeals Frontpage 热门交易
 * 使用多种选择器策略，兼容 Slickdeals 不同的页面结构
 */
export async function crawlSlickdeals(): Promise<SlickdealsDeal[]> {
  try {
    const response = await fetch('https://slickdeals.net/deals/', {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Slickdeals responded with status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const deals: SlickdealsDeal[] = [];
    const seenUrls = new Set<string>();

    // 多组选择器策略，覆盖 Slickdeals 不同的页面版本
    const dealSelectors = [
      '[data-dealid]',
      '.dealCard',
      '.bp-p-dealCard',
      '.fpItem',
      '.dealTile',
      'li[id^="deal_"]',
      '.resultRow',
      '.dealWrapper'
    ];

    const titleSelectors = [
      'a.bp-c-card_title',
      'a.dealTitle',
      '.itemTitle a',
      '.dealCard__title a',
      'a[data-deal-title]',
      'h2 a',
      'h3 a',
      '.resultTitle a'
    ];

    const priceSelectors = [
      '.bp-c-card_price',
      '.dealPrice',
      '.itemPrice',
      '.price',
      'span[data-deal-price]'
    ];

    const storeSelectors = [
      '.bp-c-card_store',
      '.dealStore',
      '.storeName',
      '.merchant',
      'span[data-deal-store]'
    ];

    // 尝试每组选择器
    const mainSelector = dealSelectors.join(', ');
    $(mainSelector).each((_, element) => {
      const $el = $(element);
      const elText = $el.text();

      // 提取标题和链接
      let title = '';
      let link = '';
      for (const sel of titleSelectors) {
        const $title = $el.find(sel).first();
        if ($title.length > 0) {
          title = $title.text().trim();
          link = $title.attr('href') || '';
          break;
        }
      }

      // 回退：直接取第一个含有文字的链接
      if (!title) {
        const $firstLink = $el.find('a').filter((_, a) => {
          const text = $(a).text().trim();
          return text.length > 10; // 跳过太短的链接文字（如 "See Deal"）
        }).first();
        title = $firstLink.text().trim();
        link = $firstLink.attr('href') || '';
      }

      if (!title || !link) return;

      const fullUrl = link.startsWith('http') ? link : `https://slickdeals.net${link}`;
      if (seenUrls.has(fullUrl)) return;
      seenUrls.add(fullUrl);

      // 判断是否为 Amazon 商品
      const isAmazon = elText.toLowerCase().includes('amazon') ||
                       $el.find('[data-store="amazon"], .store-amazon').length > 0 ||
                       link.includes('amazon.com');

      // 只保留 Amazon 商品
      if (!isAmazon) return;

      // 提取价格
      let price = '';
      for (const sel of priceSelectors) {
        price = $el.find(sel).first().text().trim();
        if (price) break;
      }

      // 提取商店
      let store = '';
      for (const sel of storeSelectors) {
        store = $el.find(sel).first().text().trim();
        if (store) break;
      }

      // 提取点赞数
      const upvotesText = $el.find('.bp-c-card_thumbCount, .upvotes, .vote-count, [data-deal-score]').first().text().trim();
      const upvotes = parseInt(upvotesText.replace(/[^0-9]/g, '')) || 0;

      deals.push({
        title,
        url: fullUrl,
        price: price || undefined,
        store: store || 'Amazon',
        isAmazon: true,
        upvotes
      });
    });

    // 如果主选择器没有匹配到任何结果，尝试简单的 Amazon 链接搜集
    if (deals.length === 0) {
      console.log('Primary selectors found no deals, falling back to link scanning...');
      $('a[href]').each((_, el) => {
        const $a = $(el);
        const href = $a.attr('href') || '';
        const text = $a.text().trim();

        // 寻找包含 Amazon 相关信息的链接
        if (text.length > 15 && (
          href.includes('amazon.com') || 
          $a.closest('[data-dealid]').length > 0 ||
          ($a.parent().text().toLowerCase().includes('amazon') && href.startsWith('/f/'))
        )) {
          const fullUrl = href.startsWith('http') ? href : `https://slickdeals.net${href}`;
          if (!seenUrls.has(fullUrl)) {
            seenUrls.add(fullUrl);
            deals.push({
              title: text,
              url: fullUrl,
              store: 'Amazon',
              isAmazon: true,
              upvotes: 0
            });
          }
        }
      });
    }

    console.log(`Crawled ${deals.length} Amazon deals from Slickdeals`);
    return deals;

  } catch (error) {
    console.error('Error crawling Slickdeals:', error);
    return [];
  }
}
