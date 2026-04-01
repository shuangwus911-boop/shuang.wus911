# 📋 部署检查清单

## 部署前准备

### ✅ Supabase 配置
- [ ] 注册 Supabase 账号 (https://supabase.com)
- [ ] 创建新项目（选择免费档）
- [ ] 等待项目初始化完成（约 2 分钟）
- [ ] 打开 SQL Editor
- [ ] 复制 `supabase/schema.sql` 全部内容
- [ ] 执行 SQL 脚本
- [ ] 确认所有表创建成功
- [ ] 记录 Project URL
- [ ] 记录 anon/public key

### ✅ GitHub 配置
- [ ] 创建 GitHub 仓库
- [ ] 将代码推送到仓库
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/YOUR_USERNAME/competitor-monitor.git
  git push -u origin main
  ```

### ✅ Vercel 部署
- [ ] 登录 Vercel (https://vercel.com)
- [ ] Import Git Repository
- [ ] 选择 competitor-monitor 仓库
- [ ] 配置环境变量：
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
- [ ] 点击 Deploy
- [ ] 等待部署完成（1-2 分钟）
- [ ] 访问分配的域名测试首页

### ✅ GitHub Secrets 配置
- [ ] 打开仓库 Settings
- [ ] 进入 Secrets and variables → Actions
- [ ] 添加 New repository secret:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] DINGTALK_TOKEN (可选)

---

## 功能测试

### ✅ 数据库测试
- [ ] 在 Supabase Table Editor 查看表
- [ ] 确认 amazon_products 表存在
- [ ] 确认 ae_matches 表存在
- [ ] 确认 crawl_logs 表存在

### ✅ 爬虫测试（本地）
```bash
cd competitor-monitor
cp .env.example .env.local
# 编辑 .env.local 填入配置
npm install
npm run crawl
```
- [ ] 爬虫成功运行
- [ ] Console 输出商品数据
- [ ] Supabase 中出现新记录

### ✅ GitHub Actions 测试
- [ ] 进入 Actions 标签页
- [ ] 点击 Daily Product Crawl
- [ ] 点击 Run workflow
- [ ] 等待运行完成（2-5 分钟）
- [ ] 查看日志确认无错误
- [ ] 检查 Supabase 是否有新数据

### ✅ 前端测试
- [ ] 访问 Vercel 域名
- [ ] 首页正常显示
- [ ] 点击"进入仪表盘"
- [ ] 仪表盘显示统计数据
- [ ] 商品列表正常渲染
- [ ] 展开 AE 匹配详情
- [ ] 链接可跳转到 Amazon/AE

---

## 钉钉通知配置（可选）

### ✅ 创建钉钉机器人
- [ ] 打开钉钉群
- [ ] 群设置 → 智能群助手
- [ ] 添加机器人 → 自定义
- [ ] 设置机器人名称（如"选品助手"）
- [ ] 复制 Webhook URL
- [ ] 提取 access_token 参数
- [ ] 添加到 GitHub Secrets: DINGTALK_TOKEN

### ✅ 测试通知
- [ ] 手动触发 GitHub Actions
- [ ] 等待运行完成
- [ ] 检查钉钉群是否收到消息
- [ ] 消息格式正确

---

## 性能优化（可选）

### ✅ 代理池优化
- [ ] 观察爬虫日志中的代理成功率
- [ ] 如果低于 50%，考虑：
  - [ ] 增加代理源（修改 proxy-manager.ts）
  - [ ] 升级到付费代理（$50-150/月）

### ✅ 数据库优化
- [ ] 定期检查索引使用情况
- [ ] 清理超过 30 天的旧数据
  ```sql
  DELETE FROM amazon_products 
  WHERE created_at < NOW() - INTERVAL '30 days';
  ```

### ✅ 爬虫速度优化
- [ ] 调整并发数（默认串行）
- [ ] 修改延时时间（默认 2 秒/请求）
- [ ] 添加断点续爬功能

---

## 监控与维护

### ✅ 日常监控
- [ ] 每天检查 GitHub Actions 运行状态
- [ ] 查看钉钉通知是否正常
- [ ] 检查 Supabase 存储使用量
- [ ] 监控 Vercel 带宽使用

### ✅ 定期维护
- [ ] 每周清理旧数据（释放空间）
- [ ] 每月检查代理池质量
- [ ] 每季度更新依赖包
  ```bash
  npm update
  ```

### ✅ 故障处理
- [ ] 建立 Issue 模板
- [ ] 记录常见问题 FAQ
- [ ] 准备回滚方案

---

## 文档完善

### ✅ 团队培训
- [ ] 准备使用手册
- [ ] 录制操作视频
- [ ] 组织培训课程

### ✅ 知识库
- [ ] 整理技术文档
- [ ] 记录最佳实践
- [ ] 收集用户反馈

---

## 验收标准

### ✅ 功能验收
- [ ] 每日自动爬取正常运行
- [ ] 数据库存储至少 100 个商品
- [ ] 仪表盘正确显示数据
- [ ] AE 匹配准确率>60%
- [ ] 评分算法合理（人工抽检）

### ✅ 性能验收
- [ ] 爬虫运行时间<30 分钟
- [ ] 页面加载时间<2 秒
- [ ] 数据库查询响应<500ms

### ✅ 稳定性验收
- [ ] 连续运行 7 天无故障
- [ ] 爬虫成功率>80%
- [ ] 数据一致性校验通过

---

## 下一步计划

### Week 1: 基础功能验证
- [ ] 完成所有部署步骤
- [ ] 验证核心功能正常
- [ ] 收集团队初步反馈

### Week 2-3: 优化调整
- [ ] 根据反馈调整评分权重
- [ ] 优化 UI/UX
- [ ] 添加常用筛选条件

### Month 2: 功能扩展
- [ ] 增加其他平台支持（eBay、Walmart）
- [ ] 接入图片搜索 API
- [ ] 添加数据导出功能

### Month 3+: 商业化考量
- [ ] 评估 ROI 决定是否升级
- [ ] 考虑购买付费服务
- [ ] 规划多租户架构

---

**📌 提示**: 完成每项后打勾，遇到问题请参考 README.md 或提交 Issue
