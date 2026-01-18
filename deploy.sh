#!/bin/bash

# 汉字学习系统一键部署脚本
# 适用于 Ubuntu/Debian 系统

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo_error "请使用 sudo 运行此脚本"
    exit 1
fi

# 获取当前目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo_info "项目目录: $PROJECT_DIR"

# 1. 更新系统并安装必要的软件包
echo_info "===== 步骤 1/9: 更新系统并安装必要的软件包 ====="
yum update -y --disablerepo=nginx-stable

# 检查并安装必要的软件
check_and_install() {
    if ! command -v $1 &> /dev/null; then
        echo_info "安装 $2..."
        if [ "$2" = "nginx" ]; then
            yum install -y --disablerepo=nginx-stable --enablerepo=AppStream nginx
        else
            yum install -y $2
        fi
    else
        echo_info "$2 已经安装"
    fi
}

check_and_install python3 python3
check_and_install pip3 python3-pip
check_and_install node nodejs
check_and_install npm npm
check_and_install nginx nginx
check_and_install git git

# 2. 安装 Python 后端依赖
echo_info "===== 步骤 2/9: 安装 Python 后端依赖 ====="
cd "$PROJECT_DIR/backend"
pip3 install --upgrade pip
pip3 install -r requirements.txt
echo_info "Python 依赖安装完成"

# 3. 安装前端依赖并构建
echo_info "===== 步骤 3/9: 安装前端依赖 ====="
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo_info "安装前端依赖（首次安装可能需要几分钟）..."
    npm install
else
    echo_info "前端依赖已存在，跳过安装"
fi

# 4. 构建前端生产版本
echo_info "===== 步骤 4/9: 构建前端生产版本 ====="
npm run build
echo_info "前端构建完成"

# 5. 配置 Nginx
echo_info "===== 步骤 5/9: 配置 Nginx 反向代理 ====="

# 检测系统类型并创建相应的 nginx 配置
if [ -d "/etc/nginx/sites-available" ]; then
    # Ubuntu/Debian 风格
    cat > /etc/nginx/sites-available/word-learning << 'EOF'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /var/www/word-learning;
        try_files $uri $uri/ /index.html;
        index index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    # 启用站点
    ln -sf /etc/nginx/sites-available/word-learning /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
else
    # CentOS/RHEL/OpenCloudOS 风格
    cat > /etc/nginx/conf.d/word-learning.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /var/www/word-learning;
        try_files $uri $uri/ /index.html;
        index index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
fi

# 创建静态文件目录
mkdir -p /var/www/word-learning

# 复制构建后的前端文件
cp -r "$PROJECT_DIR/frontend/dist/"* /var/www/word-learning/

# 测试 nginx 配置
nginx -t

# 重启 nginx
systemctl restart nginx
systemctl enable nginx

echo_info "Nginx 配置完成"

# 6. 创建 Systemd 服务
echo_info "===== 步骤 6/9: 创建 Systemd 服务 ====="

# 检测系统用户类型
if id "www-data" &>/dev/null; then
    WEB_USER="www-data"
elif id "nginx" &>/dev/null; then
    WEB_USER="nginx"
else
    WEB_USER="nobody"
fi

cat > /etc/systemd/system/word-learning-backend.service << EOF
[Unit]
Description=Word Learning Backend Service
After=network.target

[Service]
Type=simple
User=$WEB_USER
WorkingDirectory=$PROJECT_DIR/backend
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 $PROJECT_DIR/backend/app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 启用并启动服务
systemctl enable word-learning-backend
systemctl restart word-learning-backend

echo_info "后端服务配置完成"

# 7. 配置防火墙
echo_info "===== 步骤 7/9: 配置防火墙 ====="

if command -v ufw &> /dev/null; then
    echo_info "配置 UFW 防火墙..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo_info "防火墙配置完成"
else
    echo_warning "未检测到 UFW，跳过防火墙配置"
fi

# 8. 设置目录权限
echo_info "===== 步骤 8/9: 设置目录权限 ====="
chown -R $WEB_USER:$WEB_USER "$PROJECT_DIR/backend"
chmod -R 755 "$PROJECT_DIR/backend"
chmod 644 "$PROJECT_DIR/backend/characters.db" 2>/dev/null || true

# 9. 显示部署信息
echo_info "===== 步骤 9/9: 部署完成 ====="
echo ""
echo_info "=========================================="
echo_info "  部署成功完成！"
echo_info "=========================================="
echo ""
echo_info "服务信息："
echo_info "  前端地址: http://$(hostname -I | awk '{print $1}')"
echo_info "  后端 API: http://$(hostname -I | awk '{print $1}')/api/"
echo ""
echo_info "管理命令："
echo_info "  查看后端日志: sudo journalctl -u word-learning-backend -f"
echo_info "  重启后端服务: sudo systemctl restart word-learning-backend"
echo_info "  重启 Nginx:   sudo systemctl restart nginx"
echo_info "  查看服务状态: sudo systemctl status word-learning-backend"
echo ""
echo_warning "注意事项："
echo_warning "  1. 数据库文件位于: $PROJECT_DIR/backend/characters.db"
echo_warning "  2. 建议定期备份数据库文件"
echo_warning "  3. 前端代码更新后需要重新执行: npm run build"
echo_warning "  4. 更新前端后记得复制到 /var/www/word-learning/"
echo ""
echo_info "=========================================="
