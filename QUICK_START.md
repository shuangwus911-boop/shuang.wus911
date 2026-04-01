# 🚀 一键部署指南

## 方式一：完全自动化（推荐）⭐

### 第 1 步：配置 Supabase（5 分钟）

```bash
cd /Users/shuangwu/.qoderwork/workspace/mmvroq4q3zs99nwf/competitor-monitor
./setup-supabase.sh
```

**脚本会自动引导你：**
1. ✅ 注册 Supabase 账号
2. ✅ 创建新项目
3. ✅ 执行 SQL Schema（自动显示）
4. ✅ 验证表创建成功
5. ✅ 获取 API Key
6. ✅ 创建 .env.local 配置文件

---

### 第 2 步：一键部署到 GitHub 和 Vercel（3 分钟）

```bash
./auto-deploy.sh
```

**脚本会自动完成：**
1. ✅ 检查环境依赖（git, node, gh cli, vercel cli）
2. ✅ GitHub 登录验证
3. ✅ 创建 GitHub 仓库
4. ✅ 安装 npm 依赖
5. ✅ 初始化 Git 并推送代码
6. ✅ 部署到 Vercel
7. ✅ 配置 GitHub Secrets（SUPABASE_URL, SUPABASE_ANON_KEY, DINGTALK_TOKEN）

---

### 第 3 步：测试爬虫（2 分钟）

1. 打开 GitHub 仓库（脚本会自动打开浏览器）
2. 点击 **Actions** 标签页
3. 点击 **Daily Product Crawl**
4. 点击 **Run workflow** → **Run workflow**
5. 等待 2-5 分钟运行完成
6. 查看日志确认成功

---

### 第 4 步：访问网站

脚本会显示 Vercel 域名，例如：
```
https://competitor-monitor-xxx.vercel.app
```

访问该网址，点击"进入仪表盘"查看数据。

---

## 方式二：手动部署（适合高级用户）

### Step 1: 配置 Supabase

参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 的 Step 1-3

### Step 2: 创建 .env.local

```bash
cp .env.example .env.local
vi .env.local  # 编辑填入配置
```

### Step 3: 安装依赖

```bash
npm install
```

### Step 4: 本地测试爬虫

```bash
npm run crawl
```

### Step 5: 创建 GitHub 仓库

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create competitor-monitor --public --source=. --remote=origin --push
```

### Step 6: 部署到 Vercel

```bash
vercel --prod
```

### Step 7: 配置 GitHub Secrets

在 GitHub 仓库设置中添加：
- SUPABASE_URL
- SUPABASE_ANON_KEY
- DINGTALK_TOKEN（可选）

### Step 8: 手动触发爬虫

GitHub Actions → Run workflow

---

## 环境要求

### 必需工具
- ✅ Node.js 20+ 
- ✅ npm 或 yarn
- ✅ git

### 可选工具（脚本会自动安装）
- ⭐ GitHub CLI (gh)
- ⭐ Vercel CLI

### 检查环境

```bash
node -v      # 应该显示 v20.x.x
npm -v       # 应该显示 9.x.x 或更高
git --version # 应该显示 git version 2.x.x
```

---

## 常见问题

### Q1: 没有 macOS/Linux 环境怎么办？

**Windows 用户：**
1. 安装 [Git Bash](https://git-scm.com/download/win)
2. 在 Git Bash 中运行脚本
3. 或手动执行每个步骤

### Q2: 不想用命令行怎么办？

**图形化操作：**
1. 按照 [DEPLOYMENT.md](./DEPLOYMENT.md) 一步步点击
2. 所有操作都可以在浏览器完成

### Q3: 部署失败怎么办？

**检查清单：**
- [ ] Supabase SQL Schema 是否已执行
- [ ] .env.local 配置是否正确
- [ ] GitHub CLI 是否已登录 (`gh auth status`)
- [ ] Vercel 是否已登录 (`vercel whoami`)

**查看错误日志：**
```bash
# 查看爬虫日志
npm run crawl 2>&1 | tee crawl.log

# 查看 Vercel 部署日志
vercel logs
```

### Q4: GitHub Actions 运行失败？

**常见原因：**
1. ❌ Secrets 未配置 → 检查拼写
2. ❌ Supabase 表不存在 → 重新执行 schema.sql
3. ❌ 代理不可用 → 等待下次自动更新

**解决方法：**
```
GitHub → Settings → Secrets and variables → Actions
确认三个 Secret 都已正确配置
```

### Q5: 网站显示空白？

**排查步骤：**
1. 打开浏览器 Console（F12）
2. 查看是否有错误信息
3. 检查 Supabase 是否有数据
4. 确认 .env.local 配置正确

---

## 部署后验证

### ✅ 快速验证清单

- [ ] Supabase 中有 3 个表
- [ ] GitHub 仓库有代码
- [ ] Vercel 域名可以访问
- [ ] GitHub Actions 可以手动触发
- [ ] 爬虫运行成功后数据库有数据
- [ ] 仪表盘显示商品列表

### ✅ 功能测试

```bash
# 1. 本地运行爬虫
npm run crawl

# 2. 检查输出
# 应该看到类似：
# ✅ Crawl completed!
# 📦 Amazon products: 50
# 🎯 Potential products: 15
# 🔗 AE matches: 8

# 3. 访问 Supabase Table Editor
# 确认 amazon_products 表有新数据

# 4. 访问 Vercel 域名
# 点击"进入仪表盘"查看数据
```

---

## 部署时间估算

| 步骤 | 预计时间 |
|------|----------|
| Supabase 配置 | 5 分钟 |
| 自动部署脚本 | 3 分钟 |
| GitHub Actions 测试 | 5 分钟 |
| 验证和测试 | 2 分钟 |
| **总计** | **约 15 分钟** |

---

## 下一步

部署完成后：

1. **每天自动运行**: GitHub Actions 会在每天 UTC 6:00（北京时间 14:00）自动运行
2. **接收钉钉通知**: 如果配置了 DINGTALK_TOKEN，会收到每日选品报告
3. **随时手动触发**: 在 GitHub Actions 页面手动运行
4. **查看最新数据**: 访问 Vercel 域名查看仪表盘

---

## 需要帮助？

### 📚 完整文档
- [README.md](./README.md) - 项目说明
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署指南
- [INDEX.md](./INDEX.md) - 文档索引

### 🔧 技术支持
- 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 的故障排查章节
- 提交 GitHub Issue
- 检查 GitHub Actions 日志

---

**🎉 准备好了吗？开始部署吧！**

```bash
# 第一步：配置 Supabase
./setup-supabase.sh

# 第二步：一键部署
./auto-deploy.sh
```
