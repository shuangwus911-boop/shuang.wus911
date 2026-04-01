# 🚀 5 分钟快速部署指南

## 前置准备（2 分钟）

### 1. 注册 Supabase
```
访问：https://supabase.com
登录：使用 GitHub 账号
创建项目：New Project → 选择免费档
等待：约 2 分钟初始化完成
```

### 2. 初始化数据库
在 Supabase 控制台：
```
1. 左侧菜单 → SQL Editor
2. 点击 "New query"
3. 复制项目根目录的 supabase/schema.sql 全部内容
4. 粘贴到编辑器
5. 点击 "Run" 执行
6. 确认显示 "Success"
```

### 3. 获取 API Key
```
1. 左侧菜单 → Settings → API
2. 复制 "Project URL" → 记为 SUPABASE_URL
3. 复制 "anon/public" key → 记为 SUPABASE_ANON_KEY
```

---

## 部署到 Vercel（3 分钟）

### Step 1: 上传代码到 GitHub

```bash
cd /Users/shuangwu/.qoderwork/workspace/mmvroq4q3zs99nwf/competitor-monitor

# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
# 访问 https://github.com/new 创建空仓库
# 然后执行：
git remote add origin https://github.com/YOUR_USERNAME/competitor-monitor.git
git branch -M main
git push -u origin main
```

### Step 2: 连接 Vercel

```
1. 访问 https://vercel.com/new
2. 点击 "Continue with GitHub" 登录
3. 点击 "Import Git Repository"
4. 搜索 "competitor-monitor"
5. 点击 "Import"
```

### Step 3: 配置环境变量

在 Vercel 部署页面，点击 "Environment Variables" → Add New：

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

点击 "Deploy" 开始部署，等待 1-2 分钟。

---

## 配置 GitHub Actions（1 分钟）

### Step 1: 添加 Secrets

在你的 GitHub 仓库页面：
```
1. Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 依次添加：

Name: SUPABASE_URL
Value: https://your-project.supabase.co

Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Name: DINGTALK_TOKEN (可选)
Value: xxxxxxxx (钉钉机器人 Token，不要则跳过)
```

### Step 2: 手动触发测试

```
1. Actions 标签页
2. 左侧 "Daily Product Crawl"
3. 右侧 "Run workflow" 下拉 → Run workflow
4. 等待 2-5 分钟运行完成
5. 查看日志确认成功
```

---

## 验证部署（1 分钟）

### 1. 访问网站
```
Vercel 部署完成后，会分配域名：
https://competitor-monitor-xxx.vercel.app

访问该链接，应该看到首页
```

### 2. 检查数据
```
点击 "进入仪表盘"
如果爬虫已成功运行，应该能看到商品列表
如果是空的，请等待 GitHub Actions 运行完成
```

### 3. 检查数据库
```
回到 Supabase 控制台：
Table Editor → amazon_products
应该能看到抓取到的商品数据
```

---

## 🎉 完成！

现在你已经成功部署了竞对监控系统！

**接下来：**
- ✅ 每天 UTC 6:00（北京时间 14:00）自动运行爬虫
- ✅ 随时在 GitHub Actions 手动触发
- ✅ 访问 Vercel 域名查看最新数据
- ✅ （可选）配置钉钉通知接收日报

---

## 🔧 故障排查

### 问题 1: Vercel 部署失败
```
检查：package.json 是否正确
解决：查看 Build Logs 定位错误
常见原因：Node.js 版本不兼容 → 确保使用 Node 20
```

### 问题 2: GitHub Actions 运行失败
```
检查 1: Secrets 是否正确配置
检查 2: Supabase schema 是否已执行
检查 3: 查看 Job Logs 具体错误信息
```

### 问题 3: 爬取不到数据
```
原因 1: Slickdeals 反爬 → 等待几小时后再试
原因 2: Amazon 验证码 → 降低爬取频率（修改 crawl.ts 中的延时）
原因 3: 代理不可用 → 等待下次自动更新代理池
```

### 问题 4: 仪表盘显示空白
```
检查 1: 浏览器 Console 是否有错误
检查 2: Supabase 中是否有数据
检查 3: 确认 SUPABASE_URL 和 KEY 正确
```

---

## 💡 优化建议

### 第 1 周：验证可行性
- 观察爬虫运行成功率
- 检查 AE 匹配准确度
- 收集团队反馈

### 第 2-4 周：逐步优化
- 调整评分权重（根据实际转化）
- 增加更多筛选条件
- 优化 UI/UX

### 第 2 个月起：考虑升级
- 购买付费代理 ($50-150/月)
- 开通 Keepa API ($49/月)
- 升级 Supabase Pro ($25/月)

---

**有任何问题，欢迎查看 README.md 或提交 Issue！**
