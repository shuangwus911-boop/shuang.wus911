import puppeteer from 'puppeteer-core';
import { proxyPool } from './proxy-manager';

export interface AmazonProductData {
  asin: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  bsrRank: number;
  bsrCategory?: string;
  images: string[];
  url: string;
  inStock: boolean;
}

/**
 * 抓取 Amazon 商品详情
 */
export async function scrapeAmazonProduct(asin: string): Promise<AmazonProductData | null> {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const proxy = proxyPool.getProxy();
    
    if (!proxy && attempt === 1) {
      console.log(`[ASIN:${asin}] No proxy available, trying direct connection...`);
    } else if (proxy) {
      console.log(`[ASIN:${asin}] Using proxy ${proxy.ip}:${proxy.port} (attempt ${attempt})`);
    }
    
    let browser = null;
    
    try {
      // 下载 Chromium（首次运行会自动下载）
      const browserOptions: any = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      };

      if (proxy) {
        browserOptions.args.push(`--proxy-server=${proxy.protocol}://${proxy.ip}:${proxy.port}`);
      }

      browser = await puppeteer.launch(browserOptions);
      
      const page = await browser.newPage();
      
      // 设置 User-Agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // 设置 viewport
      await page.setViewport({ width: 1280, height: 800 });

      // 禁用图片加载加速
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.resourceType() === 'image') {
          req.continue(); // 仍然加载图片用于截图验证
        } else {
          req.continue();
        }
      });

      const url = `https://www.amazon.com/dp/${asin}`;
      
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // 检测是否被验证码拦截
      const hasCaptcha = await page.$('#captchacharacters');
      if (hasCaptcha) {
        console.warn(`[ASIN:${asin}] CAPTCHA detected`);
        if (proxy) proxyPool.reportResult(proxy, false);
        throw new Error('CAPTCHA detected');
      }

      // 检测是否有商品数据
      const productData = await page.evaluate(() => {
        // 检查页面是否存在
        const titleElement = document.querySelector('#productTitle');
        if (!titleElement) {
          return null; // 商品不存在或被限制访问
        }

        // 提取价格
        const getPrice = (): number => {
          const wholeEl = document.querySelector('.a-price-whole');
          const fractionEl = document.querySelector('.a-price-fraction');
          
          if (wholeEl) {
            const whole = wholeEl.textContent?.trim() || '0';
            const fraction = fractionEl?.textContent?.trim() || '00';
            return parseFloat(`${whole}.${fraction}`);
          }
          
          // 备用选择器
          const priceEl = document.querySelector('.a-offscreen');
          if (priceEl) {
            const priceText = priceEl.textContent?.replace('$', '').replace(',', '');
            const price = parseFloat(priceText || '0');
            return isNaN(price) ? 0 : price;
          }
          
          return 0;
        };

        // 提取原价
        const getOriginalPrice = (): number | undefined => {
          const listPriceEl = document.querySelector('.a-price.a-text-price');
          if (listPriceEl) {
            const priceText = listPriceEl.getAttribute('aria-valuenow') || 
                             listPriceEl.textContent?.replace('$', '').replace(',', '');
            const price = parseFloat(priceText || '0');
            return isNaN(price) ? undefined : price;
          }
          return undefined;
        };

        // 提取评分
        const getRating = (): number => {
          const starsEl = document.querySelector('[data-hook="average-star-rating"] .a-size-base');
          if (starsEl) {
            const rating = parseFloat(starsEl.textContent || '0');
            return isNaN(rating) ? 0 : rating;
          }
          return 0;
        };

        // 提取评论数
        const getReviewCount = (): number => {
          const reviewsEl = document.querySelector('[data-hook="total-review-count"]');
          if (reviewsEl) {
            const text = reviewsEl.textContent?.replace(/,/g, '') || '0';
            const count = parseInt(text);
            return isNaN(count) ? 0 : count;
          }
          return 0;
        };

        // 提取 BSR 排名
        const getBSR = (): { rank: number; category?: string } => {
          const bsrRows = Array.from(document.querySelectorAll('#productDetails_detailBullets_sections_id li, #detailBulletsWrapper_feature_div li'));
          const bsrRow = bsrRows.find(li => li.textContent?.includes('Best Sellers Rank') || li.textContent?.includes('BSR'));
          
          if (!bsrRow) return { rank: 0 };
          
          const text = bsrRow.textContent || '';
          const match = text.match(/#([\d,]+)\s+in\s+(.+)/i);
          
          if (match) {
            const rank = parseInt(match[1].replace(/,/g, ''));
            const category = match[2].trim().split('(')[0].trim();
            return { 
              rank: isNaN(rank) ? 0 : rank,
              category
            };
          }
          
          return { rank: 0 };
        };

        // 提取图片
        const getImages = (): string[] => {
          const imgElements = document.querySelectorAll('#imgTagWrapperId img, #landingImage');
          return Array.from(imgElements)
            .map(img => img.getAttribute('src'))
            .filter((src): src is string => !!src)
            .slice(0, 5);
        };

        // 检查库存
        const isInStock = (): boolean => {
          const availability = document.querySelector('#availability span');
          if (availability) {
            const text = availability.textContent?.toLowerCase() || '';
            return !text.includes('out of stock') && !text.includes('unavailable');
          }
          return true; // 默认有货
        };

        return {
          title: titleElement.textContent?.trim() || '',
          price: getPrice(),
          originalPrice: getOriginalPrice(),
          rating: getRating(),
          reviewCount: getReviewCount(),
          bsr: getBSR(),
          images: getImages(),
          inStock: isInStock()
        };
      });

      if (!productData) {
        console.warn(`[ASIN:${asin}] Product not found or restricted`);
        if (proxy) proxyPool.reportResult(proxy, false);
        await browser.close();
        return null;
      }

      // 报告代理成功
      if (proxy) proxyPool.reportResult(proxy, true);

      await browser.close();

      return {
        asin,
        title: productData.title,
        price: productData.price,
        originalPrice: productData.originalPrice,
        rating: productData.rating,
        reviewCount: productData.reviewCount,
        bsrRank: productData.bsr.rank,
        bsrCategory: productData.bsr.category,
        images: productData.images,
        url,
        inStock: productData.inStock
      };

    } catch (error: any) {
      console.error(`[ASIN:${asin}] Attempt ${attempt} failed:`, error.message);
      
      if (proxy) proxyPool.reportResult(proxy, false);
      
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // Ignore close errors
        }
      }
      
      if (attempt === maxRetries) {
        console.error(`[ASIN:${asin}] Failed after ${maxRetries} attempts`);
        return null;
      }
      
      // 指数退避
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
}
