import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  Handshake,
  Images,
  LayoutDashboard,
  LogIn,
  LogOut,
  Microscope,
  Monitor,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Upload,
  Users
} from "lucide-react";
import { authApi } from "./api.js";
import "./styles.css";

const imageAssets = {
  students: "/images/students.jpg",
  petri: "/images/petri.jpg",
  classroom: "/images/classroom.jpg",
  microscope: "/images/microscope.jpg",
  labTeam: "/images/lab-team.jpg",
  labWork: "/images/lab-work.jpg",
  alliance: "/images/alliance.jpg"
};

const categories = [
  {
    id: "synbio",
    path: "/synbio",
    name: "合成生物学科普",
    short: "SynBio",
    icon: Microscope,
    intro: "用工程化语言解释 DNA、细胞工厂、生物设计与安全伦理，帮助学生建立入门框架。",
    accent: "#1a9b78",
    image: imageAssets.microscope,
    recommended: ["PPT", "演讲稿", "阅读材料", "满意度调查", "成果测量表", "实践建议"]
  },
  {
    id: "applications",
    path: "/applications",
    name: "项目应用科普",
    short: "Projects",
    icon: FlaskConical,
    intro: "把西湖大学、浙江大学和合作团队的项目转译成公众能理解的应用故事。",
    accent: "#2776b8",
    image: imageAssets.labWork,
    recommended: ["PPT", "演讲稿", "阅读材料", "宣传材料", "文创", "实践建议"]
  },
  {
    id: "activities",
    path: "/activities",
    name: "缤纷开放活动",
    short: "Events",
    icon: Sparkles,
    intro: "沉淀微生物作画、生物材料体验、开放工作坊等互动式教育活动方案。",
    accent: "#d69b18",
    image: imageAssets.petri,
    recommended: ["材料清单", "场地条件", "活动流程", "现场照片", "安全说明", "满意度调查"]
  },
  {
    id: "cooperation",
    path: "/cooperation",
    name: "教育合作",
    short: "Partners",
    icon: Handshake,
    intro: "记录支教队伍、合作学校、公益教育场景和课程包共建进度。",
    accent: "#31a6b2",
    image: imageAssets.classroom,
    recommended: ["合作学校", "支教队伍", "课程包", "反馈记录", "覆盖人数", "后续计划"]
  },
  {
    id: "about",
    path: "/about",
    name: "关于联盟",
    short: "Alliance",
    icon: Building2,
    intro: "展示联盟构成、团队分工、运行模式、赞助入口与年度教育成果。",
    accent: "#5c6bc0",
    image: imageAssets.alliance,
    recommended: ["参与队伍", "分工", "运行模式", "企业赞助", "联系方式", "年度成果"]
  }
];

const materialTypes = ["项目介绍书", "项目合作书", "实践建议", "现场照片", "项目 example"];

const participationOptions = [
  { value: "yes", label: "是" },
  { value: "no", label: "否" }
];

const deliveryOptions = ["线上", "线下", "都可"];
const audienceOptions = ["小学", "初中", "高中", "大学", "社会公众", "老年人", "通用"];

