# 📚 项目文档索引

欢迎使用竞对商品自动化监控系统！本文档索引帮助您快速找到所需信息。

---

## 🚀 新手入门（按顺序阅读）

### 1️⃣ [README.md](./README.md) - 项目总览 ⭐ 必读
**阅读时间：5 分钟**

了解项目的：
- ✅ 功能特性介绍
- ✅ 技术架构说明
- ✅ 核心算法解析
- ✅ 成本分析（零成本方案）
- ✅ 常见问题 FAQ

**适合人群**: 所有用户

---

### 2️⃣ [DEPLOYMENT.md](./DEPLOYMENT.md) - 快速部署指南 ⭐ 必读
**阅读时间：10 分钟**

一步步教你：
- ✅ 注册 Supabase 并初始化数据库
- ✅ 获取 API Key
- ✅ 上传代码到 GitHub
- ✅ 部署到 Vercel
- ✅ 配置 GitHub Actions
- ✅ 手动触发测试
- ✅ 故障排查方法

**适合人群**: 首次部署的用户

---

### 3️⃣ [CHECKLIST.md](./CHECKLIST.md) - 部署检查清单
**阅读时间：作为参考**

详细的检查清单，确保：
- ✅ 所有配置步骤正确
- ✅ 所有功能测试通过
- ✅ 钉钉通知配置完成
- ✅ 性能优化到位
- ✅ 监控维护机制建立

**适合人群**: 严谨型用户、团队部署

---

### 4️⃣ [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目交付总结
**阅读时间：8 分钟**

深入了解：
- ✅ 已完成功能详解
- ✅ 项目结构说明
- ✅ 核心功能演示
- ✅ 技术亮点剖析
- ✅ 已知限制与解决方案
- ✅ 下一步发展计划

**适合人群**: 技术人员、想要深度定制的用户

---

## 📖 按主题查找文档

### 🏗️ 架构设计
- **技术架构图**: [README.md](./README.md) 的"技术架构"章节
- **核心算法**: [README.md](./README.md) 的"核心算法"章节
- **数据表结构**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 的"数据库 Schema"章节

### 🔧 部署运维
- **快速部署**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **检查清单**: [CHECKLIST.md](./CHECKLIST.md)
- **环境变量**: [.env.example](./.env.example)
- **GitHub Actions**: [.github/workflows/daily-crawl.yml](./.github/workflows/daily-crawl.yml)

### 💻 开发指南
- **本地开发**: [README.md](./README.md) 的"本地开发"章节
- **项目结构**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 的"项目结构"章节
- **代码规范**: TypeScript + ESLint 配置

### 🤖 爬虫模块
- **Slickdeals 爬虫**: [src/lib/slickdeals-scraper.ts](./src/lib/slickdeals-scraper.ts)
- **Amazon 爬虫**: [src/lib/amazon-scraper.ts](./src/lib/amazon-scraper.ts)
- **代理管理**: [src/lib/proxy-manager.ts](./src/lib/proxy-manager.ts)
- **AE 匹配器**: [src/lib/ae-matcher.ts](./src/lib/ae-matcher.ts)

### 📊 评分算法
- **评分逻辑**: [src/lib/scoring.ts](./src/lib/scoring.ts)
- **算法说明**: [README.md](./README.md) 的"核心算法"章节
- **权重调整**: 修改 `scoring.ts` 中的 `weights` 对象

### 🎨 前端界面
- **首页**: [src/app/page.tsx](./src/app/page.tsx)
- **仪表盘**: [src/app/dashboard/page.tsx](./src/app/dashboard/page.tsx)
- **样式**: TailwindCSS + 自定义组件

### 🗄️ 数据库
- **Schema**: [supabase/schema.sql](./supabase/schema.sql)
- **客户端**: [src/lib/supabase-client.ts](./src/lib/supabase-client.ts)
- **优化建议**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 的"数据库优化"章节

---

## 🎯 常见任务快速入口

### 任务 1: 首次部署
```
1. 阅读 DEPLOYMENT.md
2. 按照步骤操作
3. 对照 CHECKLIST.md 逐项检查
```

