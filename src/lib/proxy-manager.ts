interface Proxy {
  ip: string;
  port: number;
  protocol: 'http' | 'https';
  lastUsed?: Date;
  successCount: number;
  failCount: number;
}

export class FreeProxyPool {
  private proxies: Proxy[] = [];
  private lastFetchTime: Date | null = null;

  // 从免费源获取代理
  async fetchProxies() {
    // 避免频繁请求（每小时最多一次）
    if (this.lastFetchTime) {
      const now = new Date();
      const diff = now.getTime() - this.lastFetchTime.getTime();
      if (diff < 3600000) { // 1 小时
        console.log('Skip fetching proxies, last fetch was recent');
        return;
      }
    }

    const sources = [
      { url: 'https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all', type: 'http' },
      { url: 'https://api.proxyscrape.com/v2/?request=get&protocol=https&timeout=10000&country=all&ssl=all&anonymity=all', type: 'https' }
    ];

    const newProxies: Proxy[] = [];

    for (const source of sources) {
      try {
        const response = await fetch(source.url, { 
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) continue;
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        for (const line of lines) {
          const [ip, port] = line.trim().split(':');
          if (ip && port && !isNaN(parseInt(port))) {
            newProxies.push({
              ip: ip.trim(),
              port: parseInt(port.trim()),
              protocol: source.type as 'http' | 'https',
              successCount: 0,
              failCount: 0
            });
          }
        }
        
        console.log(`Fetched ${lines.length} proxies from ${source.url}`);
      } catch (error) {
        console.warn(`Failed to fetch from ${source.url}:`, error);
      }
    }

    // 去重 + 初始化评分
    const seen = new Set<string>();
    this.proxies = newProxies.filter(p => {
      const key = `${p.ip}:${p.port}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    this.lastFetchTime = new Date();
    console.log(`Total available proxies: ${this.proxies.length}`);
  }

  // 获取可用代理
  getProxy(): Proxy | null {
    const available = this.proxies.filter(p => {
      const now = new Date();
      const cooldown = p.lastUsed ? 
        (now.getTime() - p.lastUsed.getTime()) < 300000 : true; // 5 分钟冷却
      return p.successCount >= p.failCount && cooldown;
    });

    if (available.length === 0) return null;

    // 选择成功率最高的
    return available.sort((a, b) => {
      const aRate = a.successCount / (a.successCount + a.failCount + 1);
      const bRate = b.successCount / (b.successCount + b.failCount + 1);
      return bRate - aRate;
    })[0];
  }

  // 报告代理表现
  reportResult(proxy: Proxy, success: boolean) {
    proxy.lastUsed = new Date();
    if (success) {
      proxy.successCount++;
    } else {
      proxy.failCount++;
    }
  }

  // 获取可用代理数量
  getAvailableCount(): number {
    return this.proxies.filter(p => p.successCount >= p.failCount).length;
  }

  // 清空无效代理
  cleanup() {
    this.proxies = this.proxies.filter(p => {
      // 保留至少尝试过且成功率>30% 的代理
      if (p.successCount + p.failCount === 0) return true;
      return p.successCount / (p.successCount + p.failCount) > 0.3;
    });
    console.log(`After cleanup: ${this.proxies.length} proxies remaining`);
  }
}

// 单例模式
export const proxyPool = new FreeProxyPool();