const starterResources = [
  {
    id: 1,
    category: "synbio",
    team: "HP-Education 联盟",
    title: "合成生物学是什么？",
    audience: "中学生 / 公众",
    desc: "用工程化设计、细胞工厂和生物安全三个关键词建立入门认知。",
    materials: ["PPT", "演讲稿", "满意度调查"],
    updatedAt: "2026-06-02"
  },
  {
    id: 7,
    category: "synbio",
    team: "Westlake Education Group",
    title: "细胞工厂一小时入门课",
    audience: "初高中生",
    desc: "用积木和生产线类比解释启动子、表达元件和工程化设计思路。",
    materials: ["PPT", "阅读材料", "成果测量表", "实践建议"],
    updatedAt: "2026-05-29"
  },
  {
    id: 8,
    category: "synbio",
    team: "ZJU iGEM",
    title: "生物安全与伦理讨论课",
    audience: "高中社团",
    desc: "通过情景卡片讨论基因编辑、环境释放和公众沟通中的边界。",
    materials: ["演讲稿", "阅读材料", "满意度调查"],
    updatedAt: "2026-05-26"
  },
  {
    id: 2,
    category: "applications",
    team: "Westlake iGEM",
    title: "仿生软骨项目科普",
    audience: "高中生",
    desc: "从材料科学、生物医学和合成生物学交叉角度介绍项目应用。",
    materials: ["PPT", "阅读材料", "实践建议"],
    updatedAt: "2026-06-01"
  },
  {
    id: 3,
    category: "applications",
    team: "ZJU iGEM",
    title: "AI 香水应用介绍",
    audience: "公众",
    desc: "展示 AI 与生物制造如何参与气味设计和产品想象。",
    materials: ["宣传材料", "满意度调查"],
    updatedAt: "2026-05-30"
  },
  {
    id: 9,
    category: "applications",
    team: "HP-Education 联盟",
    title: "合成生物学与气味设计展台",
    audience: "展会公众",
    desc: "用嗅觉体验、流程海报和问答卡片说明从分子到产品的设计路径。",
    materials: ["宣传材料", "文创", "现场照片", "满意度调查"],
    updatedAt: "2026-05-28"
  },
  {
    id: 4,
    category: "activities",
    team: "HP-Education 联盟",
    title: "微生物作画开放活动",
    audience: "校园公众",
    desc: "通过安全材料和可视化作品建立对微生物的直观理解。",
    materials: ["材料清单", "场地条件", "现场照片"],
    updatedAt: "2026-05-27"
  },
  {
    id: 10,
    category: "activities",
    team: "ZJU iGEM",
    title: "DNA 手链与碱基配对工作坊",
    audience: "亲子家庭",
    desc: "用珠子颜色对应碱基，带领参与者完成可带走的 DNA 结构文创。",
    materials: ["材料清单", "活动流程", "文创", "现场照片"],
    updatedAt: "2026-05-25"
  },
  {
    id: 11,
    category: "activities",
    team: "Westlake iGEM",
    title: "会发光的生物材料体验",
    audience: "校园开放日",
    desc: "以低风险可视化材料展示生物材料的设计思路和安全注意事项。",
    materials: ["场地条件", "安全说明", "实践建议", "满意度调查"],
    updatedAt: "2026-05-22"
  },
  {
    id: 5,
    category: "cooperation",
    team: "支教合作组",
    title: "温州文岚书院合作计划",
    audience: "中学生",
    desc: "与支教队伍共建可落地的合成生物学教育课程包。",
    materials: ["阅读材料", "实践建议", "成果测量表"],
    updatedAt: "2026-05-24"
  },
  {
    id: 12,
    category: "cooperation",
    team: "支教合作组",
    title: "山区学校科普课程包",
    audience: "初中生",
    desc: "为支教队伍准备无需复杂仪器的生物工程启蒙课程和反馈表。",
    materials: ["课程包", "阅读材料", "反馈记录", "覆盖人数"],
    updatedAt: "2026-05-20"
  },
  {
    id: 13,
    category: "cooperation",
    team: "HP-Education 联盟",
    title: "教师共备工作坊",
    audience: "科学教师",
    desc: "与合作学校教师共备 45 分钟课程，统一安全边界和学生任务单。",
    materials: ["合作学校", "课程包", "后续计划", "反馈记录"],
    updatedAt: "2026-05-18"
  },
  {
    id: 6,
    category: "about",
    team: "西湖大学 × 浙江大学",
    title: "联盟构成与运行模式",
    audience: "合作团队",
    desc: "展示参与团队分工、材料共建流程和企业赞助入口。",
    materials: ["宣传材料"],
    updatedAt: "2026-05-21"
  },
  {
    id: 14,
    category: "about",
    team: "联盟运营组",
    title: "企业赞助与文创支持方案",
    audience: "潜在赞助方",
    desc: "说明小额赞助如何支持网站维护、活动材料和教育文创制作。",
    materials: ["宣传材料", "企业赞助", "联系方式"],
    updatedAt: "2026-05-17"
  },
  {
    id: 15,
    category: "about",
    team: "西湖大学 × 浙江大学",
    title: "年度教育成果展示",
    audience: "合作团队 / 评审",
    desc: "用数据、现场照片和代表案例展示联盟的教育影响力。",
    materials: ["年度成果", "现场照片", "覆盖人数"],
    updatedAt: "2026-05-15"
  }
];

