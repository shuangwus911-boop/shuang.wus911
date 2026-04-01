#!/bin/bash

# 竞对监控系统 - 全自动化部署脚本
# 自动完成：GitHub 创建 → Vercel 部署 → 配置 Actions

set -e

echo "🚀 开始全自动部署流程..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查必要工具
check_requirements() {
    echo "📋 检查环境依赖..."
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ 错误：未找到 git${NC}"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ 错误：未找到 Node.js${NC}"
        exit 1
    fi
    
    if ! command -v gh &> /dev/null; then
        echo -e "${YELLOW}⚠️  未安装 GitHub CLI，正在安装...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install gh
        else
            echo -e "${RED}请手动安装 GitHub CLI: https://github.com/cli/cli${NC}"
            exit 1
        fi
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️  未安装 Vercel CLI，正在安装...${NC}"
        npm install -g vercel
    fi
    
    echo -e "${GREEN}✅ 环境检查通过${NC}"
    echo ""
}

# GitHub 登录检查
check_github_login() {
    echo "🔐 检查 GitHub 登录状态..."
    
    if ! gh auth status &> /dev/null; then
        echo -e "${YELLOW}未登录 GitHub，正在引导登录...${NC}"
        gh auth login
    fi
    
    echo -e "${GREEN}✅ GitHub 登录成功${NC}"
    echo ""
}

# 创建 GitHub 仓库
create_github_repo() {
    echo "📦 创建 GitHub 仓库..."
    
    read -p "请输入仓库名称 (默认：competitor-monitor): " REPO_NAME
    REPO_NAME=${REPO_NAME:-competitor-monitor}
    
    # 检查仓库是否已存在
    if gh repo view "$REPO_NAME" &> /dev/null; then
        echo -e "${YELLOW}⚠️  仓库 $REPO_NAME 已存在${NC}"
        read -p "是否删除并重新创建？(y/N): " CONFIRM
        if [[ $CONFIRM == [Yy]* ]]; then
            gh repo delete "$REPO_NAME" --confirm
            echo "✅ 已删除旧仓库"
        else
            echo -e "${RED}❌ 取消操作${NC}"
            exit 1
        fi
    fi
    
    # 创建新仓库
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
    
    echo -e "${GREEN}✅ 仓库创建成功：https://github.com/$(gh api user | jq -r .login)/$REPO_NAME${NC}"
    echo ""
}

# 安装依赖
install_dependencies() {
    echo "📦 安装项目依赖..."
    npm install --silent
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
    echo ""
}

# 初始化 Git
init_git() {
    echo "🔧 初始化 Git 仓库..."
    
    if [ ! -d ".git" ]; then
        git init
        git add .
        git commit -m "Initial commit: 竞对商品监控系统"
    fi
    
    echo -e "${GREEN}✅ Git 初始化完成${NC}"
    echo ""
}

# 推送到 GitHub
push_to_github() {
    echo "📤 推送代码到 GitHub..."
    
    # 确保使用 main 分支
    git branch -M main 2>/dev/null || true
    git push -u origin main
    
    echo -e "${GREEN}✅ 代码推送成功${NC}"
    echo ""
}

# Vercel 部署
deploy_to_vercel() {
    echo "☁️  部署到 Vercel..."
    
    # 读取 Supabase 配置
    if [ ! -f .env.local ]; then
        echo -e "${RED}❌ 错误：未找到 .env.local 文件${NC}"
        echo "请先运行：cp .env.example .env.local 并填写配置"
        exit 1
    fi
    
    # 从 .env.local 读取配置
    source .env.local
    
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        echo -e "${RED}❌ 错误：.env.local 中缺少 Supabase 配置${NC}"
        exit 1
    fi
    
    # Vercel 部署（会自动创建项目）
    vercel --prod --yes
    
    echo -e "${GREEN}✅ Vercel 部署完成${NC}"
    echo ""
}

# 配置 GitHub Secrets
configure_secrets() {
    echo "🔐 配置 GitHub Secrets..."
    
    # 读取 .env.local
    source .env.local
    
    # 设置 Secrets
    echo "设置 SUPABASE_URL..."
    gh secret set SUPABASE_URL --body="$SUPABASE_URL"
    
    echo "设置 SUPABASE_ANON_KEY..."
    gh secret set SUPABASE_ANON_KEY --body="$SUPABASE_ANON_KEY"
    
    # 可选的钉钉 Token
    if [ -n "$DINGTALK_TOKEN" ]; then
        echo "设置 DINGTALK_TOKEN..."
        gh secret set DINGTALK_TOKEN --body="$DINGTALK_TOKEN"
    fi
    
    echo -e "${GREEN}✅ GitHub Secrets 配置完成${NC}"
    echo ""
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo "=========================================="
    echo ""
    
    # 获取仓库 URL
    REPO_URL=$(gh repo view --json url | jq -r .url)
    echo "📦 GitHub 仓库：$REPO_URL"
    
    # 获取 Vercel 域名
    VERCEL_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' || echo "待部署")
    echo "🌐 Vercel 地址：https://$VERCEL_URL"
    
    echo ""
    echo "📋 下一步操作："
    echo "1. 访问 GitHub 仓库确认代码已推送"
    echo "2. 在 GitHub Actions 中手动触发一次爬虫测试"
    echo "3. 访问 Vercel 域名查看网站效果"
    echo ""
    
    # 打开浏览器
    echo "🌐 正在打开相关页面..."
    
    # 打开 GitHub 仓库
    open "$REPO_URL/actions" 2>/dev/null || echo "请手动访问：$REPO_URL/actions"
    
    echo ""
    echo -e "${YELLOW}💡 提示：首次运行请手动触发 GitHub Actions${NC}"
    echo "   路径：Actions → Daily Product Crawl → Run workflow"
    echo ""
}

# 主函数
main() {
    check_requirements
    check_github_login
    create_github_repo
    install_dependencies
    init_git
    push_to_github
    deploy_to_vercel
    configure_secrets
    show_deployment_info
}

# 运行主函数
main
