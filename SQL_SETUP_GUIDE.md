# SQL Schema 手动设置指南

由于浏览器自动化在 Monaco 编辑器上遇到了技术困难，请按照以下步骤手动执行 SQL：

## 步骤 1: 打开 SQL Editor

1. 访问 Supabase 项目: https://supabase.com/dashboard/project/gcfkdnevhvhqmnzelnec
2. 点击左侧菜单的 "SQL 编辑器"
3. 点击 "新的" 按钮创建一个新的查询

## 步骤 2: 执行 SQL

1. 打开文件 `supabase/schema-simple.sql`
2. 复制全部内容
3. 粘贴到 Supabase SQL Editor
4. 点击 "运行" 按钮

## 步骤 3: 验证表创建

执行成功后，点击左侧菜单的 "表格编辑器"，你应该能看到以下 3 个表：

- `amazon_products` - Amazon 商品数据
- `ae_matches` - AliExpress 匹配数据
- `crawl_logs` - 爬取日志

## 已获取的配置信息

以下信息已自动获取并保存到 `.env.local`：

```
NEXT_PUBLIC_SUPABASE_URL=https://gcfkdnevhvhqmnzelnec.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 下一步

SQL 执行完成后，继续运行部署脚本：

```bash
./auto-deploy.sh
```

或者手动部署到 Vercel。
