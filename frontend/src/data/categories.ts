import { FlaskConical, Sparkles, Handshake, Factory, Building2 } from "lucide-react"
import type { Category } from "../types"
import { features } from "../config/features"

const imageAssets = {
  students: "/images/students.jpg",
  petri: "/images/petri.jpg",
  classroom: "/images/classroom.jpg",
  microscope: "/images/microscope.jpg",
  labTeam: "/images/lab-team.jpg",
  labWork: "/images/lab-work.jpg",
  alliance: "/images/alliance.jpg",
  industrialization: "/images/industrialization.jpg",
}

export const categories: Category[] = [
  {
    id: "applications",
    path: "/lecture",
    name: "讲座科普",
    short: "Lecture",
    icon: FlaskConical,
    intro: "开展各种主题的讲座，让大众走进合成生物学，了解 iGEM 和合成生物学的各种应用，降低学生和大众对新技术的误解。",
    accent: "#2776b8",
    image: imageAssets.labWork,
    recommended: ["PPT", "演讲稿", "阅读材料", "宣传材料", "文创", "实践建议"],
  },
  {
    id: "activities",
    path: "/activities",
    name: "实践活动",
    short: "Events",
    icon: Sparkles,
    intro: "在这里，你可以上传互动性更强的活动方案，比如微生物作画、集市摊位宣传、开放工作坊等。",
    accent: "#d69b18",
    image: imageAssets.petri,
    recommended: ["材料清单", "场地条件", "活动流程", "现场照片", "安全说明", "满意度调查"],
  },
  ...(features.industrialization
    ? [{
        id: "industrialization",
        path: "/industrialization",
        name: "产业化教育",
        short: "Industrialization",
        icon: Factory,
        intro: "连接科研、产业与社会，围绕合成生物学成果从实验室走向真实应用过程中的技术转化、产业实践与社会议题展开学习与交流。",
        accent: "#1f7a5c",
        image: imageAssets.industrialization,
        recommended: ["案例", "视频", "讨论", "技术转化", "产业实践"],
      } as Category]
    : []),
  {
    id: "cooperation",
    path: "/cooperation",
    name: "教育项目招募",
    short: "Partners",
    icon: Handshake,
    intro: "记录支教队伍、合作学校、公益教育场景和课程包共建进度。",
    accent: "#31a6b2",
    image: imageAssets.classroom,
    recommended: ["合作学校", "支教队伍", "课程包", "反馈记录", "覆盖人数", "后续计划"],
  },
  {
    id: "about",
    path: "/about",
    name: "关于我们",
    short: "Alliance",
    icon: Building2,
    intro: "展示联盟构成、团队分工、运行模式、赞助入口与年度教育成果。",
    accent: "#5c6bc0",
    image: imageAssets.alliance,
    recommended: ["参与队伍", "分工", "运行模式", "企业赞助", "联系方式", "年度成果"],
  },
]

export const visibleCategories: Category[] = categories
