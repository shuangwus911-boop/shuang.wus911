#!/bin/bash

# Supabase 自动配置脚本
# 帮助快速初始化数据库和环境变量

set -e

echo "🗄️  Supabase 数据库配置向导"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目根目录
PROJECT_ROOT="/Users/shuangwu/.qoderwork/workspace/mmvroq4q3zs99nwf/competitor-monitor"
cd "$PROJECT_ROOT"

echo -e "${BLUE}📋 请按以下步骤操作：${NC}"
echo ""

# Step 1: 注册 Supabase
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Step 1: 注册 Supabase 账号${NC}"
echo ""
echo "1. 打开浏览器访问：https://supabase.com"
echo "2. 点击 'Start your project' 或 'Sign In'"
echo "3. 使用 GitHub 账号登录（推荐）或邮箱注册"
echo ""
read -p "✅ 完成后按回车继续..."

# Step 2: 创建项目
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Step 2: 创建新项目${NC}"
echo ""
echo "1. 点击 'New Project'"
echo "2. 填写项目信息："
echo "   - Name: competitor-monitor (或自定义)"
echo "   - Database Password: 设置一个强密码（请记下来）"
echo "   - Region: 选择最近的区域（如 Asia Southeast）"
echo "3. 点击 'Create new project'"
echo "4. ⏱️  等待 2-3 分钟项目初始化完成"
echo ""
read -p "✅ 项目创建完成后按回车继续..."

# Step 3: 执行 SQL Schema
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Step 3: 初始化数据库${NC}"
echo ""
echo "1. 在左侧菜单点击 'SQL Editor'"
echo "2. 点击 'New query'"
echo ""

# 显示 SQL 文件内容
echo -e "${BLUE}正在加载 SQL Schema...${NC}"
echo ""

if [ -f "supabase/schema.sql" ]; then
    echo "📄 SQL 文件已准备好，请复制以下内容："
    echo ""
    echo "=========================================="
    cat supabase/schema.sql
    echo "=========================================="
    echo ""
    echo "📋 复制上面所有内容（从 CREATE EXTENSION 到最后一行）"
else
    echo -e "${RED}❌ 错误：未找到 supabase/schema.sql 文件${NC}"
    exit 1
fi

echo ""
echo "3. 粘贴到 SQL Editor"
echo "4. 点击 'Run' 执行（或按 Cmd/Ctrl + Enter）"
echo "5. 确认显示 'Success. No rows returned'"
echo ""
read -p "✅ SQL 执行完成后按回车继续..."

# Step 4: 验证表创建
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Step 4: 验证表创建成功${NC}"
echo ""
echo "1. 在左侧菜单点击 'Table Editor'"
echo "2. 确认能看到以下 3 个表："
echo "   ✅ amazon_products"
echo "   ✅ ae_matches"
echo "   ✅ crawl_logs"
echo ""
read -p "✅ 确认表都存在后按回车继续..."

# Step 5: 获取 API Key
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Step 5: 获取 API 密钥${NC}"
echo ""
echo "1. 在左侧菜单点击 'Settings' (齿轮图标)"
echo "2. 点击 'API'"
echo "3. 复制以下两个值："
echo ""
echo -e "   ${BLUE}Project URL:${NC}"
echo "   （格式：https://xxxxxxxxxxxxx.supabase.co）"
echo ""
echo -e "   ${BLUE}anon/public key:${NC}"
echo "   （格式：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...）"
echo ""
echo "⚠️  请将这两个值保存到安全的地方"
echo ""

# Step 6: 创建 .env.local 文件
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Step 6: 配置环境变量${NC}"
echo ""

read -p "请输入 Project URL: " SUPABASE_URL
read -p "请输入 anon/public key: " SUPABASE_ANON_KEY
read -p "请输入钉钉机器人 Token（可选，直接回车跳过）: " DINGTALK_TOKEN

# 创建 .env.local 文件
cat > .env.local << EOF
# Supabase 数据库配置
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# 钉钉机器人 Token（可选）
DINGTALK_TOKEN=$DINGTALK_TOKEN

# AliExpress API Key（可选）
AE_API_KEY=
EOF

echo ""
echo -e "${GREEN}✅ .env.local 文件创建成功${NC}"
echo ""

# 验证配置
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Step 7: 验证配置${NC}"
echo ""

if grep -q "your-project" .env.local || grep -q "your-anon-key" .env.local; then
    echo -e "${RED}❌ 错误：检测到默认值，请重新配置${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 配置验证通过${NC}"
echo ""

# 显示配置摘要
echo "📋 配置摘要："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUPABASE_URL: $SUPABASE_URL"
echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."
if [ -n "$DINGTALK_TOKEN" ]; then
    echo "DINGTALK_TOKEN: 已配置"
else
    echo "DINGTALK_TOKEN: 未配置（跳过钉钉通知）"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}🎉 Supabase 配置完成！${NC}"
echo ""
echo "下一步："
echo "1. 运行 ./auto-deploy.sh 完成自动部署"
echo "2. 或手动执行："
echo "   - npm install"
echo "   - git init && git add . && git commit -m 'Initial commit'"
echo "   - gh repo create competitor-monitor --public --source=. --remote=origin --push"
echo "   - vercel --prod"
echo ""
