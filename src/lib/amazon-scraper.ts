import puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as path from 'path';
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
 * 自动检测系统中 Chrome/Chromium 的安装路径
 * 支持 Linux (GitHub Actions)、macOS、Windows
 */
function findChromePath(): string {
  const candidates: string[] = [];

  if (process.platform === 'linux') {
    candidates.push(
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      // npx puppeteer browsers install chrome 安装的路径
      ...findPuppeteerCacheChrome()
    );
  } else if (process.platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    );
  } else if (process.platform === 'win32') {
    candidates.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    );
  }

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        console.log(`[Chrome] Found browser at: ${candidate}`);
        return candidate;
      }
    } catch {
      // 忽略权限错误等
    }
  }

  // 最后的回退：让 puppeteer-core 尝试默认路径
  console.warn('[Chrome] No browser found in standard paths, attempting default launch...');
  return '';
}

/**
 * 查找通过 npx puppeteer browsers install chrome 安装的 Chrome
 */
function findPuppeteerCacheChrome(): string[] {
  const results: string[] = [];

  // Puppeteer 缓存目录
  const cacheDir = path.join(
    process.env.HOME || process.env.USERPROFILE || '/root',
    '.cache',
    'puppeteer'
  );

  try {
    if (fs.existsSync(cacheDir)) {
      // 递归搜索 chrome 可执行文件
      const walkDir = (dir: string, depth: number = 0) => {
        if (depth > 5) return;
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              walkDir(fullPath, depth + 1);
            } else if (entry.name === 'chrome' || entry.name === 'chrome.exe') {
              results.push(fullPath);
            }
          }
        } catch {
          // 忽略
        }
      };
      walkDir(cacheDir);
    }
  } catch {
    // 忽略
  }

  return results;
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
      // 查找 Chrome 浏览器路径
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

      // 设置 executablePath - puppeteer-core 必须显式指定
      const chromePath = process.env.CHROME_PATH || findChromePath();
      if (chromePath) {
        browserOptions.executablePath = chromePath;
      }

      if (proxy) {
        browserOptions.args.push(`--proxy-server=${proxy.protocol}://${proxy.ip}:${proxy.port}`);
      }

      browser = await puppeteer.launch(browserOptions);
      
      const page = await browser.newPage();
      
      // 设置 User-Agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // 设置 viewport
      await page.setViewport({ width: 1280, height: 800 });

      // 禁用图片和字体加载以加速页面渲染
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
          req.abort();
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
            // 去除尾部句号和逗号，避免 "29." + "99" = "29..99" 的问题
            const whole = (wholeEl.textContent?.trim() || '0').replace(/[.,]+$/, '').replace(/,/g, '');
            const fraction = fractionEl?.textContent?.trim() || '00';
            const price = parseFloat(`${whole}.${fraction}`);
            return isNaN(price) ? 0 : price;
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
