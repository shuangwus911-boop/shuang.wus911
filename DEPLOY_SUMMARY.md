# 📦 项目已就绪 - 选择您的部署方式

恭喜！所有代码和配置文件已经准备完成。现在请选择您喜欢的部署方式。

---

## 🎯 三种部署方式

### 方式一：自动化脚本（最快，推荐⭐）

**适合人群**: 有 macOS/Linux 终端经验的用户  
**预计时间**: 10 分钟  
**操作难度**: ⭐⭐（简单）

```bash
cd /Users/shuangwu/.qoderwork/workspace/mmvroq4q3zs99nwf/competitor-monitor

# 第 1 步：配置 Supabase
./setup-supabase.sh

# 第 2 步：一键部署
./auto-deploy.sh
```

**脚本会自动完成：**
- ✅ Supabase 数据库初始化
- ✅ GitHub 仓库创建
- ✅ Vercel 部署
- ✅ GitHub Secrets 配置
- ✅ 环境变量设置

**需要准备的工具：**
- Node.js 20+ ✅（已安装）
- Git ✅（已安装）
- GitHub CLI（可选，脚本会尝试安装）
- Vercel CLI（可选，脚本会安装）

---

### 方式二：纯手动浏览器操作（无需命令行）

**适合人群**: 不想用命令行的用户  
**预计时间**: 15 分钟  
**操作难度**: ⭐（非常简单）

**详细步骤请查看：** [MANUAL_DEPLOY.md](./MANUAL_DEPLOY.md)

**操作流程：**
1. 浏览器访问 Supabase → 注册 → 创建项目 → 执行 SQL
2. 浏览器访问 GitHub → Fork 仓库
3. 浏览器访问 Vercel → Import 项目 → 配置环境变量 → Deploy
4. GitHub Settings → 配置 Secrets
5. GitHub Actions → 手动触发爬虫

**优点：**
- 完全不需要命令行
- 每一步都有图形界面
- 适合 Windows 用户

---

### 方式三：混合部署（半自动）

**适合人群**: 有一定技术基础的用户  
**预计时间**: 12 分钟  
**操作难度**: ⭐⭐⭐（中等）

**步骤概览：**
```bash
# 1. 本地安装依赖
npm install

# 2. 本地测试爬虫（可选）
npm run crawl

# 3. 手动上传到 GitHub
git init
git add .
git commit -m "Initial commit"
# 然后在 GitHub 创建仓库并推送

# 4. 手动部署到 Vercel
vercel --prod

# 5. 手动配置 GitHub Secrets
# 在 GitHub Settings 中添加
```

---

## 📋 部署前准备清单

无论选择哪种方式，都需要先准备：

### ✅ 必需账号
- [ ] GitHub 账号（https://github.com/signup）
- [ ] Supabase 账号（https://supabase.com）
- [ ] Vercel 账号（https://vercel.com/signup）

### ✅ 环境检查
```bash
node -v      # 应该 >= v20
npm -v       # 应该 >= 9
git --version # 应该 >= 2.x
```

### ✅ 可选：钉钉机器人（用于接收通知）
- [ ] 钉钉群 → 添加机器人 → 获取 Webhook Token

---

## 🚀 推荐流程（方式一详细说明）

### Step 1: 运行 Supabase 配置脚本

```bash
./setup-supabase.sh
```

**脚本会引导你：**
1. 打开浏览器访问 Supabase
2. 创建新项目
3. 显示 SQL 内容让你复制执行
4. 验证表创建成功
5. 输入 API Key 创建 .env.local

**输出示例：**
```
🗄️  Supabase 数据库配置向导

Step 1: 注册 Supabase 账号
1. 打开浏览器访问：https://supabase.com
...
✅ 完成后按回车继续...
```

---

### Step 2: 运行自动部署脚本

```bash
./auto-deploy.sh
```

**脚本会自动：**
1. 检查环境依赖
2. 登录 GitHub（如果未登录）
3. 创建 GitHub 仓库
4. 安装 npm 依赖
5. 初始化 Git 并推送
6. 部署到 Vercel
7. 配置 GitHub Secrets

**输出示例：**
```
🚀 开始全自动部署流程...
📋 检查环境依赖...
✅ 环境检查通过
🔐 检查 GitHub 登录状态...
✅ GitHub 登录成功
📦 创建 GitHub 仓库...
✅ 仓库创建成功
...
```

---

### Step 3: 测试爬虫

脚本运行完成后：

