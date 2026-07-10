import "reflect-metadata"
import "./config/env"
import { createMainDataSource } from "./config/database"
import { User } from "./entity/User"

const API_URL = process.env.API_URL || "http://localhost:3000"

interface CampaignStep {
  id: string
  text: string
  files: { fileId: string; name: string }[]
}

interface SeedResource {
  title: string
  category: string
  subcategory?: string
  team: string
  desc: string
  type: string
  status: string
  format: string
  impact: string
  subtitle?: string
  image?: string
  audience?: string
  delivery?: string
  duration?: string
  location?: string
  contact?: string
  negotiator?: string
  acceptsOthers?: string
  reimbursement?: string
  materials?: string[]
  campaignSteps?: CampaignStep[]
  canParticipate?: string
  locationType?: string
  locationCountry?: string
  locationProvince?: string
  locationCity?: string
  eventDate?: string
  timeLimitType?: string
  timeRangeStart?: string
  timeRangeEnd?: string
  tips?: string
  sitePhotosFormat?: string
  sitePhotoIds?: string
  introductionContent?: string
  imageAuthorization?: boolean
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9)

const sampleResources: SeedResource[] = [

  {
    category: "applications",
    subcategory: "合成生物学科普",
    title: "细胞工厂——微生物如何帮我们生产药物",
    team: "西湖大学 SynBio 科普组",
    subtitle: "从胰岛素到青蒿素，探秘微生物的超级生产力",
    format: "课堂讲座 + 互动实验",
    impact: "适合 40-80 人课堂，45 分钟讲解 + 30 分钟实验体验",
    desc: "本课程以「细胞工厂」为主线，介绍合成生物学如何改造微生物来生产药物、材料和能源。课程包含 PPT 讲解、动画演示和微生物观察实验三个环节，适合高中生物选修课或大学通识课。配套提供教师手册、学生工作纸和评估量表。",
    audience: "高中生 / 大学新生",
    delivery: "线下",
    duration: "75 分钟",
    location: "教室 / 实验室",
    contact: "synbio@westlake.edu.cn",
    negotiator: "张老师",
    acceptsOthers: "yes",
    reimbursement: "可提供交通补贴",
    type: "campaign",
    status: "published",
    image: "/images/microscope.jpg",
    materials: ["PPT", "演讲稿", "阅读材料", "满意度调查", "实践建议"],
    campaignSteps: [
      { id: uid(), text: "准备 PPT 课件（30 页）、微生物标本玻片、便携显微镜 10 台", files: [] },
      { id: uid(), text: "讲师试讲 2 次，助教培训 1 次，确保实验环节安全可控", files: [] },
      { id: uid(), text: "现场执行：45 分钟讲解 → 10 分钟提问 → 20 分钟显微镜观察", files: [] },
      { id: uid(), text: "收集学生反馈问卷，统计满意度，撰写课程总结报告", files: [] },
    ],
    canParticipate: "yes",
    locationType: "venues",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-09-15",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "提前准备好实验器材并检查安全性",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 活动简介\n\n「细胞工厂」是一项面向高中生和大学新生的合成生物学科普课程。课程以微生物为载体，介绍合成生物学在药物生产中的应用。\n\n## 活动目标\n\n- 了解合成生物学的基本概念\n- 理解微生物如何被改造用于药物生产\n- 通过显微镜观察微生物形态\n\n## 适用场景\n\n本课程可作为高中生物选修课、大学通识课或科普活动使用，配套提供教师手册和学生工作纸。",
    imageAuthorization: true,
  },
  {
    category: "applications",
    subcategory: "合成生物学科普",
    title: "DNA 折纸——用分子搭建纳米结构",
    team: "浙江大学 iGEM 科普分队",
    subtitle: "当 DNA 变成建筑材料，微观世界也能搭积木",
    format: "互动工作坊",
    impact: "适合 20-30 人小班，90 分钟动手搭建，需要基础生物知识",
    desc: "DNA 折纸技术是合成生物学的前沿方向之一。本工作坊通过纸模搭建类比 DNA 折纸原理，让学生亲手「折叠」出纳米结构。配套提供 DNA 纸模套装、原理动画和拓展阅读材料。活动结束后学生可将作品带走留念。",
    audience: "大学生 / 科研爱好者",
    delivery: "线下",
    duration: "90 分钟",
    location: "活动室 / 实验室",
    contact: "zju-igem@zju.edu.cn",
    negotiator: "李博士",
    acceptsOthers: "yes",
    reimbursement: "提供材料包",
    type: "campaign",
    status: "published",
    image: "/images/students.jpg",
    materials: ["PPT", "演讲稿", "阅读材料", "宣传材料", "文创"],
    campaignSteps: [
      { id: uid(), text: "设计 DNA 纸模模板（3 种难度），采购纸张与打印耗材", files: [] },
      { id: uid(), text: "录制原理讲解视频（8 分钟），制作活动引导手册", files: [] },
      { id: uid(), text: "分两组开展：原理讲解 30 分钟 → 动手搭建 50 分钟 → 展示分享 10 分钟", files: [] },
      { id: uid(), text: "拍摄活动照片、收集反馈问卷，整理成活动案例存档", files: [] },
    ],
    canParticipate: "yes",
    locationType: "venues",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-09-20",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "建议参与者提前了解 DNA 双螺旋结构的基本概念",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 活动简介\n\nDNA 折纸（DNA Origami）是利用 DNA 分子的自组装特性，将长链 DNA 折叠成预设纳米结构的技术。\n\n## 工作坊内容\n\n- DNA 折纸原理讲解（含动画演示）\n- 纸模搭建体验（3 种难度可选）\n- 作品展示与交流\n\n## 收获\n\n参与者将带走自己制作的 DNA 纸模作品，并获得活动参与证书。",
    imageAuthorization: true,
  },
  {
    category: "applications",
    subcategory: "iGEM科普",
    title: "基因编辑 CRISPR——从原理到伦理",
    team: "HP-Education 科普工作组",
    subtitle: "编辑生命密码，技术如何改变世界",
    format: "科普讲座 + 圆桌讨论",
    impact: "适合 50-120 人大课，60 分钟讲座 + 30 分钟讨论，可线上直播",
    desc: "CRISPR 基因编辑技术是合成生物学的核心工具之一。本讲座从发现历程、作用机制到临床应用和伦理争议，以通俗易懂的方式全面介绍 CRISPR。特别设置「伦理圆桌」环节，引导学生思考基因编辑的社会影响。",
    audience: "高中生 / 公众",
    delivery: "线上+线下",
    duration: "90 分钟",
    location: "报告厅 / 线上会议",
    contact: "edu@hp-alliance.cn",
    negotiator: "王老师",
    acceptsOthers: "yes",
    reimbursement: "",
    type: "campaign",
    status: "published",
    image: "/images/lab-team.jpg",
    materials: ["PPT", "演讲稿", "阅读材料", "满意度调查", "成果测量表", "实践建议"],
    campaignSteps: [
      { id: uid(), text: "制作 40 页科普 PPT，准备 3 个伦理讨论案例素材", files: [] },
      { id: uid(), text: "邀请 2 位生物伦理学家参与圆桌环节，确认议程", files: [] },
      { id: uid(), text: "讲座与圆桌衔接流畅，预留充足问答时间，线上同步直播", files: [] },
      { id: uid(), text: "发布活动新闻稿，收集线上+线下反馈数据，形成评估报告", files: [] },
    ],
    canParticipate: "yes",
    locationType: "venues",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-10-10",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "建议参与者提前阅读 CRISPR 相关科普文章",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 活动简介\n\nCRISPR-Cas9 是目前最流行的基因编辑工具，本讲座将从诺贝尔奖出发，全面介绍这一革命性技术。\n\n## 议程安排\n\n1. **科学讲座**（60分钟）：CRISPR 的发现、原理与应用\n2. **伦理圆桌**（30分钟）：基因编辑的社会影响与伦理边界\n\n## 适合人群\n\n对生物学感兴趣的高中生、大学生及公众，无需专业背景。",
    imageAuthorization: true,
  },
  {
    category: "applications",
    subcategory: "合成生物学科普",
    title: "微生物燃料电池——用细菌发电",
    team: "Westlake iGEM 2024",
    subtitle: "污水中的细菌也能点亮一盏灯",
    format: "项目展示 + 实验演示",
    impact: "适合 30-60 人参观，45 分钟展示 + 15 分钟互动",
    desc: "展示西湖大学 iGEM 团队 2024 年项目——微生物燃料电池。现场演示如何利用污水处理过程中的产电细菌点亮 LED 灯。讲解项目设计思路、实验过程和未来应用场景，激发学生对合成生物学应用的兴趣。",
    audience: "中学生 / 公众",
    delivery: "线下",
    duration: "60 分钟",
    location: "开放实验室 / 科技馆",
    contact: "westlake-igem@westlake.edu.cn",
    negotiator: "陈同学",
    acceptsOthers: "yes",
    reimbursement: "",
    type: "campaign",
    status: "published",
    image: "/images/lab-work.jpg",
    materials: ["PPT", "演讲稿", "宣传材料", "文创", "实践建议"],
    campaignSteps: [
      { id: uid(), text: "搭建微生物燃料电池演示装置，制备细菌培养液", files: [] },
      { id: uid(), text: "设计 A3 海报 3 张、项目介绍折页 200 份", files: [] },
      { id: uid(), text: "分 3 轮展示：每轮 30 分钟讲解 + 15 分钟互动问答 + 15 分钟演示", files: [] },
      { id: uid(), text: "统计参观人数，收集留言与反馈，整理媒体报道素材", files: [] },
    ],
    canParticipate: "yes",
    locationType: "venues",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-10-05",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "现场演示装置较精密，请勿触碰实验器材",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 活动简介\n\n微生物燃料电池（MFC）是一种利用微生物代谢产生电能的装置。本展示将现场演示如何用细菌处理污水并产生电能。\n\n## 项目亮点\n\n- 亲手点亮由细菌发电驱动的 LED 灯\n- 了解合成生物学在环保领域的应用\n- 探讨可持续能源的未来\n\n## 适合人群\n\n对生物技术、环保能源感兴趣的中学生和公众。",
    imageAuthorization: true,
  },
  {
    category: "applications",
    subcategory: "合成生物学科普",
    title: "生物传感器——让检测变得简单",
    team: "ZJU-China iGEM 2024",
    subtitle: "用改造过的微生物快速检测水质",
    format: "实验室开放日",
    impact: "适合 15-25 人分组体验，90 分钟完成检测实验全流程",
    desc: "浙江大学 iGEM 团队开发的基于合成生物学的重金属离子生物传感器。本开放日活动让参与者亲手操作生物传感器检测模拟水样，了解工程菌株的设计逻辑和实际应用潜力。适合作为中小学科学课的拓展活动。",
    audience: "中学生 / 教师",
    delivery: "线下",
    duration: "90 分钟",
    location: "教学实验室",
    contact: "zju-china@zju.edu.cn",
    negotiator: "赵博士",
    acceptsOthers: "yes",
    reimbursement: "提供实验耗材",
    type: "campaign",
    status: "published",
    image: "/images/petri.jpg",
    materials: ["PPT", "演讲稿", "阅读材料", "实践建议", "项目介绍书"],
    campaignSteps: [
      { id: uid(), text: "准备生物传感器试纸条、模拟水样套装、实验指导手册", files: [] },
      { id: uid(), text: "培训 5 名助教，预实验 2 次确保检测效果稳定", files: [] },
      { id: uid(), text: "每组 3-5 人，完成采样→检测→读数→分析全流程", files: [] },
      { id: uid(), text: "汇总检测数据，生成活动产出报告，优化实验流程", files: [] },
    ],
    canParticipate: "yes",
    locationType: "venues",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-10-12",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "实验过程中请佩戴手套，注意实验安全规范",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 活动简介\n\n生物传感器是一种利用生物分子识别目标物质的检测装置。本开放日将带你体验如何用工程菌快速检测水质中的重金属离子。\n\n## 实验流程\n\n1. 采样：获取模拟水样\n2. 检测：使用生物传感器试纸条\n3. 读数：分析检测结果\n4. 讨论：了解传感器设计原理\n\n## 适合人群\n\n中学生和教师，无需实验经验。",
    imageAuthorization: true,
  },
  {
    category: "applications",
    subcategory: "其他",
    title: "合成生物学与可持续发展目标",
    team: "HP-Education 科普组",
    subtitle: "用工程生物学应对全球挑战",
    format: "主题展览",
    impact: "适合 100-200 人参观，可展出 1-3 天，含互动装置",
    desc: "本展览以联合国 17 个可持续发展目标（SDGs）为框架，展示合成生物学在医疗、能源、材料、农业和环境领域的创新应用。每块展板配有一个互动问题或小实验，适合校园科技节或公共科普活动。",
    audience: "公众 / 中小学生",
    delivery: "线下",
    duration: "1-3 天",
    location: "校园大厅 / 科技馆",
    contact: "edu@hp-alliance.cn",
    negotiator: "刘老师",
    acceptsOthers: "yes",
    reimbursement: "",
    type: "campaign",
    status: "published",
    image: "/images/classroom.jpg",
    materials: ["PPT", "阅读材料", "宣传材料", "文创", "现场照片"],
    campaignSteps: [
      { id: uid(), text: "设计 10 块展板内容（对应 10 个 SDGs），制作互动问答转盘", files: [] },
      { id: uid(), text: "培训 8 名讲解志愿者，布置展区动线和互动区域", files: [] },
      { id: uid(), text: "每日 3 场导览讲解，每场 20 分钟 + 自由参观 + 互动体验", files: [] },
      { id: uid(), text: "统计参观人次（目标 200+），收集签名留言，撰写展览总结", files: [] },
    ],
    canParticipate: "yes",
    locationType: "venues",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-11-01",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "展览含互动装置，请按志愿者引导有序参观",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 活动简介\n\n本展览以联合国可持续发展目标（SDGs）为框架，展示合成生物学如何助力解决全球性挑战。\n\n## 展区内容\n\n- **医疗健康**：合成生物学在疫苗研发、基因治疗中的应用\n- **清洁能源**：微生物燃料电池、生物燃料\n- **环境治理**：生物传感器、污水处理\n\n## 互动体验\n\n每块展板配有互动问题和小实验，寓教于乐。",
    imageAuthorization: true,
  },
  {
    category: "activities",
    subcategory: "互动游戏",
    title: "微生物作画——用细菌创作艺术",
    team: "Westlake iGEM Art Group",
    subtitle: "在培养皿中，用彩色菌落绘制一幅画",
    format: "艺术工作坊",
    impact: "适合 15-20 人，120 分钟，需无菌操作培训",
    desc: "将艺术与科学结合，利用表达不同色素的工程菌在琼脂平板上「绘制」图案。参与者首先了解微生物色素的基本原理，然后在无菌操作台中使用接种环「涂色」。培养 48 小时后，菌落生长形成独特的生物艺术作品。",
    audience: "大学生 / 艺术爱好者",
    delivery: "线下",
    duration: "120 分钟（不含培养）",
    location: "生物实验室",
    contact: "art@westlake-igem.cn",
    negotiator: "林同学",
    acceptsOthers: "yes",
    reimbursement: "提供培养基和菌株",
    type: "campaign",
    status: "published",
    image: "/images/petri.jpg",
    materials: ["材料清单", "场地条件", "活动流程", "现场照片", "安全说明", "满意度调查"],
    campaignSteps: [
      { id: uid(), text: "制备表达 RFP/YFP/CFP 的工程菌株，配制彩色琼脂平板", files: [] },
      { id: uid(), text: "编写安全操作指南，制作菌落艺术参考图集（10 个模板）", files: [] },
      { id: uid(), text: "无菌操作培训 20 分钟 → 自由创作 60 分钟 → 清理 20 分钟 → 拍照 20 分钟", files: [] },
      { id: uid(), text: "48 小时后拍摄菌落成品照片，线上展览投票，评选最佳作品", files: [] },
    ],
    canParticipate: "yes",
    locationType: "venues",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-09-25",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "实验涉及活体微生物，请严格遵守无菌操作规范",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 活动简介\n\n微生物作画是将生物技术与艺术创作相结合的创新工作坊。参与者使用彩色工程菌在培养皿上创作独特的生物艺术作品。\n\n## 工作坊流程\n\n1. **安全培训**（20分钟）：学习无菌操作规范\n2. **自由创作**（60分钟）：使用接种环在培养皿上作画\n3. **清理拍照**（40分钟）：清洁实验台、拍摄作品\n\n## 作品展示\n\n培养 48 小时后，菌落生长形成最终作品，将在线上进行展览和投票。",
    imageAuthorization: true,
  },
  {
    category: "activities",
    subcategory: "现场体验",
    title: "生物材料体验日——探索未来的可持续材料",
    team: "ZJU iGEM Biomaterial Team",
    subtitle: "用蘑菇根、细菌纤维和藻类制作可降解材料",
    format: "动手工作坊",
    impact: "适合 20-30 人，90 分钟，可带走自制材料样品",
    desc: "本工作坊展示三种生物材料：菌丝体砖块、细菌纤维素膜和藻类生物塑料。参与者可以触摸真实样品，并在指导下用简易配方制作小块生物材料。活动旨在让公众了解合成生物学如何推动材料科学向可持续方向发展。",
    audience: "公众 / 中学生",
    delivery: "线下",
    duration: "90 分钟",
    location: "活动中心 / 实验室",
    contact: "biomaterial@zju-igem.cn",
    negotiator: "吴博士",
    acceptsOthers: "yes",
    reimbursement: "",
    type: "campaign",
    status: "published",
    image: "/images/students.jpg",
    materials: ["材料清单", "场地条件", "活动流程", "安全说明", "现场照片"],
    campaignSteps: [
      { id: uid(), text: "制备菌丝体砖块、细菌纤维素膜、藻类生物塑料展示样品各 5 份", files: [] },
      { id: uid(), text: "准备 DIY 材料包 30 份（含海藻酸鈉、淀粉、甘油等）", files: [] },
      { id: uid(), text: "展示区 20 分钟 → 动手制作 50 分钟 → 样品展示与讨论 20 分钟", files: [] },
      { id: uid(), text: "收集参与者制作配方、拍摄作品照片、发布活动回顾推文", files: [] },
    ],
    canParticipate: "yes",
    locationType: "venues",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-10-18",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "制作过程中避免接触眼睛，使用甘油时请戴手套",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 活动简介\n\n生物材料是由生物体产生或以生物质为原料制成的可降解材料。本体验日将带你了解三种前沿生物材料。\n\n## 体验内容\n\n- **菌丝体砖块**：用蘑菇菌丝培育的建筑材料\n- **细菌纤维素膜**：由醋酸菌产生的高强度薄膜\n- **藻类生物塑料**：从海藻中提取的可降解塑料\n\n## 收获\n\n每位参与者可带走自制的生物材料样品。",
    imageAuthorization: true,
  },
  {
    category: "activities",
    subcategory: "互动游戏",
    title: "科学游园会——合成生物学嘉年华",
    team: "HP-Education 活动策划组",
    subtitle: "7 个互动摊位，让科学触手可及",
    format: "大型游园活动",
    impact: "适合 200-500 人，半日或全日活动，需 10+ 名志愿者",
    desc: "大型科普游园会，设置 7 个主题摊位：DNA 提取、微生物观察、生物传感器体验、基因编辑科普问答、合成生物学职业规划、生物艺术拍照打卡和可持续发展目标配对游戏。每个摊位完成挑战可获得印章，集齐可兑换文创纪念品。",
    audience: "公众 / 亲子家庭",
    delivery: "线下",
    duration: "半日（4 小时）",
    location: "校园广场 / 社区中心",
    contact: "event@hp-alliance.cn",
    negotiator: "周老师",
    acceptsOthers: "yes",
    reimbursement: "提供志愿者餐补和交通补贴",
    type: "campaign",
    status: "published",
    image: "/images/classroom.jpg",
    materials: ["材料清单", "场地条件", "活动流程", "现场照片", "安全说明", "满意度调查"],
    campaignSteps: [
      { id: uid(), text: "设计 7 个摊位内容与互动方案，采购耗材，制作印章卡和文创礼品", files: [] },
      { id: uid(), text: "招募 15 名志愿者（含 3 名后备），开展全流程彩排 1 次", files: [] },
      { id: uid(), text: "7 摊位同时运营，每个摊位 2 名志愿者，预计接待 300 人", files: [] },
      { id: uid(), text: "统计参与人数和印章完成率、回收反馈问卷、整理活动影像资料", files: [] },
    ],
    canParticipate: "yes",
    locationType: "outdoor",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-11-15",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "集齐 7 个摊位印章可兑换精美文创纪念品",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 活动简介\n\n科学游园会是一场大型合成生物学主题嘉年华，通过 7 个互动摊位让科学变得触手可及。\n\n## 摊位设置\n\n1. DNA 提取实验室\n2. 微生物显微观察\n3. 生物传感器体验\n4. 基因编辑知识问答\n5. 合成生物学职业规划\n6. 生物艺术拍照打卡\n7. SDG 配对游戏\n\n## 参与方式\n\n每位参与者领取一张印章卡，完成摊位挑战即可获得印章，集齐 7 枚可兑换文创礼品。",
    imageAuthorization: true,
  },
  {
    category: "cooperation",
    title: "2025 暑期合成生物学支教计划",
    team: "HP-Education 支教合作组",
    subtitle: "把合成生物学带到乡村中学",
    format: "支教项目",
    impact: "覆盖 3 所乡村中学，每校 2 天课程，约 200 名学生受益",
    desc: "与浙江省 3 所乡村中学合作开展暑期合成生物学支教活动。课程内容包括：DNA 与遗传基础（第 1 天）、微生物观察实验（第 2 天）。每校配备 4 名志愿者讲师和 2 名助教，实验器材由联盟统一配送。",
    audience: "乡村中学生",
    delivery: "线下",
    duration: "每校 2 天",
    location: "衢州、丽水、温州乡村中学",
    contact: "volunteer@hp-alliance.cn",
    negotiator: "孙老师",
    acceptsOthers: "yes",
    reimbursement: "提供住宿和交通补贴",
    type: "campaign",
    status: "published",
    image: "/images/classroom.jpg",
    materials: ["合作学校", "支教队伍", "课程包", "反馈记录", "覆盖人数", "后续计划"],
    campaignSteps: [
      { id: uid(), text: "对接 3 所合作学校确认时间与场地，招募 12 名志愿者讲师", files: [] },
      { id: uid(), text: "编写适配乡村中学的课程讲义（2 天 x 6 课时），准备实验器材便携箱", files: [] },
      { id: uid(), text: "每校 2 天：第 1 天 DNA 理论 + 粗提取实验，第 2 天微生物观察 + 结业展示", files: [] },
      { id: uid(), text: "收集学生反馈与教师评价，统计覆盖人数（目标 200 人），制定下学期跟进计划", files: [] },
    ],
    canParticipate: "yes",
    locationType: "venues",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "衢州市",
    eventDate: "2025-07-15",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "乡村学校实验条件有限，请提前准备便携式实验器材",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 项目简介\n\n本支教计划将合成生物学课程带到浙江省 3 所乡村中学，让乡村学生也能接触前沿生物技术。\n\n## 课程安排\n\n- **第 1 天**：DNA 与遗传基础理论 + DNA 粗提取实验\n- **第 2 天**：微生物观察实验 + 结业展示\n\n## 合作模式\n\n联盟统一配送实验器材，每校配备 4 名志愿者讲师和 2 名助教。\n\n## 预期成果\n\n覆盖 3 所学校，约 200 名乡村中学生受益。",
    imageAuthorization: true,
  },
  {
    category: "cooperation",
    title: "课程包共建计划——合成生物学模块化教案",
    team: "HP-Education 课程开发组",
    subtitle: "与一线教师共建标准化的合成生物学教案",
    format: "课程开发合作",
    impact: "产出 5 个模块化教案，供全国合作学校免费使用",
    desc: "邀请高中生物教师和大学合成生物学研究者共同开发标准化课程包。每个课程包包含：教案、PPT、实验指导、评估工具和拓展阅读。采用「研究—编写—试讲—修订」四阶段流程，确保内容科学性和教学可操作性。",
    audience: "高中教师 / 教育工作者",
    delivery: "线上+线下",
    duration: "3 个月（开发周期）",
    location: "线上协作 + 线下工作坊",
    contact: "curriculum@hp-alliance.cn",
    negotiator: "钱老师",
    acceptsOthers: "yes",
    reimbursement: "提供教师稿酬和教材印刷费",
    type: "campaign",
    status: "published",
    image: "/images/lab-team.jpg",
    materials: ["合作学校", "支教队伍", "课程包", "反馈记录", "覆盖人数", "后续计划"],
    campaignSteps: [
      { id: uid(), text: "组建 10 人编写组（5 名教师 + 5 名研究员），确定 5 个课程主题", files: [] },
      { id: uid(), text: "分模块编写教案初稿，组织线上审稿会 3 轮", files: [] },
      { id: uid(), text: "在 2 所合作高中试讲各模块，收集课堂反馈和修改意见", files: [] },
      { id: uid(), text: "修订定稿后上线开放下载，组织 1 次全国教师线上培训（目标 100 人参与）", files: [] },
    ],
    canParticipate: "yes",
    locationType: "online",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-09-01",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "欢迎一线教师通过邮件报名参与编写工作",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 项目简介\n\n本计划旨在联合高中教师和大学研究者，共同开发标准化的合成生物学教学资源。\n\n## 课程包内容\n\n每个模块化课程包包含：\n- 教案（含教学目标、课时安排）\n- PPT 课件\n- 实验指导手册\n- 评估工具\n- 拓展阅读材料\n\n## 开发流程\n\n1. 研究：调研现有课程资源\n2. 编写：分模块编写初稿\n3. 试讲：在合作学校试点\n4. 修订：根据反馈完善定稿",
    imageAuthorization: true,
  },
  {
    category: "cooperation",
    title: "公众科学素养调研——合成生物学认知度调查",
    team: "HP-Education 评估组",
    subtitle: "用数据了解公众对合成生物学的认知与态度",
    format: "社会调研",
    impact: "回收有效问卷 1000+ 份，产出调研报告供联盟决策参考",
    desc: "面向不同年龄段和背景的公众开展合成生物学认知度问卷调查。问卷涵盖：基本认知（是否听说过合成生物学）、态度（支持/担忧）、信息来源（学校/媒体/社交网络）和教育需求（希望了解哪些方面）。调研结果将用于指导联盟后续科普策略。",
    audience: "公众",
    delivery: "线上+线下",
    duration: "2 个月",
    location: "线上问卷 + 线下拦截访问",
    contact: "research@hp-alliance.cn",
    negotiator: "杨博士",
    acceptsOthers: "yes",
    reimbursement: "",
    type: "campaign",
    status: "published",
    image: "/images/students.jpg",
    materials: ["反馈记录", "覆盖人数", "后续计划"],
    campaignSteps: [
      { id: uid(), text: "设计调查问卷（20 题，含人口统计学变量），在 3 个城市进行预调查", files: [] },
      { id: uid(), text: "线上通过社群/校园渠道发放，线下在科技馆/商场设点拦截访问", files: [] },
      { id: uid(), text: "回收问卷 1000+ 份，使用 SPSS 进行描述统计和交叉分析", files: [] },
      { id: uid(), text: "撰写调研报告，在联盟年度会议上汇报，发布公众版摘要", files: [] },
    ],
    canParticipate: "yes",
    locationType: "online",
    locationCountry: "中国",
    locationProvince: "浙江省",
    locationCity: "杭州市",
    eventDate: "2025-09-10",
    timeLimitType: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    tips: "问卷约 10 分钟，填写完成后可查看调研摘要",
    sitePhotosFormat: "",
    sitePhotoIds: "",
    introductionContent: "## 项目简介\n\n本调研旨在了解中国公众对合成生物学的认知水平、态度倾向和教育需求。\n\n## 调研维度\n\n- **基本认知**：是否听说过合成生物学\n- **态度倾向**：支持、担忧或中立\n- **信息来源**：学校、媒体、社交网络\n- **教育需求**：希望了解哪些方面\n\n## 调研方法\n\n线上问卷 + 线下拦截访问，目标回收有效问卷 1000+ 份。",
    imageAuthorization: true,
  },
]

