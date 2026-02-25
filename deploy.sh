#!/bin/bash

# 小说转视频管理平台 - 前端部署脚本
# 用法: ./deploy.sh [prod|dev]

ENV=${1:-prod}
PROJECT_DIR="/home/ubuntu/data/management-system/management-frontend"
NGINX_ROOT="/var/www/management-frontend"

echo "🚀 开始部署前端项目 (环境: $ENV)..."

# 进入项目目录
cd $PROJECT_DIR || exit 1

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
if [ "$ENV" = "prod" ]; then
    npm run build
else
    npm run build
fi

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败，dist 目录不存在"
    exit 1
fi

# 创建 Nginx 目录
echo "📁 创建 Nginx 目录..."
sudo mkdir -p $NGINX_ROOT

# 复制构建产物
echo "📋 复制构建产物到 Nginx 目录..."
sudo cp -r dist/* $NGINX_ROOT/

# 复制 Nginx 配置
echo "⚙️ 配置 Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/management-frontend

# 启用站点（如果没有启用）
if [ ! -f "/etc/nginx/sites-enabled/management-frontend" ]; then
    sudo ln -s /etc/nginx/sites-available/management-frontend /etc/nginx/sites-enabled/
fi

# 测试 Nginx 配置
echo "🧪 测试 Nginx 配置..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "🔄 重启 Nginx..."
    sudo systemctl restart nginx
    echo "✅ 部署完成！"
    echo "🌐 访问地址: http://localhost"
else
    echo "❌ Nginx 配置测试失败"
    exit 1
fi
