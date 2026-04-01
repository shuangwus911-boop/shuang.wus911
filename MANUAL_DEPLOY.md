# 🖱️ 纯手动部署指南（无需命令行）

适合不想使用命令行的用户，全程在浏览器操作。

---

## 第 1 步：配置 Supabase（5 分钟）

### 1.1 注册账号
打开 https://supabase.com
- 点击 "Start your project"
- 选择 "Sign in with GitHub"（推荐）或邮箱注册

### 1.2 创建项目
- 点击 "New Project"
- 填写信息：
  - **Name**: `competitor-monitor`
  - **Database Password**: 设置一个密码（请记下来）
  - **Region**: 选择 `Asia Southeast (Singapore)` 或其他最近的
- 点击 "Create new project"
- ⏱️ 等待 2-3 分钟初始化

### 1.3 执行 SQL Schema
- 点击左侧菜单 **SQL Editor**
- 点击 **New query**
- 复制下方完整 SQL 内容
- 粘贴到编辑器
- 点击 **Run**（或按 Cmd/Ctrl + Enter）
- 确认显示 "Success"

**SQL 内容：**
```sql
-- 复制从这里开始
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE amazon_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  asin VARCHAR(10) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  bsr_rank INTEGER DEFAULT 0,
  bsr_category VARCHAR(255),
  score DECIMAL(3,2) DEFAULT 0 CHECK (score >= 1 AND score <= 5),
  images TEXT[],
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ae_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amazon_product_id UUID REFERENCES amazon_products(id) ON DELETE CASCADE,
  ae_product_id VARCHAR(50) NOT NULL,
  ae_title TEXT,
  ae_price DECIMAL(10,2) NOT NULL,
  ae_original_price DECIMAL(10,2),
  ae_inventory INTEGER DEFAULT 999,
  profit_margin DECIMAL(5,2),
  match_score DECIMAL(5,4),
  status VARCHAR(20) DEFAULT 'potential' CHECK (status IN ('potential', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE crawl_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  items_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_amazon_score ON amazon_products(score DESC);
CREATE INDEX idx_amazon_created ON amazon_products(created_at DESC);
CREATE INDEX idx_ae_status ON ae_matches(status);
CREATE INDEX idx_ae_profit ON ae_matches(profit_margin DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_amazon_updated_at
  BEFORE UPDATE ON amazon_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- 复制到这里结束
```

### 1.4 验证表创建
- 点击左侧菜单 **Table Editor**
- 确认能看到 3 个表：
  - ✅ amazon_products
  - ✅ ae_matches
  - ✅ crawl_logs

### 1.5 获取 API Key
- 点击左侧菜单 **Settings**（齿轮图标⚙️）
- 点击 **API**
- 复制两个值：
  1. **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
  2. **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**📌 把这两个值保存到记事本！**

---

## 第 2 步：上传代码到 GitHub（3 分钟）

### 2.1 Fork 仓库
打开 https://github.com/competitor-monitor-system/competitor-monitor

- 点击右上角 **Fork** 按钮
- 等待几秒钟，代码会复制到你的账号

### 2.2 或者创建新仓库
如果上面的链接不存在：

1. 打开 https://github.com/new
2. Repository name: `competitor-monitor`
3. 选择 **Public**
4. 勾选 **Add a README file**
5. 点击 **Create repository**

然后：
1. 下载本项目代码（从 QoderWork 的工作目录）
2. 解压后拖拽到 GitHub Desktop 或使用 Git 命令上传

---

## 第 3 步：部署到 Vercel（3 分钟）

### 3.1 登录 Vercel
打开 https://vercel.com
- 点击 **Sign Up**
- 使用 GitHub 账号登录

### 3.2 Import 项目
- 点击 **Add New...** → **Project**
- 在 "Import Git Repository" 下找到 `competitor-monitor`
- 点击 **Import**

### 3.3 配置环境变量
展开 **Environment Variables**，添加：

**Variable 1:**
- Name: `SUPABASE_URL`
- Value: （粘贴 Step 1.5 的 Project URL）

**Variable 2:**
- Name: `SUPABASE_ANON_KEY`
- Value: （粘贴 Step 1.5 的 anon key）

**Variable 3（可选）:**
- Name: `DINGTALK_TOKEN`
- Value: （钉钉机器人 Token，没有就跳过）

### 3.4 部署
- 点击 **Deploy**
- ⏱️ 等待 1-2 分钟
- 看到 ✅ 后点击 **Continue to Dashboard**

