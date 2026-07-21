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

启动后等待一分钟左右，浏览器打开 [http://localhost](http://localhost) 即可看到页面和 15 个示例教育项目。

## 启动流程说明

`docker compose up -d` 会自动按以下顺序启动：

```
db (PostgreSQL) → backend (API) → seed (初始化) → frontend (Nginx)
```

### seed 初始化容器

**seed** 容器完成以下步骤后自动退出：

1. 通过 TypeORM 直接连接数据库，检测管理员账号是否存在
2. 若不存在，创建管理员账号（**邮箱** `admin@igem-education.com` / **密码** `devAdmin123!`，角色为 `admin`）
3. 等待后端 API 就绪
4. 通过 API 登录管理员账号
5. 调用 `DELETE /api/resources/:id` 清除所有现有示例项目
6. 调用 `POST /api/resources` 逐条创建 15 个示例教育项目（5 个栏目各 3 个），每个项目含标题、描述、活动形式、展示价值、配图及实施步骤

管理员账号创建在 `backend/src/seed.ts` 中的 `seedAdmin()` 函数完成，直接操作数据库（TypeORM），不经过 API。

### 管理员账号

- 邮箱：`admin@igem-education.com`
- 密码：`devAdmin123!`

登录后可发布、编辑、删除教育项目。

### 手动重新初始化

如需重置所有数据：

```bash
docker compose run --rm seed
```

脚本会清除所有现有项目并重新创建 15 个示例项目。

## 项目结构

```
├── backend/            # Express + TypeORM API
│   └── src/
│       ├── entity/     # 数据模型
│       ├── routes/     # API 路由
│       └── seed.ts     # 初始化脚本：管理员创建（TypeORM）+ 示例数据录入（HTTP API）
├── frontend/           # Vite + React 前端
│   └── src/
│       ├── components/ # 页面组件
│       ├── data/       # 栏目配置
│       └── styles.css  # Apple 设计语言样式
├── docker-compose.yml  # Docker 编排（含 seed 服务）
└── README.md
```
