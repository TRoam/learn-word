# 汉字学习系统

一个帮助学习和记忆汉字的 Web 应用程序。通过随机展示汉字，让用户标记认识或不认识，累计标记三次认识即视为掌握。

## 功能特性

### ✨ 核心功能
- **汉字库管理**：添加、删除、查看汉字
- **验证模式**：超大字体展示汉字，支持键盘快捷键标记
- **学习统计**：查看学习进度、今日学习记录、历史统计
- **智能学习**：已掌握的汉字自动退出学习队列
- **进度追踪**：记录每次学习的时间和结果

### 🎯 学习规则
- 累计标记"认识"**3次**，汉字标记为已掌握
- 已掌握的汉字不再出现在验证队列中
- 标记"不认识"会重置该汉字的计数
- 可以手动重置任何汉字的学习进度

### ⌨️ 快捷键
在验证模式下：
- `←` 或 `A`：标记为不认识
- `→` 或 `D`：标记为认识

## 技术栈

### 后端
- **Python 3.x**
- **Flask**：Web 框架
- **SQLite**：数据库

### 前端
- **React 18**
- **Vite**：构建工具
- **Tailwind CSS**：样式框架
- **React Router**：路由管理
- **Axios**：HTTP 客户端

## 快速开始

### 环境要求
- Python 3.7+
- Node.js 16+
- npm 或 yarn

### 安装步骤

1. **克隆项目（或使用现有目录）**
```bash
cd word
```

2. **安装后端依赖**
```bash
cd backend
pip install -r requirements.txt
```

3. **安装前端依赖**
```bash
cd ../frontend
npm install
```

### 启动应用

#### 方法一：使用启动脚本（推荐）

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```bash
start.bat
```

#### 方法二：手动启动

**启动后端（在 backend 目录）:**
```bash
cd backend
python app.py
```
后端将运行在 http://localhost:5000

**启动前端（在 frontend 目录，新终端窗口）:**
```bash
cd frontend
npm run dev
```
前端将运行在 http://localhost:3000

### 访问应用

打开浏览器访问：http://localhost:3000

## 项目结构

```
word/
├── backend/                 # 后端代码
│   ├── app.py              # Flask 应用主文件
│   ├── requirements.txt    # Python 依赖
│   └── characters.db       # SQLite 数据库（运行后自动生成）
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── Home.jsx           # 首页
│   │   │   ├── CharacterManagement.jsx  # 汉字库管理
│   │   │   ├── VerificationMode.jsx     # 验证模式
│   │   │   └── Statistics.jsx           # 统计页面
│   │   ├── App.jsx        # 主应用组件
│   │   ├── main.jsx       # 入口文件
│   │   └── index.css      # 全局样式
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── start.sh               # macOS/Linux 启动脚本
├── start.bat              # Windows 启动脚本
└── README.md              # 项目文档
```

## 数据库结构

### characters 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| character | TEXT | 汉字 |
| recognition_count | INTEGER | 认识次数（0-3） |
| is_mastered | BOOLEAN | 是否已掌握 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### learning_records 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| character_id | INTEGER | 汉字ID（外键） |
| recognized | BOOLEAN | 是否认识 |
| recorded_at | TIMESTAMP | 记录时间 |

## API 接口

### 汉字管理
- `GET /api/characters` - 获取所有汉字
- `POST /api/characters` - 添加新汉字
- `DELETE /api/characters/:id` - 删除汉字
- `POST /api/characters/:id/reset` - 重置学习进度

### 学习功能
- `GET /api/characters/random` - 获取随机待学习汉字
- `POST /api/characters/:id/mark` - 标记认识/不认识

### 统计信息
- `GET /api/stats` - 获取学习统计
- `GET /api/records/recent` - 获取最近学习记录

## 使用指南

### 1. 汉字库管理
- 在"汉字库管理"页面可以添加新汉字
- 查看所有汉字的学习状态
- 删除不需要的汉字
- 重置已掌握或学习中的汉字进度

### 2. 开始学习
- 点击"开始验证"进入验证模式
- 系统会随机展示一个未掌握的汉字
- 使用鼠标点击或键盘快捷键标记
- 连续标记"认识"3次后，该字标记为已掌握

### 3. 查看统计
- 在"学习统计"页面查看整体进度
- 查看今日学习的汉字和次数
- 浏览最近的学习记录

## 预置汉字

系统预置了 100 个常用汉字供测试使用，包括：
的、一、是、在、不、了、有、和、人、这、中、大、为、上、个...等

## 注意事项

1. **数据持久化**：数据保存在 SQLite 数据库中，位于 `backend/characters.db`
2. **备份建议**：定期备份 `characters.db` 文件
3. **端口冲突**：如果 5000 或 3000 端口被占用，需要修改配置
4. **浏览器兼容**：建议使用 Chrome、Firefox、Safari 等现代浏览器

## 部署到服务器

### 后端部署
1. 使用 Gunicorn 运行 Flask 应用
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. 配置 Nginx 反向代理

### 前端部署
```bash
cd frontend
npm run build
# 将 dist 目录部署到 Web 服务器
```

## 故障排除

### 后端启动失败
- 检查 Python 版本：`python --version`
- 确保安装了所有依赖：`pip install -r requirements.txt`
- 检查端口 5000 是否被占用

### 前端启动失败
- 检查 Node.js 版本：`node --version`
- 删除 node_modules 重新安装：`rm -rf node_modules && npm install`
- 检查端口 3000 是否被占用

### API 请求失败
- 确保后端服务正在运行
- 检查浏览器控制台的错误信息
- 验证后端 URL 配置是否正确

## 未来改进

- [ ] 添加用户登录系统
- [ ] 支持多用户学习进度
- [ ] 添加学习提醒功能
- [ ] 生成学习报告
- [ ] 支持汉字拼音显示
- [ ] 添加语音朗读功能
- [ ] 导入/导出汉字库

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎反馈！
