# HP-Education 联盟 — iGEM 教育资源共享平台

## 快速开始

### 前置要求

- Docker + Docker Compose
- Git

### 克隆与启动

```bash
git clone <仓库地址>
cd igem-2026-edu
docker compose up -d
```

首次启动会自动完成以下步骤：

1. 启动 PostgreSQL 数据库
2. 启动后端 API 服务（端口 3000）
3. 自动创建管理员账号并录入 15 个示例教育项目
4. 启动前端 Nginx 服务（端口 80）

### 访问网页

浏览器打开 [http://localhost](http://localhost)

### 示例项目

首页和各个栏目页面展示 5 类共 15 个示例教育项目（合成生物学科普 / 讲座科普 / 缤纷开放活动 / 教育合作 / 关于联盟），每个项目包含标题、描述、活动形式、展示价值和实施步骤。

### 管理员账号

- 邮箱：`admin@igem-education.com`
- 密码：`devAdmin123!`

登录后可发布、编辑、删除教育项目。

### 重新录入示例数据

```bash
docker compose run --rm seed-data
```

脚本会先清除所有现有项目，再重新创建 15 个示例项目。

### 项目结构

```
├── backend/            # Express + TypeORM API
│   └── src/
│       ├── entity/     # 数据模型
│       ├── routes/     # API 路由
│       ├── seed.ts     # 管理员账号种子
│       └── seed-data.ts # 示例项目种子脚本
├── frontend/           # Vite + React 前端
│   └── src/
│       ├── components/ # 页面组件
│       ├── data/       # 栏目配置
│       └── styles.css  # Apple 设计语言样式
├── docker-compose.yml  # Docker 编排
└── README.md
```
