import type { Resource, UploadedFile, User } from "../types"
import { fileApi } from "../api"
import { materialTypes } from "../data/constants"
import { categories } from "../data/categories"
import { Link, useLocation, useParams, useNavigate } from "react-router-dom"
import { ArrowRight, BookOpen, CheckCircle2, File, FileImage, FileText, Film, LogIn, Plus, Search, Trash2, Upload, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ResourceCard } from "./ResourceCard"
import { CampaignCard, caseSlug } from "./CampaignCard"
import { StatsPanel } from "./StatsPanel"
import { SectionTitle } from "./SectionTitle"
import { campaignCases } from "../data/resources"

interface PageProps {
  resources: Resource[]
  onSubmit: (categoryId?: string) => void
}

export function HomePage({ resources, onSubmit }: PageProps) {
  const latest = resources.slice(0, 3)
  const campaignResources = resources.filter((r) => r.type === "campaign")
  const displayCampaigns = campaignResources.length ? campaignResources.slice(0, 4) : campaignCases.slice(0, 4)

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
          {displayCampaigns.map((item) => <CampaignCard key={item.title} item={item as Resource} />)}
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
  const campaignList = resources.filter((r) => r.category === category.id && r.type === "campaign")
  const cases = campaignList.length ? campaignList : campaignCases.filter((c) => c.category === category.id)
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
          {cases.map((c) => <CampaignCard key={c.title} item={c as Resource} variant="project" />)}
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

export function CaseDetailPage({ resources, user, onDelete }: { resources: Resource[]; user: User | null; onDelete: (id: string) => void }) {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const campaignResources = resources.filter((r) => r.type === "campaign")
  const item = campaignResources.find((c) => caseSlug(c.title) === caseId) || campaignCases.find((c) => caseSlug(c.title) === caseId) || campaignCases[0]
  const r = item as Resource
  const category = categories.find((c) => c.id === r.category)
  const canEdit = user && (user.role === "admin" || r.userId === user.id)
  const steps = r.campaignSteps && r.campaignSteps.length > 0 ? r.campaignSteps : []

  const handleDelete = () => {
    if (!confirm("确定删除此演示案例？此操作不可撤销。")) return
    onDelete(String(r.id))
  }

  return (
    <section className="page-shell case-detail" style={{ "--accent": category?.accent || "#138a68" } as React.CSSProperties}>
      <div className="case-hero">
        <img src={r.image} alt="" />
        <div>
          <p className="eyebrow">Demo Case</p>
          <h1>{r.title}</h1>
          <p>{r.subtitle}</p>
          {r.id && <span className="demo-badge">演示案例</span>}
        </div>
      </div>

      <div className="case-detail-grid">
        <article className="case-story">
          <h2>案例简介</h2>
          <p>{r.desc || "这是为 HP-Education 联盟网站 demo 生成的展示案例，用于说明一个教育活动如何从主题设计、材料准备、现场执行到反馈收集形成完整闭环。"}</p>
          <h2>展示内容</h2>
          <div className="case-steps">
            {steps.length > 0 ? steps.map((step, i) => (
              <div key={step.id}>
                <strong>{String(i + 1).padStart(2, "0")}</strong>
                <div className="step-content">
                  <span>{step.text}</span>
                  {step.files && step.files.length > 0 && (
                    <div className="step-files">
                      {step.files.map((f) => (
                        <a key={f.fileId} className="step-file-link"
                          href={fileApi.downloadUrl(f.fileId)}
                          target="_blank" rel="noopener noreferrer"
                        >{f.name}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <p className="empty-state">暂无展示内容</p>
            )}
          </div>
        </article>
        <aside className="case-side">
          <h2>活动信息</h2>
          <p><strong>所属栏目</strong>{category?.name}</p>
          <p><strong>活动形式</strong>{r.format}</p>
          <p><strong>展示价值</strong>{r.impact}</p>
          <div className="tags">
            {r.materials.map((m) => <span key={m}>{m}</span>)}
          </div>
        </aside>
      </div>

      {canEdit && r.id && (
        <div className="detail-actions">
          <button className="edit-button" type="button" onClick={() => navigate(`/resource/${r.id}/edit`)}>
            编辑
          </button>
          <button className="delete-button" type="button" onClick={handleDelete}>
            <Trash2 size={16} /> 删除
          </button>
        </div>
      )}
    </section>
  )
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <FileImage size={20} />
  if (mimeType.startsWith("video/")) return <Film size={20} />
  if (mimeType.includes("pdf")) return <FileText size={20} />
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileText size={20} />
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return <FileText size={20} />
  if (mimeType.startsWith("text/")) return <FileText size={20} />
  return <File size={20} />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ResourceDetailPage({ resources, user, onDelete }: { resources: Resource[]; user: User | null; onDelete: (id: string) => void }) {
  const { resourceId } = useParams()
  const navigate = useNavigate()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const resource = resources.find((r) => String(r.id) === resourceId)
  const category = categories.find((c) => c.id === resource?.category)
  const canEdit = user && resource && (user.role === "admin" || resource.userId === user.id)
  const canDelete = canEdit

  useEffect(() => {
    if (resourceId) {
      fileApi.list(resourceId).then(setUploadedFiles)
    }
  }, [resourceId])

  if (!resource) {
    return (
      <section className="page-shell">
        <h1>资源不存在</h1>
        <p>该资源可能已被删除或链接无效。</p>
        <Link className="secondary-action" to="/resources" style={{ width: "fit-content" }}>返回资源库</Link>
      </section>
    )
  }

  const handleDelete = () => {
    if (!confirm("确定删除此资源？此操作不可撤销。")) return
    onDelete(String(resource.id))
  }

  return (
    <section className="page-shell resource-detail" style={{ "--accent": category?.accent || "#138a68" } as React.CSSProperties}>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{category?.name || "资源详情"}</p>
          <h1>{resource.title}</h1>
        </div>
        {canEdit && (
          <div className="detail-actions">
            <button className="edit-button" type="button" onClick={() => navigate(`/resource/${resource.id}/edit`)}>
              编辑
            </button>
            <button className="delete-button" type="button" onClick={handleDelete}>
              <Trash2 size={16} /> 删除资源
            </button>
          </div>
        )}
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <p className="meta">{resource.team} · {resource.audience}</p>
          <p>{resource.desc}</p>

          <h2>项目材料</h2>
          <div className="tags">
            {resource.materials.map((m) => <span key={m}>{m}</span>)}
          </div>

          {uploadedFiles.length > 0 && (
            <>
              <h2>上传文件</h2>
              <div className="file-grid">
                {uploadedFiles.map((f) => (
                  <a key={f.id} className="file-card" href={fileApi.downloadUrl(f.id)} download={f.originalName}>
                    <span className="file-icon">{fileIcon(f.mimeType)}</span>
                    <span className="file-name">{f.originalName}</span>
                    <span className="file-meta">
                      {f.materialLabel && <span>{f.materialLabel}</span>}
                      <span>{formatSize(f.size)}</span>
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="detail-side">
          <h2>项目信息</h2>
          {resource.negotiator && <p><strong>主要洽谈队伍</strong>{resource.negotiator}</p>}
          {resource.acceptsOthers && <p><strong>接受其他队伍</strong>{resource.acceptsOthers === "yes" ? "是" : "否"}</p>}
          {resource.delivery && <p><strong>线上/线下</strong>{resource.delivery}</p>}
          {resource.audience && <p><strong>目标受众</strong>{resource.audience}</p>}
          {resource.duration && <p><strong>活动时限</strong>{resource.duration}</p>}
          {resource.location && <p><strong>活动地点</strong>{resource.location}</p>}
          {resource.reimbursement && <p><strong>报销情况</strong>{resource.reimbursement}</p>}
          {resource.contact && <p><strong>联系方式</strong>{resource.contact}</p>}
          {resource.updatedAt && <p><strong>更新时间</strong>{resource.updatedAt}</p>}
        </aside>
      </div>
    </section>
  )
}
