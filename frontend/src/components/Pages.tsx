import type { Resource } from "../types"
import { materialTypes } from "../data/constants"
import { categories } from "../data/categories"
import { Link, useLocation, useParams } from "react-router-dom"
import { ArrowRight, BookOpen, CheckCircle2, LogIn, Plus, Search, Upload, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { ResourceCard } from "./ResourceCard"
import { CampaignCard } from "./CampaignCard"
import { StatsPanel } from "./StatsPanel"
import { SectionTitle } from "./SectionTitle"
import { campaignCases } from "../data/resources"

function caseSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

interface PageProps {
  resources: Resource[]
  onSubmit: (categoryId?: string) => void
}

export function HomePage({ resources, onSubmit }: PageProps) {
  const latest = resources.slice(0, 3)

  return (
    <>
      <section className="hero-section">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Westlake University × Zhejiang University × iGEM Education</p>
          <h1>共建可复用的合成生物学教育资源网络</h1>
          <p>面向 iGEM 团队、支教队伍、合作学校和公众教育场景，沉淀科普材料、活动方案、反馈测量和联盟合作记录。</p>
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
            {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
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
          {campaignCases.slice(0, 4).map((item) => <CampaignCard key={item.title} item={item} />)}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="教育资源库" desc="从材料完整度、受众和栏目快速判断哪些内容可以复用。" action={<Link to="/resources">进入资源库</Link>} />
        <div className="resource-grid">
          {latest.map((r) => <ResourceCard key={r.id} resource={r} />)}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="五个栏目" desc="每个栏目都是一个可持续沉淀的教育专题。" />
        <div className="category-grid">
          {categories.map((cat) => (
            <Link className="category-card" key={cat.id} to={cat.path} style={{ "--accent": cat.accent } as React.CSSProperties}>
              <img src={cat.image} alt="" />
              <cat.icon size={24} />
              <strong>{cat.name}</strong>
              <span>{cat.intro}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

export function ResourceLibraryPage({ resources, onSubmit }: PageProps) {
  const location = useLocation()
  const initialCategory = new URLSearchParams(location.search).get("category") || "all"
  const [filters, setFilters] = useState({ category: initialCategory, material: "all", team: "", audience: "" })
  const materialTypesSet = useMemo(() =>
    [...new Set([...materialTypes, ...resources.flatMap((r) => r.materials)])],
    [resources]
  )

  const filtered = resources.filter((item) => {
    const categoryOk = filters.category === "all" || item.category === filters.category
    const materialOk = filters.material === "all" || item.materials.includes(filters.material)
    const teamOk = !filters.team || item.team === filters.team
    const audienceOk = !filters.audience || item.audience.includes(filters.audience)
    return categoryOk && materialOk && teamOk && audienceOk
  })

  const update = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))

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
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>
          项目材料
          <select name="material" value={filters.material} onChange={update}>
            <option value="all">全部材料</option>
            {materialTypesSet.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label>
          队伍
          <select name="team" value={filters.team} onChange={update}>
            <option value="">全部队伍</option>
            {[...new Set(resources.map((r) => r.team))].map((t) => <option key={t} value={t}>{t}</option>)}
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
        {filtered.map((r) => <ResourceCard key={r.id} resource={r} />)}
      </div>
      {!filtered.length && <p className="empty-state">没有匹配资源，可以调整筛选或发布新的教育项目招募。</p>}
    </section>
  )
}

export function LoginRequiredPage({ openLogin }: { openLogin: () => void }) {
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
  )
}

export function CategoryPage({ category, resources, onSubmit }: { category: typeof categories[0]; resources: Resource[]; onSubmit: (categoryId?: string) => void }) {
  const list = resources.filter((r) => r.category === category.id)
  const cases = campaignCases.filter((c) => c.category === category.id)
  const Icon = category.icon

  return (
    <section className="page-shell category-page" style={{ "--accent": category.accent } as React.CSSProperties}>
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
          {cases.map((c) => <CampaignCard key={c.title} item={c} variant="project" />)}
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
            {list.map((r) => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

export function CaseDetailPage({ onSubmit }: { onSubmit: (categoryId?: string) => void }) {
  const { caseId } = useParams()
  const item = campaignCases.find((c) => caseSlug(c.title) === caseId) || campaignCases[0]
  const category = categories.find((c) => c.id === item.category)
  const steps = ["前期准备材料与安全边界", "现场讲解与互动体验", "满意度调查与成果测量", "复盘建议沉淀到资源库"]

  return (
    <section className="page-shell case-detail" style={{ "--accent": category?.accent || "#138a68" } as React.CSSProperties}>
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
          <p>这是为 HP-Education 联盟网站 demo 生成的展示案例，用于说明一个教育活动如何从主题设计、材料准备、现场执行到反馈收集形成完整闭环。</p>
          <h2>展示内容</h2>
          <div className="case-steps">
            {steps.map((step, i) => (
              <div key={step}>
                <strong>{String(i + 1).padStart(2, "0")}</strong>
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
            {item.materials.map((m) => <span key={m}>{m}</span>)}
          </div>
          <button className="primary-action compact" type="button" onClick={() => onSubmit(item.category)}>
            发布本栏目项目招募
          </button>
        </aside>
      </div>
    </section>
  )
}