async function waitForBackend(maxRetries = 30, delayMs = 2000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${API_URL}/api/resources`, { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        console.log("后端已就绪")
        return
      }
    } catch { /* retry */ }
    console.log(`等待后端启动... (${i + 1}/${maxRetries})`)
    await new Promise(r => setTimeout(r, delayMs))
  }
  throw new Error("后端启动超时，请确认后端服务正在运行")
}

async function loginAsAdmin(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@igem-education.com", password: "devAdmin123!" }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`管理员登录失败: ${body.message || res.status}`)
  }
  const data: any = await res.json()
  console.log(`管理员登录成功: ${data.user.name}`)
  return data.token
}

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    applications: "项目应用科普",
    activities: "缤纷开放活动",
    cooperation: "教育合作",
    about: "关于联盟",
  }
  return map[cat] || cat
}

async function seedResources(token: string): Promise<void> {
  console.log(`\n开始录入 ${sampleResources.length} 个示例项目...\n`)

  let success = 0
  let failed = 0

  for (const resData of sampleResources) {
    try {
      const res = await fetch(`${API_URL}/api/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(resData),
      })

      const body: any = await res.json()

      if (res.ok) {
        console.log(`\u2713 [${formatCategory(resData.category)}] ${resData.title}`)
        success++
      } else {
        console.error(`\u2717 [${formatCategory(resData.category)}] ${resData.title} \u2014 ${body.message || res.status}`)
        failed++
      }
    } catch (err: any) {
      console.error(`\u2717 [${formatCategory(resData.category)}] ${resData.title} \u2014 ${err.message}`)
      failed++
    }
  }

  console.log(`\n录入完毕：成功 ${success} 个，失败 ${failed} 个`)
  if (failed > 0) process.exit(1)
}

