import { FlaskConical, Sparkles, Handshake, Building2 } from "lucide-react"
import type { Category } from "../types"

const imageAssets = {
  students: "/images/students.jpg",
  petri: "/images/petri.jpg",
  classroom: "/images/classroom.jpg",
  microscope: "/images/microscope.jpg",
  labTeam: "/images/lab-team.jpg",
  labWork: "/images/lab-work.jpg",
  alliance: "/images/alliance.jpg",
}

export const categories: Category[] = [
  {
    id: "applications",
    path: "/applications",
    name: "讲座科普",
    short: "Projects",
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
    intro: "沉淀微生物作画、生物材料体验、开放工作坊等互动式教育活动方案。",
    accent: "#d69b18",
    image: imageAssets.petri,
    recommended: ["材料清单", "场地条件", "活动流程", "现场照片", "安全说明", "满意度调查"],
  },
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
