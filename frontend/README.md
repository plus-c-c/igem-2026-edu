# HP-Education Alliance Website Demo

这是一个面向 iGEM Education / Human Practices 展示的 React 网站 demo，用于展示西湖大学与浙江大学合作建设的 HP-Education 联盟网站雏形。

当前版本重点是展示网站结构、视觉风格和核心交互流程，暂时不是完整生产系统。

线上 demo：

- Vercel: https://igem-ten.vercel.app
- GitHub: https://github.com/gjj22783-pixel/hp-education-alliance

## 1. 如何本地运行

先安装 Node.js 和 Git。然后执行：

```powershell
git clone https://github.com/gjj22783-pixel/hp-education-alliance.git
cd hp-education-alliance
npm.cmd install
npm.cmd run dev -- --port 5173
```

浏览器打开：

```text
http://localhost:5173/
```

构建生产版本：

```powershell
npm.cmd run build
```

## 2. 网站结构

顶部导航栏包含首页、五个主要栏目和教育项目招募入口：

- 首页
- 合成生物学科普
- 项目应用科普
- 缤纷开放活动
- 教育合作
- 关于联盟
- 教育项目招募

教育项目招募同时保留在这些功能入口：

- 顶部导航栏的“教育项目招募”
- 首页首屏的“教育项目招募”
- 资源库页面右上角的“教育项目招募”
- 每个栏目页中的“发布本栏目项目招募”
- 案例详情页侧栏中的提交按钮

主要页面包括：

| 路径 | 页面 |
| --- | --- |
| `/` | 首页 |
| `/resources` | 教育资源库 |
| `/synbio` | 合成生物学科普 |
| `/applications` | 项目应用科普 |
| `/activities` | 缤纷开放活动 |
| `/cooperation` | 教育合作 |
| `/about` | 关于联盟 |
| `/submit` | 教育项目招募页 |
| `/cases/:caseId` | 宣传案例详情页 |

## 3. 目前已经实现的功能

### 页面展示

- React + Vite 单页应用。
- 首页展示联盟定位、资源库入口、统计数据和精选宣传案例。
- 五个栏目分别有独立页面、头图、推荐材料和代表资源。
- 每个栏目有 3 个展示案例。
- 案例卡片可以点击进入详情页。
- 案例详情页标注“测试内容，仅供展示”。
- 页面加入了合成生物学、实验室、教育活动风格的图片素材。

### 资源库

- 可以查看 demo 资源卡片。
- 支持按栏目筛选。
- 支持按项目材料筛选。
- 支持按队伍筛选。
- 支持按目标受众关键词筛选。
- 资源卡片展示标题、队伍、受众、栏目、材料标签、更新时间和材料完整度。

### 登录与提交

- 实现了 demo 登录弹窗。
- 任意团队名称、邮箱和密码都可以登录。
- 登录状态保存在浏览器 `localStorage`。
- 未登录时点击教育项目招募会先要求登录。
- 登录后可以进入教育项目招募页。
- 提交页支持填写：
  - 机构名称
  - 项目名称
  - 主要洽谈队伍
  - 是否接受其他队伍参与
  - 线上/线下要求
  - 所属栏目
  - 目标受众
  - 活动时限
  - 活动地点
  - 报销情况
  - 机构联系方式
  - 活动简介和要求
  - 项目材料
  - 对应文件上传框
- 当前文件上传只是记录文件名，不会真的上传文件。
- 新提交的资源会保存到本机浏览器 `localStorage`，刷新后仍然保留。

### 部署

- 已配置 `vercel.json`，支持 Vercel 上直接访问子路由。
- 已成功部署到 Vercel。

## 4. 当前还没有实现的功能

这些功能目前只是 demo 逻辑，正式版需要继续开发：

- 没有真实后端。
- 没有真实用户注册、密码校验或权限系统。
- 没有数据库。
- 没有真实文件上传、文件下载或对象存储。
- 没有管理员审核流程。
- 没有资源详情页，当前只有资源卡片。
- 没有多语言切换。
- 没有真实活动数据统计。
- 没有移动端菜单的进一步细节优化。
- 没有 iGEM Wiki 的最终适配版本。

## 5. 文件结构

当前项目结构比较简单：

```text
hp-education-alliance/
├─ index.html
├─ package.json
├─ package-lock.json
├─ vercel.json
├─ README.md
├─ src/
│  ├─ main.jsx
│  └─ styles.css
└─ .gitignore
```

### 关键文件说明

#### `index.html`

Vite 的 HTML 入口文件。页面中只有一个 `#root` 节点，React 应用会挂载到这里。

#### `src/main.jsx`

项目的主要 React 代码，目前为了 demo 简洁，页面、组件、mock 数据都集中在这个文件里。

里面主要包含：

- 页面路由
- 顶部导航
- 首页
- 栏目页
- 资源库页
- 教育项目招募页
- 登录弹窗
- 案例详情页
- mock 资源数据
- mock 宣传案例数据

后续如果项目变大，建议把这个文件拆分成：

```text
src/
├─ data/
├─ pages/
├─ components/
├─ hooks/
└─ styles/
```

#### `src/styles.css`

全站样式文件，包括：

- 全局颜色
- 导航栏
- 首页 hero
- 案例卡片
- 资源卡片
- 栏目页
- 表单
- 登录弹窗
- 响应式布局

#### `vercel.json`

Vercel 部署配置。它的作用是让 `/resources`、`/submit`、`/cases/...` 这些 React Router 子路由在刷新时不会 404。

#### `.gitignore`

用于避免上传本地依赖和构建产物：

- `node_modules`
- `dist`
- `.vercel`

## 6. 后续开发建议

如果继续完善，建议优先做：

1. 拆分组件和数据文件，让代码更容易维护。
2. 增加真实资源详情页。
3. 增加真实后端或轻量数据库。
4. 接入文件上传存储。
5. 增加管理员审核和团队权限。
6. 整理全部中文文案，统一 UTF-8 编码。
7. 做 iGEM Wiki 适配版本。