async function deleteAllResources(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/resources`, {
    headers: { "Authorization": `Bearer ${token}` },
  })
  if (!res.ok) return
  const data: any = await res.json()
  const resources = data.resources || []
  if (resources.length === 0) {
    console.log("没有现有项目需要清除")
    return
  }

  console.log(`检测到 ${resources.length} 个现有项目，正在清除...`)
  let deleted = 0
  for (const r of resources) {
    const delRes = await fetch(`${API_URL}/api/resources/${r.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    })
    if (delRes.ok) deleted++
  }
  console.log(`已清除 ${deleted} 个现有项目`)
}

// ========== 管理员账号创建（直接操作数据库） ==========
async function seedAdmin() {
  const mainDs = createMainDataSource(false)

  await mainDs.initialize()

  const userRepo = mainDs.getRepository(User)
  const existing = await userRepo.findOneBy({ email: "admin@igem-education.com" })
  if (existing) {
    if (!existing.registrantName) {
      existing.registrantName = "Admin"
      existing.name = "管理员"
      await userRepo.save(existing)
      console.log("管理员账号已更新（registrantName）")
    } else {
      console.log("管理员账号已存在")
    }
  } else {
    const admin = userRepo.create({
      email: "admin@igem-education.com",
      password: "devAdmin123!",
      name: "管理员",
      registrantName: "Admin",
      role: "admin",
    })
    await userRepo.save(admin)
    console.log("管理员账号创建成功: admin@igem-education.com / devAdmin123!")
  }

  const testUsers = [
    { email: "team1@test.com", password: "devTestPass!", name: "San Zhang" },
    { email: "team2@test.com", password: "devTestPass!", name: "Si Li" },
  ]
  for (const u of testUsers) {
    const exist = await userRepo.findOneBy({ email: u.email })
    if (!exist) {
      await userRepo.save(userRepo.create({ ...u, registrantName: "Test User" }))
      console.log(`测试账号创建成功: ${u.email} / ${u.password}`)
    } else {
      if (!exist.registrantName) {
        exist.registrantName = "Test User"
        await userRepo.save(exist)
        console.log(`测试账号已更新（registrantName）: ${u.email}`)
      } else {
        console.log(`测试账号已存在: ${u.email}`)
      }
    }
  }

  await mainDs.destroy()
}

// ========== 示例数据录入（通过 HTTP API） ==========

async function main() {
  await seedAdmin()
  console.log("")
  console.log(`连接后端: ${API_URL}`)
  await waitForBackend()
  const token = await loginAsAdmin()

  await deleteAllResources(token)
  console.log("")
  await seedResources(token)
}

main().catch((err) => {
  console.error("Seed-data 失败:", err.message)
  process.exit(1)
})
