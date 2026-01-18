@echo off
chcp 65001 >nul
echo ======================================
echo      汉字学习系统 - 启动脚本
echo ======================================
echo.

REM 检查是否在正确的目录
if not exist "backend" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到 Python，请先安装 Python
    pause
    exit /b 1
)

REM 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo ✓ Python 已安装
echo ✓ Node.js 已安装
echo.

REM 安装后端依赖
echo 检查后端依赖...
cd backend
pip install -q -r requirements.txt
echo ✓ 后端依赖已安装
cd ..

REM 检查前端依赖
echo 检查前端依赖...
cd frontend
if not exist "node_modules" (
    echo 正在安装前端依赖（首次运行可能需要几分钟）...
    call npm install
)
echo ✓ 前端依赖已安装
cd ..

echo.
echo ======================================
echo 启动服务...
echo ======================================
echo.
echo 后端服务: http://localhost:5000
echo 前端服务: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务
echo.

REM 在新窗口启动后端
start "汉字学习系统-后端" cmd /k "cd backend && python app.py"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 在新窗口启动前端
start "汉字学习系统-前端" cmd /k "cd frontend && npm run dev"

echo.
echo ✓ 服务已启动！
echo.
echo 正在打开浏览器...
timeout /t 5 /nobreak >nul
start http://localhost:3000

pause