1. **自动打开浏览器**到 GitHub Actions 页面
2. 点击 **Run workflow**
3. 等待 2-5 分钟
4. 查看日志确认成功

**成功日志：**
```
✅ Crawl completed!
⏱️  Duration: 3.45 minutes
📦 Amazon products: 52
🎯 Potential products: 18
🔗 AE matches: 12
```

---

### Step 4: 访问网站

脚本会显示 Vercel 域名：
```
🌐 Vercel 地址：https://competitor-monitor-xxx.vercel.app
```

访问该网址，点击"进入仪表盘"查看数据。

---

## 📊 部署后验证

### ✅ 快速检查清单

- [ ] **Supabase**: Table Editor 中有 3 个表
- [ ] **GitHub**: 仓库有代码，Actions 已启用
- [ ] **Vercel**: 域名可以访问首页
- [ ] **数据**: 仪表盘显示商品列表
- [ ] **爬虫**: GitHub Actions 可以手动触发

### ✅ 功能测试

1. **访问首页**: `https://your-app.vercel.app`
   - 应该看到产品介绍和特性说明

2. **进入仪表盘**: 点击"进入仪表盘"
   - 应该看到统计卡片和商品列表

3. **查看商品详情**: 点击任意商品
   - 应该能展开查看 AE 匹配货源

4. **跳转链接**: 点击"查看 Amazon"或"查看 AE"
   - 应该在新标签打开对应商品页面

---

## 💰 成本说明

### 零成本方案（当前配置）
| 服务 | 额度 | 是否免费 |
|------|------|----------|
| Supabase | 500MB 存储 | ✅ 免费 |
| Vercel | 100GB 带宽/月 | ✅ 免费 |
| GitHub Actions | 2000 分钟/月 | ✅ 免费 |
| 代理池 | 免费源 | ✅ 免费 |
| **总计** | - | **$0/月** |

### 未来升级建议
当业务验证成功后，可考虑：
- 付费代理池：$50-150/月（提升抓取成功率）
- Keepa API：$49/月（精准 BSR 数据）
- Supabase Pro：$25/月（更多存储空间）

---

## 🆘 常见问题

### Q1: 脚本运行失败怎么办？

**解决步骤：**
1. 查看错误信息
2. 检查 Node.js 版本（需要 20+）
3. 检查网络连接
4. 改用方式二（纯手动）

### Q2: Supabase SQL 执行失败？

**检查：**
- 是否完整复制了所有 SQL
- 是否有语法错误
- 网络是否正常

**重新执行：**
```sql
-- 在 SQL Editor 重新运行
DROP TABLE IF EXISTS crawl_logs;
DROP TABLE IF EXISTS ae_matches;
DROP TABLE IF EXISTS amazon_products;
-- 然后重新执行 schema.sql
```

### Q3: Vercel 部署失败？

**常见原因：**
- 环境变量配置错误
- package.json 有问题
- Node.js 版本不兼容

**解决方法：**
1. 查看 Vercel Deployments 日志
2. 检查 Environment Variables
3. 本地运行 `npm run build` 测试

### Q4: GitHub Actions 一直 Pending？

**可能原因：**
- GitHub 服务器繁忙
- 仓库未启用 Workflows

**解决方法：**
1. 刷新页面
2. Settings → Actions → 启用 Workflows
3. 重新点击 Run workflow

### Q5: 爬取不到数据？

**原因：**
- Slickdeals 临时反爬
- 代理池质量差
- Amazon 验证码拦截

**解决方法：**
1. 等待几小时后重试
2. 查看 crawl 日志
3. 考虑升级到付费代理

---

## 📞 获取帮助的顺序

1. **首先查看文档**:
   - [README.md](./README.md) - 完整说明
   - [MANUAL_DEPLOY.md](./MANUAL_DEPLOY.md) - 手动步骤
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细指南

2. **检查日志**:
   - GitHub Actions 日志
   - Vercel Deployments 日志
   - 本地 Console 错误

3. **搜索 Issue**:
   - GitHub Issues 查找类似问题

4. **提交新 Issue**:
   - 提供详细错误信息
   - 附上截图和日志

---

## 🎉 准备好了！

**现在请选择合适的部署方式开始吧！**

### 快速决策：
- ✅ **有终端经验** → 选择方式一（自动化脚本）
- ✅ **不想用命令行** → 选择方式二（纯手动）
- ✅ **想自定义控制** → 选择方式三（混合部署）

---

**祝您部署顺利！** 🚀

如果有任何问题，随时查阅文档或寻求帮助。