### 3.5 访问网站
- 点击 **Visit** 按钮
- 或直接访问显示的域名（如 `https://competitor-monitor-xxx.vercel.app`）

---

## 第 4 步：配置 GitHub Secrets（2 分钟）

### 4.1 打开仓库设置
在你的 GitHub 仓库页面：
- 点击 **Settings**（顶部标签页）
- 左侧菜单 **Secrets and variables** → **Actions**

### 4.2 添加 Secrets
点击 **New repository secret**，依次添加：

**Secret 1:**
- Name: `SUPABASE_URL`
- Secret: （粘贴 Step 1.5 的 Project URL）
- 点击 **Add secret**

**Secret 2:**
- Name: `SUPABASE_ANON_KEY`
- Secret: （粘贴 Step 1.5 的 anon key）
- 点击 **Add secret**

**Secret 3（可选）:**
- Name: `DINGTALK_TOKEN`
- Secret: （钉钉机器人 Token）
- 点击 **Add secret**

---

## 第 5 步：测试爬虫（5 分钟）

### 5.1 打开 Actions
- 在你的 GitHub 仓库页面
- 点击 **Actions** 标签页

### 5.2 启用 Workflows
如果是第一次：
- 点击 **I understand my workflows, go ahead and enable them**

### 5.3 手动触发
- 点击左侧 **Daily Product Crawl**
- 点击右侧 **Run workflow** 下拉按钮
- 选择 **main** 分支
- 点击 **Run workflow**

### 5.4 查看运行状态
- 刷新页面
- 点击正在运行的记录（最上面那个）
- 查看日志输出

**成功标志：**
```
✅ Crawl completed!
📦 Amazon products: XX
🎯 Potential products: XX
🔗 AE matches: XX
```

### 5.5 验证数据
打开 Supabase：
- 点击 **Table Editor**
- 点击 **amazon_products** 表
- 应该能看到新抓取的商品数据

---

## 第 6 步：查看网站数据

### 6.1 访问仪表盘
打开 Vercel 部署的域名（Step 3.5 中的网址）

### 6.2 查看数据
- 点击 **"进入仪表盘"**
- 应该能看到：
  - 📦 总商品数
  - ⭐ 潜力商品数
  - 🔗 AE 匹配数
  - 💰 平均利润率

### 6.3 查看详情
- 点击任意商品卡片
- 展开查看 AE 匹配货源
- 点击"查看 Amazon"或"查看 AE"跳转

---

## 🎉 完成！

现在你已经成功部署了竞对监控系统！

### 接下来：

1. **自动运行**: 每天 UTC 6:00（北京时间 14:00）自动爬取
2. **手动触发**: 随时在 GitHub Actions 手动运行
3. **接收通知**: 如果配置了钉钉，会收到每日报告
4. **查看数据**: 访问 Vercel 域名查看最新结果

---

## 📊 预期效果

**首次运行后：**
- 抓取 50-150 个 Amazon 商品
- 筛选出 15-40 个 3-5 星潜力商品
- 匹配 5-15 个 AliExpress 货源

**日常运行：**
- 每天新增 20-50 个商品
- 发现 3-10 个新的潜力爆品

---

## ❓ 遇到问题？

### 问题 1: Vercel 部署失败
**解决：**
1. 检查环境变量是否正确
2. 查看 Deployments 日志
3. 确认 package.json 存在

### 问题 2: GitHub Actions 失败
**解决：**
1. 检查 Secrets 是否拼写正确
2. 确认 Supabase 表已创建
3. 查看详细错误日志

### 问题 3: 网站空白
**解决：**
1. 按 F12 打开 Console 查看错误
2. 检查 Supabase 是否有数据
3. 确认环境变量配置

### 问题 4: 爬取不到数据
**解决：**
1. 等待几小时后重试（Slickdeals 可能临时限制）
2. 查看 GitHub Actions 日志
3. 确认代理池正常

---

## 🔗 有用的链接

- **GitHub 仓库**: https://github.com/yourname/competitor-monitor
- **Vercel 控制台**: https://vercel.com/dashboard
- **Supabase 控制台**: https://app.supabase.com
- **GitHub Actions**: https://github.com/yourname/competitor-monitor/actions

---

## 📞 需要帮助？

1. 查看 [README.md](./README.md) FAQ
2. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 故障排查
3. 提交 GitHub Issue

---

**祝您使用愉快！** 🚀
