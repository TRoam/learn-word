#!/bin/bash

echo "======================================"
echo "     汉字学习系统 - 启动脚本"
echo "======================================"
echo ""

# 检查是否在正确的目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到 Python3，请先安装 Python"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✓ Python 版本: $(python3 --version)"
echo "✓ Node.js 版本: $(node --version)"
echo ""

# 检查后端依赖
echo "检查后端依赖..."
cd backend
if [ ! -f "requirements.txt" ]; then
    echo "❌ 错误：未找到 requirements.txt"
    exit 1
fi

# 安装后端依赖（如果需要）
pip3 install -q -r requirements.txt
echo "✓ 后端依赖已安装"

cd ..

# 检查前端依赖
echo "检查前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖（首次运行可能需要几分钟）..."
    npm install
fi
echo "✓ 前端依赖已安装"

cd ..

echo ""
echo "======================================"
echo "启动服务..."
echo "======================================"
echo ""
echo "后端服务: http://localhost:5000"
echo "前端服务: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 启动后端
cd backend
python3 app.py &
BACKEND_PID=$!

# 等待后端启动
sleep 2

# 启动前端
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# 等待进程
wait $BACKEND_PID $FRONTEND_PID