const campaignCases = [
  { category: "synbio", title: "SynBio Starter Day", subtitle: "从 DNA 到细胞工厂", image: imageAssets.microscope, format: "90 分钟入门课", impact: "适合 40-80 人课堂", materials: ["概念讲解", "小组问答", "课后测量"] },
  { category: "synbio", title: "BioSafety Cards", subtitle: "生物安全情景讨论", image: imageAssets.students, format: "桌面讨论活动", impact: "形成可复用讨论卡", materials: ["伦理案例", "角色卡", "反馈表"] },
  { category: "synbio", title: "Build-a-Cell Workshop", subtitle: "搭建一个细胞工厂", image: imageAssets.labTeam, format: "互动工作坊", impact: "适合科学社团", materials: ["元件卡", "流程图", "成果测量"] },
  { category: "applications", title: "BioCartilage Story", subtitle: "仿生软骨项目路演", image: imageAssets.labWork, format: "项目科普展台", impact: "连接医学与材料", materials: ["项目海报", "演示讲稿", "受众问卷"] },
  { category: "applications", title: "AI Perfume Lab", subtitle: "AI 与气味设计", image: imageAssets.petri, format: "公众体验展", impact: "适合展会空间", materials: ["体验卡", "文创", "宣传折页"] },
  { category: "applications", title: "Future BioProducts", subtitle: "生物制造产品想象", image: imageAssets.classroom, format: "创意设计课", impact: "产出学生方案", materials: ["案例包", "设计纸", "展示模板"] },
  { category: "activities", title: "Agar Art Open Lab", subtitle: "微生物作画开放活动", image: imageAssets.petri, format: "开放日体验", impact: "强视觉传播", materials: ["材料清单", "安全说明", "照片记录"] },
  { category: "activities", title: "DNA Bracelet Bar", subtitle: "碱基配对文创摊位", image: imageAssets.classroom, format: "流动摊位", impact: "低成本高参与", materials: ["珠子包", "讲解卡", "现场反馈"] },
  { category: "activities", title: "BioMaterial Touch Table", subtitle: "生物材料触摸展", image: imageAssets.labTeam, format: "互动展示", impact: "适合校园展会", materials: ["样品说明", "场地条件", "引导话术"] },
  { category: "cooperation", title: "Rural SynBio Kit", subtitle: "支教课程包", image: imageAssets.students, format: "4 课时课程", impact: "无复杂仪器", materials: ["教师手册", "学生任务单", "反馈量表"] },
  { category: "cooperation", title: "Teacher Co-design", subtitle: "科学教师共备", image: imageAssets.classroom, format: "线上+线下共备", impact: "提升落地稳定性", materials: ["共备模板", "安全边界", "复盘表"] },
  { category: "cooperation", title: "Campus Outreach Week", subtitle: "合作学校科普周", image: imageAssets.microscope, format: "一周活动包", impact: "覆盖多个班级", materials: ["排期表", "活动物料", "测量工具"] },
  { category: "about", title: "Alliance Launch Kit", subtitle: "联盟介绍与招募包", image: imageAssets.alliance, format: "对外介绍页", impact: "适合拉新合作", materials: ["联盟简介", "分工说明", "联系方式"] },
  { category: "about", title: "Sponsor Micro-grant", subtitle: "小额赞助与文创支持", image: imageAssets.labWork, format: "赞助说明方案", impact: "支持网站与物料", materials: ["预算表", "权益说明", "赞助入口"] },
  { category: "about", title: "Education Impact Report", subtitle: "年度教育成果报告", image: imageAssets.students, format: "成果展示", impact: "面向评审与伙伴", materials: ["数据看板", "现场照片", "案例摘要"] }
];

const navItems = [
  { path: "/", name: "首页" },
  ...categories.map(({ path, name }) => ({ path, name })),
  { path: "/submit", name: "教育项目招募" }
];

const projectMetaByCategory = {
  synbio: { organization: "HP-Education 联盟", kind: "长期项目", delivery: "线上/线下", region: "杭州", duration: "90 分钟", venue: "教室 / 实验室" },
  applications: { organization: "ZJU iGEM", kind: "时限项目", delivery: "线下", region: "杭州", duration: "半日", venue: "展台" },
  activities: { organization: "Westlake iGEM", kind: "短期项目", delivery: "线下", region: "杭州", duration: "2 小时", venue: "开放空间" },
  cooperation: { organization: "支教合作组", kind: "长期项目", delivery: "线上+线下", region: "浙江", duration: "4 课时", venue: "合作学校" },
  about: { organization: "联盟运营组", kind: "长期项目", delivery: "线上", region: "通用", duration: "全年", venue: "线上会议" }
};

function caseSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function useLocalAuth() {
  const token = localStorage.getItem("hpEduToken");
  const cachedUser = JSON.parse(localStorage.getItem("hpEduUser") || "null");

  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    authApi.getMe(token).then((res) => {
      if (res.user) {
        setUserState({ id: res.user.id, email: res.user.email, teamName: res.user.name });
        localStorage.setItem("hpEduUser", JSON.stringify({ id: res.user.id, email: res.user.email, teamName: res.user.name }));
      } else {
        localStorage.removeItem("hpEduToken");
        localStorage.removeItem("hpEduUser");
      }
      setLoading(false);
    }).catch(() => {
      localStorage.removeItem("hpEduToken");
      localStorage.removeItem("hpEduUser");
      setLoading(false);
    });
  }, []);

  const setUser = (value) => {
    setUserState(value);
    if (value) localStorage.setItem("hpEduUser", JSON.stringify(value));
    else localStorage.removeItem("hpEduUser");
  };

  return [user, setUser, loading];
}

const themeOptions = {
  system: { label: "跟随系统", icon: Monitor },
  light: { label: "浅色模式", icon: Sun },
  dark: { label: "深色模式", icon: Moon }
};

function useThemeMode() {
  const [themeMode, setThemeModeState] = useState(() => localStorage.getItem("hpEduTheme") || "system");

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    localStorage.setItem("hpEduTheme", themeMode);
  }, [themeMode]);

  const setThemeMode = (value) => {
    setThemeModeState(value);
  };

  return [themeMode, setThemeMode];
}

function App() {
  const [user, setUser, authLoading] = useLocalAuth();
  const [themeMode, setThemeMode] = useThemeMode();
  const [resources, setResources] = useState(() => JSON.parse(localStorage.getItem("hpEduResources") || "null") || starterResources);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  const requestSubmit = (categoryId) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    navigate(categoryId ? `/submit?category=${categoryId}` : "/submit");
  };

  const addResource = (resource) => {
    const nextResource = { ...resource, id: Date.now(), updatedAt: new Date().toISOString().slice(0, 10) };
    setResources((items) => {
      const next = [nextResource, ...items];
      localStorage.setItem("hpEduResources", JSON.stringify(next));
      return next;
    });
    navigate(`/resources?category=${resource.category}`);
  };

  return (
    <AppLayout user={user} setUser={setUser} openLogin={() => setLoginOpen(true)} themeMode={themeMode} setThemeMode={setThemeMode}>
      <Routes>
        <Route path="/" element={<HomePage resources={resources} onSubmit={requestSubmit} />} />
        <Route path="/resources" element={<ResourceLibraryPage resources={resources} onSubmit={requestSubmit} />} />
        <Route path="/submit" element={user ? <SubmitResourcePage user={user} addResource={addResource} /> : <LoginRequiredPage openLogin={() => setLoginOpen(true)} />} />
        <Route path="/cases/:caseId" element={<CaseDetailPage onSubmit={requestSubmit} />} />
        {categories.map((category) => (
          <Route key={category.id} path={category.path} element={<CategoryPage category={category} resources={resources} onSubmit={requestSubmit} />} />
        ))}
      </Routes>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={setUser} />
    </AppLayout>
  );
}

function AppLayout({ children, user, setUser, openLogin, themeMode, setThemeMode }) {
  return (
    <>
      <Header user={user} setUser={setUser} openLogin={openLogin} themeMode={themeMode} setThemeMode={setThemeMode} />
      <main>{children}</main>
      <footer>
        <div>HP-Education 联盟</div>
        <span>Westlake University × Zhejiang University · iGEM Education Demo</span>
      </footer>
    </>
  );
}

