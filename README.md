# 竞对商品自动化监控系统

> 免费实现 Slickdeals 监控 → Amazon 数据抓取 → AliExpress 货源匹配的全流程自动化

## 📢 最新更新

- **2026-04-02**: ✅ Vercel 部署成功，环境变量已配置

## 🎯 功能特性

- ✅ **自动监控**: 每日爬取 Slickdeals Frontpage 热门交易
- ✅ **智能评分**: 基于销量、评分、评论数、折扣力度计算 1-5 星评分
- ✅ **货源匹配**: 自动匹配 AliExpress 同款商品，计算利润率
- ✅ **完全免费**: 使用免费代理池 + GitHub Actions + Supabase 免费档
- ✅ **钉钉通知**: 每日自动推送选品报告到钉钉群

## 🏗️ 技术架构

```
Frontend: Next.js 14 + TailwindCSS
Backend: GitHub Actions (定时任务)
Database: Supabase (PostgreSQL 免费档)
Scraping: Puppeteer + Cheerio
Proxy: 免费代理池自动轮换
```

## 🚀 快速开始

### Step 1: 创建 Supabase 项目

1. 访问 https://supabase.com
2. 注册账号（推荐使用 GitHub 登录）
3. Create new project → 选择免费档
4. 等待 2 分钟初始化完成
5. 进入 **SQL Editor**，复制 `supabase/schema.sql` 内容并执行

### Step 2: 获取 API Key

在 Supabase 项目设置中找到：
- **Project URL** → 填入 `.env.example` 的 `SUPABASE_URL`
- **anon/public key** → 填入 `.env.example` 的 `SUPABASE_ANON_KEY`

### Step 3: 部署到 Vercel

```bash
# Fork 本仓库到你的 GitHub

# 访问 https://vercel.com/new
# Import 你的仓库
# 添加环境变量（从 .env.example 复制）
# Deploy
```

### Step 4: 配置 GitHub Actions

在你的 GitHub 仓库中：
1. Settings → Secrets and variables → Actions → New repository secret
2. 添加以下 secrets：
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJxxx...
   DINGTALK_TOKEN=xxxxxx (可选，钉钉机器人 Token)
   ```

### Step 5: 手动触发测试

在 GitHub 仓库页面：
1. Actions → Daily Product Crawl → Run workflow
2. 等待 2-5 分钟运行完成
3. 查看 Vercel 部署的网站，确认数据已显示

## 📊 数据库 Schema

### amazon_products 表
| 字段 | 类型 | 说明 |
|------|------|------|
| asin | VARCHAR(10) | Amazon 商品 ID |
| title | TEXT | 商品标题 |
| price | DECIMAL | 当前价格 |
| rating | DECIMAL(3,2) | 用户评分 (0-5) |
| review_count | INTEGER | 评论数量 |
| bsr_rank | INTEGER | Best Sellers Rank |
| score | DECIMAL(3,2) | 智能评分 (1-5 星) |

### ae_matches 表
| 字段 | 类型 | 说明 |
|------|------|------|
| amazon_product_id | UUID | 关联 Amazon 商品 |
| ae_product_id | VARCHAR(50) | AE 商品 ID |
| ae_price | DECIMAL | AE 售价 |
| profit_margin | DECIMAL(5,2) | 利润率 (%) |
| status | VARCHAR(20) | potential/verified/rejected |

## 🔧 核心算法

### 评分算法
```typescript
评分 = 用户评分 (30%) + 评论数 (25%) + BSR 排名 (30%) + 折扣力度 (15%)

示例:
- 4.5 星商品，1000 条评论，BSR Top 5000，7 折优惠
- 得分 = 4.5*0.3 + log10(1001)*1.5*0.25 + (5-5000/2000)*0.3 + 0.3*10*0.15
- 得分 ≈ 4.2 星 → 潜力商品 ✅
```

### 匹配规则
```
潜力商品条件:
1. 评分 >= 3.0 星
2. AE 价格 < Amazon 价格 * 0.8
3. AE 库存 > 10 件

满足所有条件 → 标记为"potential"
```

## 📝 本地开发

```bash
# 克隆仓库
git clone https://github.com/yourname/competitor-monitor.git
cd competitor-monitor

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env.local

# 编辑 .env.local 填入配置

# 运行爬虫（本地测试）
npm run crawl

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看效果

## 🌐 部署说明

### Vercel 部署（推荐）

前端自动部署到 Vercel：
- 免费 HTTPS + CDN
- 每月 100GB 带宽
- 自动 CI/CD

### 数据库

使用 Supabase 托管 PostgreSQL：
- 免费 500MB 存储
- 自动备份
- RESTful API 自动生成

### 定时任务

GitHub Actions 每天运行：
- 免费 2000 分钟/月
- 无需额外服务器
- 失败自动重试

## 💰 成本分析

### 零成本方案（MVP）
- Supabase: $0/月 (500MB 免费)
- Vercel: $0/月 (100GB 免费)
- GitHub Actions: $0/月 (2000 分钟免费)
- 代理池: $0 (免费代理)
- **总计：$0/月**

### 可扩展方案（业务验证后）
- 高质量代理：$50-150/月
- Keepa API: $49/月 (精准 BSR 数据)
- Supabase Pro: $25/月 (更多存储)
- **总计：$124-224/月**

## 🔔 钉钉通知配置

1. 钉钉群 → 群设置 → 智能群助手 → 添加机器人
2. 选择"自定义"机器人
3. 复制 Webhook URL
4. 提取 access_token 参数填入 `DINGTALK_TOKEN`

示例通知格式：
```
## 🎯 每日选品报告

- 抓取商品数：156
- 潜力爆品：23
- 平均利润率：45.6%

[查看详情](https://your-app.vercel.app)
```

## ⚠️ 注意事项

1. **代理稳定性**: 免费代理成功率约 60-70%，建议业务验证后升级到付费代理
2. **反爬对抗**: Amazon 可能封 IP，已实现指数退避 + 代理轮换策略
3. **数据清理**: 定期清理超过 30 天的旧数据（避免超出 500MB 限制）
4. **API 限制**: SerpApi 免费版有调用次数限制，可切换至直接抓取模式

## 🛠️ 常见问题

### Q: 爬虫运行失败怎么办？
A: 检查 GitHub Actions 日志，常见原因：
- Supabase 配置错误 → 检查 URL 和 Key
- 代理不可用 → 等待下次自动更新代理池
- Amazon 验证码 → 降低爬取频率

### Q: 如何调整评分权重？
A: 修改 `src/lib/scoring.ts` 中的 `weights` 对象

### Q: 想增加其他平台（如 eBay）？
A: 参考 `slickdeals-scraper.ts` 结构，创建新的爬虫脚本

## 📄 License

MIT

---

**🎉 现在就开始发现你的第一个爆款商品吧！**
