import type { CampaignCase } from "../types"

export const campaignCases: CampaignCase[] = [
  { category: "synbio", title: "SynBio Starter Day", subtitle: "从 DNA 到细胞工厂", image: "/images/microscope.jpg", format: "90 分钟入门课", impact: "适合 40-80 人课堂", materials: ["概念讲解", "小组问答", "课后测量"] },
  { category: "synbio", title: "BioSafety Cards", subtitle: "生物安全情景讨论", image: "/images/students.jpg", format: "桌面讨论活动", impact: "形成可复用讨论卡", materials: ["伦理案例", "角色卡", "反馈表"] },
  { category: "synbio", title: "Build-a-Cell Workshop", subtitle: "搭建一个细胞工厂", image: "/images/lab-team.jpg", format: "互动工作坊", impact: "适合科学社团", materials: ["元件卡", "流程图", "成果测量"] },
  { category: "applications", title: "BioCartilage Story", subtitle: "仿生软骨项目路演", image: "/images/lab-work.jpg", format: "项目科普展台", impact: "连接医学与材料", materials: ["项目海报", "演示讲稿", "受众问卷"] },
  { category: "applications", title: "AI Perfume Lab", subtitle: "AI 与气味设计", image: "/images/petri.jpg", format: "公众体验展", impact: "适合展会空间", materials: ["体验卡", "文创", "宣传折页"] },
  { category: "applications", title: "Future BioProducts", subtitle: "生物制造产品想象", image: "/images/classroom.jpg", format: "创意设计课", impact: "产出学生方案", materials: ["案例包", "设计纸", "展示模板"] },
  { category: "activities", title: "Agar Art Open Lab", subtitle: "微生物作画开放活动", image: "/images/petri.jpg", format: "开放日体验", impact: "强视觉传播", materials: ["材料清单", "安全说明", "照片记录"] },
  { category: "activities", title: "DNA Bracelet Bar", subtitle: "碱基配对文创摊位", image: "/images/classroom.jpg", format: "流动摊位", impact: "低成本高参与", materials: ["珠子包", "讲解卡", "现场反馈"] },
  { category: "activities", title: "BioMaterial Touch Table", subtitle: "生物材料触摸展", image: "/images/lab-team.jpg", format: "互动展示", impact: "适合校园展会", materials: ["样品说明", "场地条件", "引导话术"] },
  { category: "cooperation", title: "Rural SynBio Kit", subtitle: "支教课程包", image: "/images/students.jpg", format: "4 课时课程", impact: "无复杂仪器", materials: ["教师手册", "学生任务单", "反馈量表"] },
  { category: "cooperation", title: "Teacher Co-design", subtitle: "科学教师共备", image: "/images/classroom.jpg", format: "线上+线下共备", impact: "提升落地稳定性", materials: ["共备模板", "安全边界", "复盘表"] },
  { category: "cooperation", title: "Campus Outreach Week", subtitle: "合作学校科普周", image: "/images/microscope.jpg", format: "一周活动包", impact: "覆盖多个班级", materials: ["排期表", "活动物料", "测量工具"] },
  { category: "about", title: "Alliance Launch Kit", subtitle: "联盟介绍与招募包", image: "/images/alliance.jpg", format: "对外介绍页", impact: "适合拉新合作", materials: ["联盟简介", "分工说明", "联系方式"] },
  { category: "about", title: "Sponsor Micro-grant", subtitle: "小额赞助与文创支持", image: "/images/lab-work.jpg", format: "赞助说明方案", impact: "支持网站与物料", materials: ["预算表", "权益说明", "赞助入口"] },
  { category: "about", title: "Education Impact Report", subtitle: "年度教育成果报告", image: "/images/students.jpg", format: "成果展示", impact: "面向评审与伙伴", materials: ["数据看板", "现场照片", "案例摘要"] },
]