function Header({ user, setUser, openLogin, themeMode, setThemeMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const themeOrder = ["system", "light", "dark"];
  const nextThemeMode = themeOrder[(themeOrder.indexOf(themeMode) + 1) % themeOrder.length];
  const ThemeIcon = themeOptions[themeMode].icon;

  return (
    <header className="site-header">
      <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
        <span className="brand-mark">HP</span>
        <span>
          HP-Education 联盟
          <small>Education Resource Hub</small>
        </span>
      </Link>
      <button className="menu-button" type="button" onClick={() => setMenuOpen((open) => !open)}>
        栏目 <ChevronDown size={16} />
      </button>
      <nav className={menuOpen ? "nav open" : "nav"}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"} onClick={() => setMenuOpen(false)}>
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="account">
        <button
          className="icon-button theme-toggle"
          type="button"
          onClick={() => setThemeMode(nextThemeMode)}
          aria-label={`当前：${themeOptions[themeMode].label}。切换到${themeOptions[nextThemeMode].label}`}
          title={`当前：${themeOptions[themeMode].label}`}
        >
          <ThemeIcon size={18} />
        </button>
        {user ? (
          <>
            <span className="team-pill">{user.teamName}</span>
            <button className="icon-button" type="button" onClick={() => { localStorage.removeItem("hpEduToken"); setUser(null); }} aria-label="退出登录">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <button className="login-button" type="button" onClick={openLogin}>
            <LogIn size={18} /> 登录
          </button>
        )}
      </div>
    </header>
  );
}

function HomePage({ resources, onSubmit }) {
  const latest = resources.slice(0, 3);

  return (
    <>
      <section className="hero-section">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Westlake University × Zhejiang University × iGEM Education</p>
          <h1>共建可复用的合成生物学教育资源网络</h1>
          <p>
            面向 iGEM 团队、支教队伍、合作学校和公众教育场景，沉淀科普材料、活动方案、反馈测量和联盟合作记录。
          </p>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={() => onSubmit()}>
              <Plus size={18} /> 教育项目招募
            </button>
            <Link className="secondary-action" to="/resources">
              浏览资源库 <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orbital-card top">
            <BookOpen size={20} />
            <span>课程材料</span>
          </div>
          <div className="dna-panel">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="orbital-card bottom">
            <Users size={20} />
            <span>教育合作</span>
          </div>
        </div>
      </section>

      <StatsPanel resources={resources} />

      <section className="showcase-band">
        <div>
          <p className="eyebrow">Campaign Demo</p>
          <h2>可直接对外展示的教育活动样板</h2>
          <p>用完整案例展示联盟不是单纯收集资料，而是能组织课程、展台、支教和公众活动的教育协作平台。</p>
        </div>
        <div className="showcase-strip">
          {campaignCases.slice(0, 4).map((item) => (
            <CampaignCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="教育资源库" desc="从材料完整度、受众和栏目快速判断哪些内容可以复用。" action={<Link to="/resources">进入资源库</Link>} />
        <div className="resource-grid">
          {latest.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="五个栏目" desc="每个栏目都是一个可持续沉淀的教育专题。" />
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" key={category.id} to={category.path} style={{ "--accent": category.accent }}>
              <img src={category.image} alt="" />
              <category.icon size={24} />
              <strong>{category.name}</strong>
              <span>{category.intro}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function ResourceLibraryPage({ resources, onSubmit }) {
  const location = useLocation();
  const initialCategory = new URLSearchParams(location.search).get("category") || "all";
  const [filters, setFilters] = useState({ category: initialCategory, material: "all", team: "", audience: "" });
  const teams = useMemo(() => ["联盟运营组"], []);
  const resourceMaterialOptions = useMemo(() => [...new Set([...materialTypes, ...resources.flatMap((item) => item.materials)])], [resources]);
  const filtered = resources.filter((item) => {
    const categoryOk = filters.category === "all" || item.category === filters.category;
    const materialOk = filters.material === "all" || item.materials.includes(filters.material);
    const teamOk = !filters.team || item.team === filters.team;
    const audienceOk = !filters.audience || item.audience.includes(filters.audience);
    return categoryOk && materialOk && teamOk && audienceOk;
  });

  const update = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <section className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Resource Library</p>
          <h1>教育资源库</h1>
          <p>筛选、浏览和复用联盟内已有的教育材料。</p>
        </div>
        <button className="primary-action compact" type="button" onClick={() => onSubmit()}>
          <Upload size={17} /> 教育项目招募
        </button>
      </div>

      <div className="filter-bar">
        <label>
          栏目
          <select name="category" value={filters.category} onChange={update}>
            <option value="all">全部栏目</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          项目材料
          <select name="material" value={filters.material} onChange={update}>
            <option value="all">全部材料</option>
            {resourceMaterialOptions.map((material) => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </label>
        <label>
          队伍
          <select name="team" value={filters.team} onChange={update}>
            <option value="">全部队伍</option>
            {teams.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </label>
        <label>
          受众
          <span className="search-input">
            <Search size={16} />
            <input name="audience" value={filters.audience} onChange={update} placeholder="中学生 / 公众" />
          </span>
        </label>
      </div>

      <div className="resource-grid">
        {filtered.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
      {!filtered.length && <p className="empty-state">没有匹配资源，可以调整筛选或发布新的教育项目招募。</p>}
    </section>
  );
}

function LoginRequiredPage({ openLogin }) {
  return (
    <section className="page-shell login-required">
      <div>
        <p className="eyebrow">Login Required</p>
        <h1>登录后发布教育项目招募</h1>
        <p>请先登录团队账号，然后从顶部导航、首页、资源库或栏目页进入教育项目招募发布流程。</p>
        <button className="primary-action" type="button" onClick={openLogin}>
          <LogIn size={18} /> 团队登录
        </button>
      </div>
    </section>
  );
}

function CategoryPage({ category, resources, onSubmit }) {
  const list = resources.filter((resource) => resource.category === category.id);
  const cases = campaignCases.filter((item) => item.category === category.id);
  const Icon = category.icon;

  return (
    <section className="page-shell category-page" style={{ "--accent": category.accent }}>
      <div className="category-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(12,35,32,.78), rgba(12,35,32,.36)), url(${category.image})` }}>
        <div>
          <p className="eyebrow">{category.short}</p>
          <h1>{category.name}</h1>
          <p>{category.intro}</p>
        </div>
        <div className="category-badge">
          <Icon size={34} />
          <span>{list.length} 个资源</span>
        </div>
      </div>

      <section className="case-section">
        <SectionTitle title="教育项目" desc="每个项目都按真实招募信息组织，方便合作队伍快速判断是否适合参与。" />
        <div className="campaign-grid">
          {cases.map((item) => (
            <CampaignCard key={item.title} item={item} variant="project" />
          ))}
        </div>
      </section>

      <div className="category-layout">
        <aside className="recommend-panel">
          <h2>推荐材料</h2>
          <div className="material-list">
            {category.recommended.map((item) => (
              <span key={item}><CheckCircle2 size={15} /> {item}</span>
            ))}
          </div>
          <button className="secondary-submit" type="button" onClick={() => onSubmit(category.id)}>
            发布本栏目项目招募
          </button>
        </aside>
        <div>
          <SectionTitle title="代表资源" desc="优先展示本栏目已有内容，方便团队复用和补充。" />
          <div className="resource-grid one-column">
            {list.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CampaignCard({ item, variant = "case" }) {
  const meta = projectMetaByCategory[item.category] || projectMetaByCategory.synbio;
  const project = {
    organization: item.organization || meta.organization,
    kind: item.kind || meta.kind,
    delivery: item.delivery || meta.delivery,
    region: item.region || meta.region,
    duration: item.duration || meta.duration,
    venue: item.venue || meta.venue
  };

  if (variant === "project") {
    return (
      <Link className="campaign-card project-card" to={`/cases/${caseSlug(item.title)}`}>
        <img src={item.image} alt="" />
        <div>
          <p className="project-org">{project.organization}</p>
          <h3>{item.title}</h3>
          <p className="project-subtitle">{item.subtitle}</p>
          <div className="project-quick-info">
            <span>{project.kind}</span>
            <strong>{project.delivery}</strong>
          </div>
          <div className="project-meta-pills">
            <span>{project.region}</span>
            <span>{project.duration}</span>
            <span>{project.venue}</span>
          </div>
          <span className="detail-link">查看项目详情</span>
        </div>
      </Link>
    );
  }

  return (
    <Link className="campaign-card" to={`/cases/${caseSlug(item.title)}`}>
      <img src={item.image} alt="" />
      <div>
        <p className="campaign-format">{item.format}</p>
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
        <strong>{item.impact}</strong>
        <div className="tags">
          {item.materials.map((material) => (
            <span key={material}>{material}</span>
          ))}
        </div>
        <span className="detail-link">查看案例详情</span>
      </div>
    </Link>
  );
}

function CaseDetailPage({ onSubmit }) {
  const { caseId } = useParams();
  const item = campaignCases.find((current) => caseSlug(current.title) === caseId) || campaignCases[0];
  const category = categories.find((current) => current.id === item.category);
  const steps = ["前期准备材料与安全边界", "现场讲解与互动体验", "满意度调查与成果测量", "复盘建议沉淀到资源库"];

  return (
    <section className="page-shell case-detail" style={{ "--accent": category?.accent || "#138a68" }}>
      <div className="case-hero">
        <img src={item.image} alt="" />
        <div>
          <p className="eyebrow">Demo Case</p>
          <h1>{item.title}</h1>
          <p>{item.subtitle}</p>
          <span className="demo-badge">测试内容，仅供展示</span>
        </div>
      </div>

      <div className="case-detail-grid">
        <article className="case-story">
          <h2>案例简介</h2>
          <p>
            这是为 HP-Education 联盟网站 demo 生成的展示案例，用于说明一个教育活动如何从主题设计、材料准备、现场执行到反馈收集形成完整闭环。实际项目上线后，这里可以替换为真实活动记录、照片、下载材料和合作团队信息。
          </p>
          <h2>展示内容</h2>
          <div className="case-steps">
            {steps.map((step, index) => (
              <div key={step}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="case-side">
          <h2>活动信息</h2>
          <p><strong>所属栏目</strong>{category?.name}</p>
          <p><strong>活动形式</strong>{item.format}</p>
          <p><strong>展示价值</strong>{item.impact}</p>
          <div className="tags">
            {item.materials.map((material) => (
              <span key={material}>{material}</span>
            ))}
          </div>
          <button className="primary-action compact" type="button" onClick={() => onSubmit(item.category)}>
            发布本栏目项目招募
          </button>
        </aside>
      </div>
    </section>
  );
}

function SubmitResourcePage({ user, addResource }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [selected, setSelected] = useState([]);
  const [files, setFiles] = useState({});
  const [durationMode, setDurationMode] = useState("");
  const defaultCategory = params.get("category") || "synbio";

  const toggleMaterial = (material) => {
    setSelected((current) => current.includes(material) ? current.filter((item) => item !== material) : [...current, material]);
  };

  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const uploaded = Object.entries(files).filter(([, name]) => name).map(([type, name]) => `${type}: ${name}`);
    const duration = data.get("durationMode") === "limited"
      ? `${data.get("startDate")} 至 ${data.get("endDate")}`
      : "长期可行";
    addResource({
      category: data.get("category"),
      team: data.get("team"),
      organization: data.get("team"),
      title: data.get("title"),
      negotiator: data.get("negotiator"),
      acceptsOthers: data.get("acceptsOthers"),
      delivery: data.get("delivery"),
      duration,
      location: data.get("location"),
      reimbursement: data.get("reimbursement"),
      contact: data.get("contact"),
      audience: data.get("audience"),
      desc: `${data.get("desc")}${uploaded.length ? ` 已上传：${uploaded.join("；")}` : ""}`,
      materials: selected
    });
  };

  return (
    <section className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Submit</p>
          <h1>教育项目招募</h1>
          <p>当前登录团队：{user.teamName}。Demo 阶段只记录项目招募信息和文件名。</p>
        </div>
      </div>

      <form className="submit-form" onSubmit={submit}>
        <div className="form-grid">
          <label>机构名称<input name="team" required defaultValue={user.teamName} /></label>
          <label>项目名称<input name="title" required placeholder="例如：合成生物学是什么？" /></label>
          <label>主要洽谈队伍<input name="negotiator" required placeholder="例如：Westlake iGEM / ZJU iGEM" /></label>
          <label className="category-field">
            所属栏目
            <select name="category" defaultValue={defaultCategory}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <fieldset className="choice-group participation-group">
            <legend>是否接受其他队伍参与</legend>
            <div>
              {participationOptions.map((option) => (
                <label key={option.value}>
                  <input type="radio" name="acceptsOthers" value={option.value} required />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="choice-group delivery-group">
            <legend>线上/线下要求</legend>
            <div>
              {deliveryOptions.map((option) => (
                <label key={option}>
                  <input type="radio" name="delivery" value={option} required />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="audience-field">
            目标受众
            <select name="audience" required defaultValue="">
              <option value="" disabled>请选择目标受众</option>
              {audienceOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <fieldset className="choice-group duration-group">
            <legend>活动时限</legend>
            <div>
              <label>
                <input
                  type="radio"
                  name="durationMode"
                  value="limited"
                  required
                  checked={durationMode === "limited"}
                  onChange={(event) => setDurationMode(event.target.value)}
                />
                有时限
              </label>
              <label>
                <input
                  type="radio"
                  name="durationMode"
                  value="long"
                  required
                  checked={durationMode === "long"}
                  onChange={(event) => setDurationMode(event.target.value)}
                />
                长期可行
              </label>
            </div>
            {durationMode === "limited" && (
              <div className="date-range">
                <label>开始日期<input type="date" name="startDate" required /></label>
                <label>结束日期<input type="date" name="endDate" required /></label>
              </div>
            )}
          </fieldset>
          <label className="location-field">活动地点<input name="location" required placeholder="填写国家、省份和城市" /></label>
          <label className="reimbursement-field">报销情况<input name="reimbursement" required placeholder="例如：交通可报销 / 不报销 / 待确认" /></label>
          <label className="contact-field">机构联系方式<input name="contact" required placeholder="邮箱、微信或联系人电话" /></label>
          <label className="desc-field wide">活动简介和要求<textarea name="desc" required placeholder="简要说明活动内容、形式、教育目标和合作要求" /></label>
        </div>

        <MaterialChecklist selected={selected} onToggle={toggleMaterial} />

        <div className="upload-grid">
          {selected.map((material) => (
            <label key={material} className="upload-tile">
              <Upload size={18} />
              {material} 上传
              <input type="file" onChange={(event) => setFiles((current) => ({ ...current, [material]: event.target.files?.[0]?.name || "" }))} />
              {files[material] && <span>{files[material]}</span>}
            </label>
          ))}
        </div>

        <div className="form-actions">
          <Link className="secondary-action" to="/resources">取消</Link>
          <button className="primary-action compact" type="submit" disabled={!selected.length}>发布招募</button>
        </div>
      </form>
    </section>
  );
}

function LoginModal({ open, onClose, onLogin }) {
  if (!open) return null;

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    try {
      if (mode === "login") {
        const res = await authApi.login({ email: data.get("email"), password: data.get("password") });
        if (res.token) {
          localStorage.setItem("hpEduToken", res.token);
          onLogin({ id: res.user.id, email: res.user.email, teamName: res.user.name });
          onClose();
        } else {
          setError(res.message || "登录失败");
        }
      } else {
        const res = await authApi.register({ email: data.get("email"), password: data.get("password"), name: data.get("name") });
        if (res.token) {
          localStorage.setItem("hpEduToken", res.token);
          onLogin({ id: res.user.id, email: res.user.email, teamName: res.user.name });
          onClose();
        } else {
          setError(res.message || "注册失败");
        }
      }
    } catch {
      setError("网络错误，请检查后端服务");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="login-modal" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
        <h2>{mode === "login" ? "团队登录" : "注册新账号"}</h2>
        {error && <p style={{ color: "#e53935", marginBottom: 0 }}>{error}</p>}
        {mode === "register" && <label>团队名称<input name="name" required placeholder="Westlake iGEM" /></label>}
        <label>邮箱<input name="email" type="email" required placeholder="team@example.com" /></label>
        <label>密码<input name="password" type="password" required placeholder={mode === "login" ? "请输入密码" : "6位以上密码"} /></label>
        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={onClose}>取消</button>
          <span className="link-button" style={{ cursor: "pointer" }} onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "没有账号？注册" : "已有账号？登录"}
          </span>
          <button className="primary-action compact" type="submit" disabled={loading}>
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ResourceCard({ resource }) {
  const category = categories.find((item) => item.id === resource.category);
  const pct = Math.min(100, Math.round((resource.materials.length / materialTypes.length) * 100));

  return (
    <article className="resource-card" style={{ "--accent": category?.accent || "#1a9b78" }}>
      <div className="card-top">
        <span>{category?.name}</span>
        <small>{resource.updatedAt}</small>
      </div>
      <h3>{resource.title}</h3>
      <p className="meta">{resource.team} · {resource.audience}</p>
      <p>{resource.desc}</p>
      {(resource.delivery || resource.location || resource.duration || resource.reimbursement) && (
        <dl className="project-details">
          {resource.delivery && <div><dt>参与形式</dt><dd>{resource.delivery}</dd></div>}
          {resource.location && <div><dt>地区</dt><dd>{resource.location}</dd></div>}
          {resource.duration && <div><dt>时限</dt><dd>{resource.duration}</dd></div>}
          {resource.reimbursement && <div><dt>报销</dt><dd>{resource.reimbursement}</dd></div>}
        </dl>
      )}
      <div className="progress"><span style={{ width: `${pct}%` }} /></div>
      <div className="tags">
        {resource.materials.map((material) => (
          <span key={material}>{material}</span>
        ))}
      </div>
    </article>
  );
}

function MaterialChecklist({ selected, onToggle }) {
  return (
    <section className="material-checklist">
      <h2>项目材料</h2>
      <div>
        {materialTypes.map((material) => (
          <label key={material} className={selected.includes(material) ? "material active" : "material"}>
            <input type="checkbox" checked={selected.includes(material)} onChange={() => onToggle(material)} />
            {material}
          </label>
        ))}
      </div>
    </section>
  );
}

function StatsPanel({ resources }) {
  return (
    <section className="stats-panel">
      <div><strong>{resources.length}</strong><span>已收录资源</span></div>
      <div><strong>{categories.length}</strong><span>核心栏目</span></div>
      <div><strong>{materialTypes.length}</strong><span>项目材料</span></div>
      <div><strong>2+</strong><span>高校团队</span></div>
    </section>
  );
}

function SectionTitle({ title, desc, action }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      {action && <div className="section-link">{action}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
