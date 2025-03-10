# TaskMaster - 个人代办计划助手 | Personal Todo Task Assistant

<div align="center">
  <img src="public/logo.png" alt="TaskMaster Logo" width="200" />
  <p>
    <b>智能、高效的个人计划与任务管理解决方案 | Smart and efficient personal planning and task management solution</b>
  </p>
</div>

[English](#english) | [中文](#中文)

<a name="english"></a>
## English

### Introduction

TaskMaster is a powerful task management application built with Next.js, MySQL, and Material UI. It helps you organize your tasks, synchronize with Notion, and leverage AI for smart suggestions and workload optimization.

### Features

- ✅ **Comprehensive Task Management**: Create, edit, prioritize and track all your tasks in one place
- 🔄 **Notion Integration**: Bi-directional sync with Notion databases
- 🧠 **AI-Powered Features**: Task suggestions, workload analysis, and natural language processing
- 🔌 **Plugin System**: Extend functionality with weather, calendar and other integrations
- 📊 **Multiple Views**: List, Kanban and Calendar views for different workflows
- 📱 **Responsive Design**: Works on desktop, tablet and mobile devices
- 🎯 **Smart Planning**: AI-powered time estimation and scheduling
- 🔍 **Advanced Analytics**: Understand your productivity patterns
- 🎤 **Voice Assistant**: Control the app using voice commands

### Tech Stack

- **Frontend**: Next.js, React, Material UI
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Containerization**: Docker, Docker Compose
- **Development**: DevContainer

### Getting Started

#### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Notion API Key (for Notion integration)
- OpenAI API Key (for AI features)

#### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskmaster.git
   cd taskmaster

   I'll output the complete README.md file content for your project.

```markdown name=README.md
# TaskMaster - 个人代办计划助手 | Personal Todo Task Assistant

<div align="center">
  <img src="public/logo.png" alt="TaskMaster Logo" width="200" />
  <p>
    <b>智能、高效的个人计划与任务管理解决方案 | Smart and efficient personal planning and task management solution</b>
  </p>
</div>

[English](#english) | [中文](#中文)

<a name="english"></a>
## English

### Introduction

TaskMaster is a powerful task management application built with Next.js, MySQL, and Material UI. It helps you organize your tasks, synchronize with Notion, and leverage AI for smart suggestions and workload optimization.

### Features

- ✅ **Comprehensive Task Management**: Create, edit, prioritize and track all your tasks in one place
- 🔄 **Notion Integration**: Bi-directional sync with Notion databases
- 🧠 **AI-Powered Features**: Task suggestions, workload analysis, and natural language processing
- 🔌 **Plugin System**: Extend functionality with weather, calendar and other integrations
- 📊 **Multiple Views**: List, Kanban and Calendar views for different workflows
- 📱 **Responsive Design**: Works on desktop, tablet and mobile devices
- 🎯 **Smart Planning**: AI-powered time estimation and scheduling
- 🔍 **Advanced Analytics**: Understand your productivity patterns
- 🎤 **Voice Assistant**: Control the app using voice commands

### Tech Stack

- **Frontend**: Next.js, React, Material UI
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Containerization**: Docker, Docker Compose
- **Development**: DevContainer

### Getting Started

#### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Notion API Key (for Notion integration)
- OpenAI API Key (for AI features)

#### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskmaster.git
   cd taskmaster
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

3. Start the application using Docker:
   ```bash
   docker-compose up -d
   ```

4. Access the application at http://localhost:3000

### Plugin System

TaskMaster features a flexible plugin system that allows extending the application's functionality:

- **Weather Plugin**: Get weather information to plan outdoor tasks
- **Calendar Plugin**: Synchronize with Google Calendar
- **Task Analysis Plugin**: Get insights on your productivity patterns
- **Custom Plugins**: Extend the system with your own plugins

Plugins can be managed from the dedicated plugins page in the application.

### Voice Assistant

TaskMaster includes a voice assistant for hands-free interaction:

- Create tasks using natural language
- Query your task list
- Get productivity insights
- Control the application with simple voice commands

### AI Features

The application leverages artificial intelligence to enhance your productivity:

- **Task Suggestions**: Get AI-powered suggestions for new tasks
- **Workload Prediction**: Estimate task completion time based on history
- **Smart Scheduling**: Optimize your day with AI task planning
- **Natural Language Processing**: Create tasks using everyday language
- **Productivity Analysis**: Get insights into your work patterns

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the LICENSE file for details.

<a name="中文"></a>
## 中文

### 介绍

TaskMaster 是一款基于 Next.js、MySQL 和 Material UI 构建的强大任务管理应用。它帮助您组织任务，与 Notion 同步，并利用人工智能提供智能建议和工作负载优化。

### 功能特点

- ✅ **全面的任务管理**：在一处创建、编辑、设置优先级和跟踪所有任务
- 🔄 **Notion 集成**：与 Notion 数据库双向同步
- 🧠 **AI 驱动功能**：任务建议、工作量分析和自然语言处理
- 🔌 **插件系统**：通过天气、日历和其他集成扩展功能
- 📊 **多视图**：适用于不同工作流的列表、看板和日历视图
- 📱 **响应式设计**：适用于桌面、平板和移动设备
- 🎯 **智能规划**：AI 支持的时间估计和调度
- 🔍 **高级分析**：了解您的生产力模式
- 🎤 **语音助手**：使用语音命令控制应用

### 技术栈

- **前端**：Next.js、React、Material UI
- **后端**：Next.js API 路由
- **数据库**：MySQL
- **容器化**：Docker、Docker Compose
- **开发环境**：DevContainer

### 开始使用

#### 前提条件

- Docker 和 Docker Compose
- Node.js（用于本地开发）
- Notion API 密钥（用于 Notion 集成）
- OpenAI API 密钥（用于 AI 功能）

#### 安装

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/taskmaster.git
   cd taskmaster
   ```

2. 设置环境变量：
   ```bash
   cp .env.example .env.local
   # 在 .env.local 中编辑你的 API 密钥和配置
   ```

3. 使用 Docker 启动应用：
   ```bash
   docker-compose up -d
   ```

4. 访问应用：http://localhost:3000

### 插件系统

TaskMaster 具有灵活的插件系统，允许扩展应用功能：

- **天气插件**：获取天气信息，规划户外任务
- **日历插件**：与 Google 日历同步
- **任务分析插件**：获取生产力模式的洞察
- **自定义插件**：用您自己的插件扩展系统

可以从应用中的专用插件页面管理插件。

### 语音助手

TaskMaster 包含语音助手，实现免提交互：

- 使用自然语言创建任务
- 查询任务列表
- 获取生产力洞察
- 使用简单的语音命令控制应用

### AI 功能

应用利用人工智能增强您的生产力：

- **任务建议**：获取 AI 提供的新任务建议
- **工作量预测**：基于历史记录估计任务完成时间
- **智能调度**：使用 AI 任务规划优化您的一天
- **自然语言处理**：使用日常语言创建任务
- **生产力分析**：获取工作模式的洞察

### 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 该仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

### 许可

该项目基于 MIT 许可证 - 详情请参阅 LICENSE 文件。

## 示例屏幕截图

<div align="center">
  <img src="public/screenshots/dashboard.png" alt="Dashboard" width="600" />
  <p><i>主页面 - 任务管理界面</i></p>
</div>

<div align="center">
  <img src="public/screenshots/kanban.png" alt="Kanban View" width="600" />
  <p><i>看板视图 - 拖放任务管理</i></p>
</div>

<div align="center">
  <img src="public/screenshots/analytics.png" alt="Analytics" width="600" />
  <p><i>分析视图 - 生产力统计和趋势</i></p>
</div>
```

## 代码行数统计

我们的项目包含以下估计代码行数:

| 模块 | 文件数 | 估计行数 |
|------|--------|----------|
| Docker 和 DevContainer 配置 | 3 | 约 100 行 |
| 项目配置文件 | 3 | 约 80 行 |
| 数据库相关 | 2 | 约 120 行 |
| Notion 同步服务 | 1 | 约 200 行 |
| AI 服务接口 | 1 | 约 120 行 |
| API 路由 | 7 | 约 400 行 |
| 前端页面 | 3 | 约 450 行 |
| 组件 | 8 | 约 1200 行 |
| 插件系统 | 6 | 约 650 行 |
| 自然语言处理 | 1 | 约 200 行 |
| 工作量预测 | 1 | 约 350 行 |
| 通知管理 | 1 | 约 200 行 |
| 用户偏好设置 | 1 | 约 150 行 |
| 任务规划器 | 1 | 约 300 行 |
| 语音助手 | 2 | 约 380 行 |
| 智能标签系统 | 1 | 约 200 行 |
| 其他功能模块 | 3 | 约 350 行 |
| 样式和静态文件 | 2 | 约 50 行 |
| 文档和配置 | 4 | 约 300 行 |

**总估计代码行数：约 5,450 行**