### 任务 2: 本地测试
```bash
cd competitor-monitor
cp .env.example .env.local
# 编辑 .env.local
npm install
npm run crawl        # 运行爬虫
npm run dev          # 启动开发服务器
```

### 任务 3: 调整评分权重
```
编辑 src/lib/scoring.ts
修改 weights 对象
重新部署到 Vercel
```

### 任务 4: 查看爬虫日志
```
GitHub → Actions → Daily Product Crawl → 最新运行记录
```

### 任务 5: 检查数据库
```
Supabase → Table Editor → amazon_products / ae_matches
```

### 任务 6: 手动触发爬虫
```
GitHub → Actions → Daily Product Crawl → Run workflow
```

---

## 🆘 遇到问题？

### 问题类型 A: 部署失败
**解决方案**: 
1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 的"故障排查"章节
2. 检查 GitHub Actions 日志
3. 验证 Supabase 配置

### 问题类型 B: 爬取不到数据
**解决方案**:
1. 检查代理池状态（查看 crawl 日志）
2. 降低爬取频率（修改延时参数）
3. 等待几小时后重试

### 问题类型 C: 前端不显示数据
**解决方案**:
1. 浏览器 Console 检查错误
2. Supabase 确认有数据
3. 验证 API Key 配置

### 问题类型 D: 评分不准确
**解决方案**:
1. 查看 [src/lib/scoring.ts](./src/lib/scoring.ts) 算法
2. 人工抽检评分结果
3. 调整权重参数

### 问题类型 E: 其他问题
**解决方案**:
1. 搜索 [README.md](./README.md) FAQ 章节
2. 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 已知限制
3. 提交 GitHub Issue

---

## 📚 进阶阅读

### 技术深度文
- **代理池管理策略**: [src/lib/proxy-manager.ts](./src/lib/proxy-manager.ts) 源码注释
- **反爬对抗实践**: [src/lib/amazon-scraper.ts](./src/lib/amazon-scraper.ts) 实现细节
- **智能评分算法**: [src/lib/scoring.ts](./src/lib/scoring.ts) 数学原理

### 业务扩展
- **多平台支持**: 参考现有爬虫结构，新增 crawler
- **图片搜索匹配**: 接入 AliExpress Image Search API
- **历史价格追踪**: 集成 Keepa API

### 性能优化
- **数据库索引**: [supabase/schema.sql](./supabase/schema.sql) 中的索引定义
- **并发控制**: 修改 crawl.ts 中的并发策略
- **缓存机制**: 考虑添加 Redis 缓存层

---

## 🔗 外部资源

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vercel 部署指南](https://vercel.com/docs)

### 相关 API
- [AliExpress Portals API](https://portals.aliexpress.com/)
- [SerpApi (AE 搜索)](https://serpapi.com/)
- [Keepa API (Amazon 历史数据)](https://keepa.com/)

### 工具推荐
- [Bright Data (代理)](https://brightdata.com/)
- [Oxylabs (代理)](https://oxylabs.io/)
- [Smartproxy (代理)](https://smartproxy.com/)

---

## 📞 获取帮助

### 优先顺序
1. **查阅文档**: 90% 的问题都能在这里找到答案
2. **搜索 Issue**: GitHub Issues 可能有类似问题
3. **提交 Issue**: 提供详细错误信息和复现步骤
4. **社区讨论**: 相关技术论坛寻求帮助

### 提问模板
```markdown
## 问题描述
[简要描述遇到的问题]

## 复现步骤
1. ...
2. ...
3. ...

## 期望行为
[说明应该发生什么]

## 实际行为
[说明实际发生了什么]

## 环境信息
- Node.js 版本：
- 部署方式：Vercel / 本地
- 浏览器（如果是前端问题）：
```

---

## 🎉 开始使用

现在您已经了解了所有文档的位置，让我们开始吧！

**推荐阅读顺序**:
1. [README.md](./README.md) - 了解项目
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - 快速部署
3. [CHECKLIST.md](./CHECKLIST.md) - 验证功能
4. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 深入理解

**祝您使用愉快！** 🚀
