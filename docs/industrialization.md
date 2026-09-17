# 产业化教育（Industrialization）功能说明

## 功能概述

「产业化教育」是 SynEdu Global 在教育、实践、招募之外的第四个内容栏目，围绕合成生物学产业化（技术转化、校企交流、社会沟通等）提供两类内容：

- **交流论坛（discussion）**：以讨论帖形式承载产业化话题，支持评论、点赞、收藏。
- **视频资源（video，示例数据）**：栏目预留的视频占位内容，目前为前端 mock。

> 当前仅 3 条讨论作为示例项目接入数据库，视频暂以 locale mock 形式展示。

## 数据模型

不新增实体，**复用 `Resource` 实体**，通过 `category` + `type` 区分：

| 字段 | 值 | 说明 |
| --- | --- | --- |
| `category` | `industrialization` | 栏目标识 |
| `type` | `discussion` | 讨论帖（区别于 `campaign`） |
| `subcategory` | 如 `技术转化` | 讨论标签/主题，对应前端筛选组 |
| `desc` | 摘要 | 卡片/详情页简介 |
| `introductionContent` | Markdown 正文 | 讨论正文，渲染于详情页 |
| `commentCount` | （返回时附加） | 后端 list/get 时按评论数聚合 |

## 后端改动（`backend/src/controllers/resourceController.ts`）

- `POST /api/resources`：创建 `type === "discussion"` 资源时校验 `team / title / category / desc` 必填（draft 跳过校验）。
- `GET /api/resources?category=industrialization&type=discussion`：`list` 支持按 `type` 过滤，并为每条资源附加 `commentCount`。
- `GET /api/resources/:id`：返回 `commentCount`。
- 其余栏目行为不受影响；讨论资源同样支持点赞、收藏、评论。

## 示例数据（`backend/src/seed-industrialization.ts`）

幂等 seed 脚本，通过 TypeORM 直接入库 3 条示例讨论（标题含「（示例）」标识），已存在则跳过：

| 队伍 | 标题 | 标签 | 交互 |
| --- | --- | --- | --- |
| Jiangnan-China | 从实验室走向产业，第一道门槛是什么？（示例） | 技术转化 | 讨论 |
| XJTLU-China | 科研团队与企业应该如何有效对话？（示例） | 校企交流 | 讨论 |
| ZJU-China | 合成生物学产品如何建立公众信任？（示例） | 社会沟通 | 讨论 |

运行方式见本文档「部署与重新录入」。

## 前端改动

### 路由（`frontend/src/main.tsx`）

在 `features.industrialization` 开启时才注册：

- `/industrialization`、`/industrialization/discussions`、`/industrialization/videos`：工业化栏目页（懒加载，透传 `resources / user / onSubmit`）。
- `/industrialization/video/:videoIndex`：视频示例详情页（`VideoDetailPage`）。

讨论详情直接复用现有 `/cases/:id`（`CaseDetailPage`），已在查找资源时放宽 `type === "campaign"` 限制，非 campaign 的 published 资源同样可渲染。

### 栏目页（`frontend/src/components/IndustrializationPage.tsx`）

- 论坛标签页：从 `resources` 过滤 `category === "industrialization" && type === "discussion"`，按标签（`subcategory`）筛选、按标题/队伍/标签搜索。
- 卡片复用**与其他项目一致的 `CampaignCard`（`variant="project"`）**，渲染在 `campaign-grid` 中，保证格式统一。
- 视频标签页：读取 locale mock，按视频主题筛选，同样以 `campaign-card project-card` 样式展示。
- 「在这里添加你的内容」按钮跳转 `/submit?category=industrialization`。

### 创建 / 编辑（`frontend/src/components/SubmitResourcePage.tsx`）

与其他栏目共用同一发布/编辑表单，选择「产业化教育」类别时：

- `projectLabel` 显示为「产业讨论」，下拉主题取自 `categoryThemeOptions.industrialization`（`frontend/src/data/constants.ts`）。
- 提交/编辑的资源 `type` 设为 `discussion`。
- 隐藏活动信息、下载材料、现场照片、Tips 等 campaign 专属区块，保留封面、简介、项目介绍书（正文）、图片授权。
- 图片授权与其他所有类型一致：**图片非必填；无图片时无需勾选授权；上传图片后须勾选图片授权**（`hasImage` 判断），无图片有兜底图（`/images/classroom.jpg`）。

### 详情页（复用 `CaseDetailPage`）

讨论详情沿用现有项目管理详情页：简介、介绍书 Markdown 正文、点赞/收藏、评论区；资源作者或管理员可编辑/删除。

## 功能开关

- 通用 dev mode 机制：`frontend/src/config/features.ts` 维护一个特性登记表，每项取值：
  - `true`：所有前端显示（igem dev + 生产同步显示）。
  - `false`：所有前端隐藏。
  - `"dev"`：仅当构建时 `VITE_DEV_MODE=true`（即 igem dev 前端）显示。
- 工业化教育当前登记为 `"dev"`（仅 igem dev 前端显示）；改为 `true` 即可在两个前端同时显示。
- 新增/修改功能时，只需在登记表中标注，无需改动消费端逻辑。
- 构建开关：dev 构建使用 `VITE_DEV_MODE=true npx vite build`（或 `npm run build:dev`）；生产默认关闭。

## 部署与重新录入

### 前端部署（dmit 服务器，189.24.97.23，https://syneduglobal.top）

```bash
npx vite build                                      # 本地构建（生产，dev mode 默认关闭）
scp -r frontend/dist/* root@dmit:/var/www/html/      # 覆盖静态文件（会保留旧 hash 文件，可手动清理）
```

dmit 的 nginx：`/api/` 代理到 `127.0.0.1:7600`（frps），再经内网 frpc 隧道转发至 igem 后端。

### 后端部署（igem，10.70.194.118）

```bash
scp backend/src/seed-industrialization.ts \
    backend/src/controllers/resourceController.ts \
    igem:/home/igem/igem-2026/education/backend/src/{seed-industrialization.ts,controllers/}
ssh igem "cd /home/igem/igem-2026/education && docker compose build backend && docker compose up -d backend"
```

### 重新录入 3 条示例讨论

```bash
# 本地编译，把 JS 拷进容器再运行（容器内无 src，只有 dist）
npx tsc --project backend/tsconfig.json
scp backend/dist/seed-industrialization.js igem:/tmp/
ssh igem "docker cp /tmp/seed-industrialization.js education-backend-1:/app/backend/dist/ && \
          docker exec education-backend-1 node backend/dist/seed-industrialization.js"
```

### 验证

```bash
curl -s "https://syneduglobal.top/api/resources?category=industrialization&type=discussion"  # 返回 3 条
# 浏览器打开 https://syneduglobal.top/industrialization → 看到 3 张与其它项目格式一致的卡片
# 点击卡片 → /cases/:id → 详情页含正文、评论区
```

## 注意事项

- 「（示例）」标题标识用于区分正式内容，正式发布时可通过同一表单编辑/删除。
- 图片相关遗留问题（hero 背景图重复/偏移、项目配图未加载）后续单独处理，不阻塞本次工业化功能。
- igem 上 `:5173` 端口属于另一项目前端，与本功能无关，勿改动。