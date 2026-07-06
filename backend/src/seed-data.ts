import "reflect-metadata"
import dotenv from "dotenv"
import path from "path"
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const API_URL = process.env.API_URL || "http://localhost:3000"

interface CampaignStep {
  id: string
  text: string
  files: { fileId: string; name: string }[]
}

interface SeedResource {
  title: string
  category: string
  team: string
  desc: string
  type: string
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
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9)

const sampleResources: SeedResource[] = [

  {
    category: "synbio",
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
    image: "/images/microscope.jpg",
    materials: ["PPT", "演讲稿", "阅读材料", "满意度调查", "实践建议"],
    campaignSteps: [
      { id: uid(), text: "准备 PPT 课件（30 页）、微生物标本玻片、便携显微镜 10 台", files: [] },
      { id: uid(), text: "讲师试讲 2 次，助教培训 1 次，确保实验环节安全可控", files: [] },
      { id: uid(), text: "现场执行：45 分钟讲解 → 10 分钟提问 → 20 分钟显微镜观察", files: [] },
      { id: uid(), text: "收集学生反馈问卷，统计满意度，撰写课程总结报告", files: [] },
    ],
  },
  {
    category: "synbio",
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
    image: "/images/students.jpg",
    materials: ["PPT", "演讲稿", "阅读材料", "宣传材料", "文创"],
    campaignSteps: [
      { id: uid(), text: "设计 DNA 纸模模板（3 种难度），采购纸张与打印耗材", files: [] },
      { id: uid(), text: "录制原理讲解视频（8 分钟），制作活动引导手册", files: [] },
      { id: uid(), text: "分两组开展：原理讲解 30 分钟 → 动手搭建 50 分钟 → 展示分享 10 分钟", files: [] },
      { id: uid(), text: "拍摄活动照片、收集反馈问卷，整理成活动案例存档", files: [] },
    ],
  },
  {
    category: "synbio",
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
    image: "/images/lab-team.jpg",
    materials: ["PPT", "演讲稿", "阅读材料", "满意度调查", "成果测量表", "实践建议"],
    campaignSteps: [
      { id: uid(), text: "制作 40 页科普 PPT，准备 3 个伦理讨论案例素材", files: [] },
      { id: uid(), text: "邀请 2 位生物伦理学家参与圆桌环节，确认议程", files: [] },
      { id: uid(), text: "讲座与圆桌衔接流畅，预留充足问答时间，线上同步直播", files: [] },
      { id: uid(), text: "发布活动新闻稿，收集线上+线下反馈数据，形成评估报告", files: [] },
    ],
  },
  {
    category: "applications",
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
    image: "/images/lab-work.jpg",
    materials: ["PPT", "演讲稿", "宣传材料", "文创", "实践建议"],
    campaignSteps: [
      { id: uid(), text: "搭建微生物燃料电池演示装置，制备细菌培养液", files: [] },
      { id: uid(), text: "设计 A3 海报 3 张、项目介绍折页 200 份", files: [] },
      { id: uid(), text: "分 3 轮展示：每轮 30 分钟讲解 + 15 分钟互动问答 + 15 分钟演示", files: [] },
      { id: uid(), text: "统计参观人数，收集留言与反馈，整理媒体报道素材", files: [] },
    ],
  },
  {
    category: "applications",
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
    image: "/images/petri.jpg",
    materials: ["PPT", "演讲稿", "阅读材料", "实践建议", "项目介绍书"],
    campaignSteps: [
      { id: uid(), text: "准备生物传感器试纸条、模拟水样套装、实验指导手册", files: [] },
      { id: uid(), text: "培训 5 名助教，预实验 2 次确保检测效果稳定", files: [] },
      { id: uid(), text: "每组 3-5 人，完成采样→检测→读数→分析全流程", files: [] },
      { id: uid(), text: "汇总检测数据，生成活动产出报告，优化实验流程", files: [] },
    ],
  },
  {
    category: "applications",
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
    image: "/images/classroom.jpg",
    materials: ["PPT", "阅读材料", "宣传材料", "文创", "现场照片"],
    campaignSteps: [
      { id: uid(), text: "设计 10 块展板内容（对应 10 个 SDGs），制作互动问答转盘", files: [] },
      { id: uid(), text: "培训 8 名讲解志愿者，布置展区动线和互动区域", files: [] },
      { id: uid(), text: "每日 3 场导览讲解，每场 20 分钟 + 自由参观 + 互动体验", files: [] },
      { id: uid(), text: "统计参观人次（目标 200+），收集签名留言，撰写展览总结", files: [] },
    ],
  },
  {
    category: "activities",
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
    image: "/images/petri.jpg",
    materials: ["材料清单", "场地条件", "活动流程", "现场照片", "安全说明", "满意度调查"],
    campaignSteps: [
      { id: uid(), text: "制备表达 RFP/YFP/CFP 的工程菌株，配制彩色琼脂平板", files: [] },
      { id: uid(), text: "编写安全操作指南，制作菌落艺术参考图集（10 个模板）", files: [] },
      { id: uid(), text: "无菌操作培训 20 分钟 → 自由创作 60 分钟 → 清理 20 分钟 → 拍照 20 分钟", files: [] },
      { id: uid(), text: "48 小时后拍摄菌落成品照片，线上展览投票，评选最佳作品", files: [] },
    ],
  },
  {
    category: "activities",
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
    image: "/images/students.jpg",
    materials: ["材料清单", "场地条件", "活动流程", "安全说明", "现场照片"],
    campaignSteps: [
      { id: uid(), text: "制备菌丝体砖块、细菌纤维素膜、藻类生物塑料展示样品各 5 份", files: [] },
      { id: uid(), text: "准备 DIY 材料包 30 份（含海藻酸鈉、淀粉、甘油等）", files: [] },
      { id: uid(), text: "展示区 20 分钟 → 动手制作 50 分钟 → 样品展示与讨论 20 分钟", files: [] },
      { id: uid(), text: "收集参与者制作配方、拍摄作品照片、发布活动回顾推文", files: [] },
    ],
  },
  {
    category: "activities",
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
    image: "/images/classroom.jpg",
    materials: ["材料清单", "场地条件", "活动流程", "现场照片", "安全说明", "满意度调查"],
    campaignSteps: [
      { id: uid(), text: "设计 7 个摊位内容与互动方案，采购耗材，制作印章卡和文创礼品", files: [] },
      { id: uid(), text: "招募 15 名志愿者（含 3 名后备），开展全流程彩排 1 次", files: [] },
      { id: uid(), text: "7 摊位同时运营，每个摊位 2 名志愿者，预计接待 300 人", files: [] },
      { id: uid(), text: "统计参与人数和印章完成率、回收反馈问卷、整理活动影像资料", files: [] },
    ],
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
    image: "/images/classroom.jpg",
    materials: ["合作学校", "支教队伍", "课程包", "反馈记录", "覆盖人数", "后续计划"],
    campaignSteps: [
      { id: uid(), text: "对接 3 所合作学校确认时间与场地，招募 12 名志愿者讲师", files: [] },
      { id: uid(), text: "编写适配乡村中学的课程讲义（2 天 x 6 课时），准备实验器材便携箱", files: [] },
      { id: uid(), text: "每校 2 天：第 1 天 DNA 理论 + 粗提取实验，第 2 天微生物观察 + 结业展示", files: [] },
      { id: uid(), text: "收集学生反馈与教师评价，统计覆盖人数（目标 200 人），制定下学期跟进计划", files: [] },
    ],
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
    image: "/images/lab-team.jpg",
    materials: ["合作学校", "支教队伍", "课程包", "反馈记录", "覆盖人数", "后续计划"],
    campaignSteps: [
      { id: uid(), text: "组建 10 人编写组（5 名教师 + 5 名研究员），确定 5 个课程主题", files: [] },
      { id: uid(), text: "分模块编写教案初稿，组织线上审稿会 3 轮", files: [] },
      { id: uid(), text: "在 2 所合作高中试讲各模块，收集课堂反馈和修改意见", files: [] },
      { id: uid(), text: "修订定稿后上线开放下载，组织 1 次全国教师线上培训（目标 100 人参与）", files: [] },
    ],
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
    image: "/images/students.jpg",
    materials: ["反馈记录", "覆盖人数", "后续计划"],
    campaignSteps: [
      { id: uid(), text: "设计调查问卷（20 题，含人口统计学变量），在 3 个城市进行预调查", files: [] },
      { id: uid(), text: "线上通过社群/校园渠道发放，线下在科技馆/商场设点拦截访问", files: [] },
      { id: uid(), text: "回收问卷 1000+ 份，使用 SPSS 进行描述统计和交叉分析", files: [] },
      { id: uid(), text: "撰写调研报告，在联盟年度会议上汇报，发布公众版摘要", files: [] },
    ],
  },
  {
    category: "about",
    title: "HP-Education 联盟 2025 年度成果展",
    team: "HP-Education 运营组",
    subtitle: "回顾联盟一年的教育足迹",
    format: "线上展览 + 线下发布会",
    impact: "线下 80 人参与，线上展厅长期开放，预计覆盖 5000+ 人",
    desc: "年度成果展汇总联盟一年来在合成生物学教育领域的工作成果。包含数据看板（活动场次、覆盖人数、合作学校数量）、优秀案例展示、志愿者风采和来年计划。线下同步举办发布会，邀请合作单位代表分享经验。",
    audience: "联盟成员 / 合作单位 / 公众",
    delivery: "线上+线下",
    duration: "线上长期 / 线下 3 小时",
    location: "西溪报告厅 + 线上展厅",
    contact: "alliance@hp-alliance.cn",
    negotiator: "黄老师",
    acceptsOthers: "yes",
    reimbursement: "",
    type: "campaign",
    image: "/images/alliance.jpg",
    materials: ["参与队伍", "分工", "运行模式", "企业赞助", "联系方式", "年度成果"],
    campaignSteps: [
      { id: uid(), text: "收集整理全年活动数据、照片和案例，设计年度报告（40 页）", files: [] },
      { id: uid(), text: "搭建线上展厅（网页），筹备线下发布会场地与议程", files: [] },
      { id: uid(), text: "线下发布会：联盟工作总结 -> 合作单位分享 -> 优秀志愿者表彰 -> 圆桌交流", files: [] },
      { id: uid(), text: "发布年度报告线上版，统计数据传播量（公众号推文 + 展厅访问量）", files: [] },
    ],
  },
  {
    category: "about",
    title: "联盟志愿者招募与培训体系",
    team: "HP-Education 人力组",
    subtitle: "构建可持续的科普志愿者生态",
    format: "招募 + 培训项目",
    impact: "全年招募 50+ 名志愿者，完成 4 期培训，每期 10-15 人",
    desc: "建立标准化的志愿者招募和培训体系。每学期初开放报名，筛选后参加为期 2 天的集中培训（含合成生物学基础、科普表达技巧、实验安全规范）。培训合格后颁发联盟认证证书，并根据兴趣和能力分配至各活动组。",
    audience: "在校大学生 / 研究生",
    delivery: "线上+线下",
    duration: "每期 2 天培训",
    location: "西湖大学 + 线上",
    contact: "hr@hp-alliance.cn",
    negotiator: "马同学",
    acceptsOthers: "yes",
    reimbursement: "",
    type: "campaign",
    image: "/images/lab-team.jpg",
    materials: ["参与队伍", "分工", "联系方式"],
    campaignSteps: [
      { id: uid(), text: "设计招募海报与推文，通过高校渠道发布招募信息（目标报名 100+ 人）", files: [] },
      { id: uid(), text: "简历筛选 -> 线上面试 -> 录取通知，制定 2 天培训课程表", files: [] },
      { id: uid(), text: "第 1 天：合成生物学基础 + 科普表达技巧；第 2 天：实验操作 + 安全考核", files: [] },
      { id: uid(), text: "颁发证书、分配至各活动组、建立志愿者档案和沟通群组", files: [] },
    ],
  },
  {
    category: "about",
    title: "走进联盟——合成生物学教育开放日",
    team: "西湖大学 iGEM 团队",
    subtitle: "开放实验室，展示 iGEM 团队的教育实践",
    format: "开放参观日",
    impact: "单场容纳 60 人，全年举办 4 场，预计接待 240 人",
    desc: "面向社会公众开放西湖大学 iGEM 实验室，介绍联盟的运作模式和 iGEM 竞赛中的教育实践（Human Practices）。参观路线含：联盟成果走廊 -> 实验室参观 -> 互动实验体验 -> 茶歇交流。每场由 2 名团队成员担任导览。",
    audience: "公众 / 中学生 / 企业代表",
    delivery: "线下",
    duration: "2 小时",
    location: "西湖大学 iGEM 实验室",
    contact: "visit@westlake-igem.cn",
    negotiator: "徐同学",
    acceptsOthers: "yes",
    reimbursement: "",
    type: "campaign",
    image: "/images/classroom.jpg",
    materials: ["参与队伍", "分工", "运行模式", "企业赞助", "联系方式", "年度成果"],
    campaignSteps: [
      { id: uid(), text: "规划参观路线，设计成果走廊展板（15 块），准备互动实验材料", files: [] },
      { id: uid(), text: "培训 4 名导览志愿者（含中英双语），彩排 1 次", files: [] },
      { id: uid(), text: "每场 30 分钟导览 + 40 分钟互动实验 + 30 分钟茶歇交流 + 20 分钟答疑", files: [] },
      { id: uid(), text: "收集参观者反馈，整理媒体宣传素材，规划下一场开放日排期", files: [] },
    ],
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
    synbio: "合成生物学科普",
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
  if (resources.length === 0) return

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

async function main() {
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
