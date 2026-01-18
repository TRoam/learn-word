#!/bin/bash

echo "=================================="
echo "  汉字学习系统 - 局域网访问地址"
echo "=================================="
echo ""

# 获取本机局域网IP地址
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$IP" ]; then
    echo "❌ 无法获取本机IP地址"
    echo ""
    echo "请手动查看IP地址："
    echo "macOS: 系统偏好设置 -> 网络"
    echo "Linux: ip addr 或 ifconfig"
else
    echo "✓ 本机IP地址: $IP"
    echo ""
    echo "局域网内其他设备可通过以下地址访问："
    echo ""
    echo "  前端地址: http://$IP:3000"
    echo "  后端API:  http://$IP:5000"
    echo ""
    echo "使用说明："
    echo "1. 确保本机和访问设备在同一局域网"
    echo "2. 确保防火墙允许3000和5000端口访问"
    echo "3. 在其他设备的浏览器中输入上述地址"
fi

echo ""
echo "=================================="
