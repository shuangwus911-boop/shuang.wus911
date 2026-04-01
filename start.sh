#!/bin/bash

# 竞对监控系统 - 快速启动脚本
# 适用于本地开发和测试

set -e

echo "🚀 竞对商品监控系统 - 快速启动"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js 20+"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到 npm"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env.local ]; then
    echo "⚠️  未找到 .env.local 文件"
    echo "📝 正在从 .env.example 复制..."
    cp .env.example .env.local
    
    echo ""
    echo "⚠️  请编辑 .env.local 文件，填入以下配置："
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo ""
    read -p "按回车键继续..."
fi

# 安装依赖
echo ""
echo "📦 正在安装依赖..."
npm install --silent

# 检查是否需要初始化数据库
echo ""
echo "💾 数据库状态检查"
echo "   请确认已在 Supabase 中执行 schema.sql"
echo "   如未执行，请访问 Supabase SQL Editor 执行"
echo ""

# 选择运行模式
echo "请选择运行模式："
echo "1. 运行爬虫脚本 (npm run crawl)"
echo "2. 启动开发服务器 (npm run dev)"
echo "3. 构建生产版本 (npm run build)"
echo ""
read -p "请输入选项 (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "🔍 运行爬虫脚本..."
        npm run crawl
        ;;
    2)
        echo ""
        echo "🌐 启动开发服务器..."
        echo "   访问地址：http://localhost:3000"
        npm run dev
        ;;
    3)
        echo ""
        echo "🏗️  构建生产版本..."
        npm run build
        echo ""
        echo "✅ 构建完成！可部署到 Vercel 或其他平台"
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
