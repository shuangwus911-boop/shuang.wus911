# Vercel 部署指南

## ✅ 已完成的工作

1. **Supabase 数据库** - 所有表已创建成功
   - amazon_products
   - ae_matches  
   - crawl_logs

2. **GitHub 仓库** - 代码已推送到 https://github.com/shuangwus911-boop/shuang.wus911

3. **Vercel 账户** - 已登录并验证

## 📋 手动部署步骤

### 步骤 1：导入 GitHub 仓库到 Vercel

1. 访问：https://vercel.com/new
2. 点击 **"Import Git Repository"**
3. 在 "Git Scope" 下拉框中，选择您的 GitHub 账户：**shuangwus911-boop**
4. 找到并点击仓库：**shuangwus911-boop/shuang.wus911**
5. 点击 **"Import"** 按钮

### 步骤 2：配置项目

在 "Configure Project" 页面：

1. **Project Name**: `competitor-monitor` (或使用默认名称)
2. **Framework Preset**: Next.js (应该自动检测)
3. **Root Directory**: 保持默认 `./`
4. **Build Command**: 保持默认 `npm run build`
5. **Output Directory**: 保持默认 `.next`

### 步骤 3：添加环境变量 ⚠️ 重要

点击 **"Environment Variables"** 展开，然后添加以下变量：

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gcfkdnevhvhqmnzelnec.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZmtkbmV2aHZocW1uemVsbmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNzQyOTMsImV4cCI6MjA1ODY1MDI5M30.hnYApH0Bcp-9TExvOXtLk7fK0CqAVlczaNUDgvtrKgc` |
| `NODE_ENV` | `production` |

**操作步骤：**
1. 点击 "Add New" 或 "+" 按钮
2. 输入 Variable Name
3. 粘贴对应的 Value
4. 对每个变量重复此操作
5. 确保所有三个变量都添加了

### 步骤 4：开始部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（通常需要 2-5 分钟）
3. 部署成功后会显示恭喜页面和预览 URL

### 步骤 5：获取生产域名

部署完成后：
1. 在项目页面找到 **Production URL**
2. 格式类似：`https://competitor-monitor-xxx.vercel.app`
3. 保存这个 URL 用于访问您的应用

## 🔧 配置 GitHub Secrets（用于每日自动爬虫）

### 在 GitHub 仓库中添加 Secrets：

1. 访问：https://github.com/shuangwus911-boop/shuang.wus911/settings/secrets/actions
2. 点击 **"New repository secret"**
3. 添加以下 secrets：

| Secret Name | Secret Value |
|-------------|--------------|
| `SUPABASE_URL` | `https://gcfkdnevhvhqmnzelnec.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZmtkbmV2aHZocW1uemVsbmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNzQyOTMsImV4cCI6MjA1ODY1MDI5M30.hnYApH0Bcp-9TExvOXtLk7fK0CqAVlczaNUDgvtrKgc` |
| `DINGTALK_WEBHOOK_URL` | (可选) 钉钉机器人 Webhook URL |

### 启用 GitHub Actions：

1. 访问：https://github.com/shuangwus911-boop/shuang.wus911/actions
2. 如果看到提示 "I understand my workflows, go ahead and enable them"
3. 点击 **"Enable workflows"** 按钮
4. 确认 `daily-crawl.yml` workflow 已启用

## ✅ 验证部署

### 1. 检查 Vercel 部署状态

访问：https://vercel.com/dashboard
- 确认项目状态为 **"Ready"**
- 查看最近的 Deployment 是否为 **"Succeeded"**

### 2. 测试 Vercel 网站

访问您的生产 URL：
- 打开浏览器访问：`https://competitor-monitor-xxx.vercel.app`
- 检查页面是否正常加载
- 查看控制台是否有错误

### 3. 验证 Supabase 连接

在 Vercel 部署的应用中：
- 访问 `/api/test-db` (如果有这个端点)
- 或者查看 Vercel Functions 日志确认数据库连接成功

### 4. 检查 GitHub Actions

访问：https://github.com/shuangwus911-boop/shuang.wus911/actions
- 确认 workflow 列表中有 `Daily Crawl`
- 查看是否自动触发或手动触发一次测试运行
- 检查运行日志确认爬虫正常工作

## 🎯 后续步骤

### 第一次运行爬虫

部署完成后，您可以：

1. **手动触发 GitHub Actions**：
   - 访问：https://github.com/shuangwus911-boop/shuang.wus911/actions/workflows/daily-crawl.yml
   - 点击 **"Run workflow"**
   - 选择分支 `main`
   - 点击 **"Run workflow"** 按钮

2. **等待执行完成**：
   - 查看运行日志
   - 确认数据写入 Supabase 成功
   - 检查 crawl_logs 表中的记录

### 设置钉钉通知（可选）

如果需要钉钉群通知：

1. 在钉钉群中添加机器人
2. 获取 Webhook URL
3. 添加到 GitHub Secrets: `DINGTALK_WEBHOOK_URL`
4. 更新 `.env.local` 文件并提交

## 📊 监控和维护

### 查看部署日志

- **Vercel Logs**: https://vercel.com/shuangwus911-boops-projects/competitor-monitor/logs
- **GitHub Actions**: https://github.com/shuangwus911-boop/shuang.wus911/actions

### 更新代码

每次推送代码到 GitHub 仓库都会自动部署：

```bash
# 在本地项目中
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

Vercel 会自动检测并重新部署。

### 查看数据库

访问 Supabase Dashboard：
- https://supabase.com/dashboard/project/gcfkdnevhvhqmnzelnec/editor
- 查看 amazon_products、ae_matches、crawl_logs 表的数据

## 💰 成本说明

所有服务都在免费额度内：

- **Vercel**: 免费计划（个人项目）
  - 每月 100GB 带宽
  - 无限次部署
  - GitHub Actions 集成
  
- **Supabase**: 免费计划
  - 500MB 数据库
  - 2GB 带宽/月
  - 足够本项目使用

- **GitHub Actions**: 免费
  - 每月 2000 分钟
  - 每日爬虫只需几分钟

**总成本：$0/月** ✅

## 🆘 故障排查

### 部署失败

**问题**: Vercel 部署失败
**解决**:
1. 检查 Build Logs 找出错误原因
2. 确认 package.json 中的脚本正确
3. 验证环境变量是否正确配置

### 数据库连接失败

**问题**: 无法连接到 Supabase
**解决**:
1. 检查环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. 确认 Supabase 项目处于活跃状态
3. 在 Supabase Dashboard 检查 API 密钥是否有效

### GitHub Actions 不运行

**问题**: Workflow 没有自动执行
**解决**:
1. 确认 Actions 已启用
2. 检查 `.github/workflows/daily-crawl.yml` 语法
3. 手动触发一次运行测试

---

**部署完成后，您的竞争对手监控系统将每天自动运行！** 🎉
