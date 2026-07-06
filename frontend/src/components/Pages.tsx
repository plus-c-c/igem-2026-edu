import type { Resource, User } from "../types"
import { fileApi } from "../api"
import { categories } from "../data/categories"
import { Link, useParams, useNavigate } from "react-router-dom"
import { CheckCircle2, LogIn, Plus, Trash2 } from "lucide-react"
import { CampaignCard, caseSlug } from "./CampaignCard"
import { StatsPanel } from "./StatsPanel"
import { SectionTitle } from "./SectionTitle"
import { campaignCases } from "../data/resources"

interface PageProps {
  resources: Resource[]
  onSubmit: (categoryId?: string) => void
}

export function HomePage({ resources, onSubmit }: PageProps) {
  const campaignResources = resources.filter((r) => r.type === "campaign")
  const displayCampaigns = campaignResources.length ? campaignResources.slice(0, 4) : campaignCases.slice(0, 4)

  return (
    <>
      {/* Hero — product-tile-light */}
      <section className="product-tile light">
        <div className="tile-content">
          <p className="eyebrow">Westlake University × Zhejiang University × iGEM Education</p>
          <h1>共建可复用的合成生物学教育资源网络</h1>
          <p style={{ maxWidth: 600 }}>面向 iGEM 团队、支教队伍、合作学校和公众教育场景，沉淀科普材料、活动方案、反馈测量和联盟合作记录。</p>
          <div className="tile-actions">
            <button className="pill-btn primary" type="button" onClick={() => onSubmit()}>
              <Plus size={18} /> 教育项目招募
            </button>
          </div>
        </div>
      </section>

      {/* Stats — parchment section */}
      <section className="product-tile parchment">
        <div className="tile-content wide-container" style={{ maxWidth: 980, width: "100%" }}>
          <StatsPanel resources={resources} />
        </div>
      </section>

      {/* Campaign showcase — product-tile-dark */}
      <section className="showcase-band">
        <div className="tile-content">
          <p className="eyebrow">教育项目</p>
          <h2 style={{ maxWidth: 500 }}>可直接对外展示的教育活动样板</h2>
          <p style={{ maxWidth: 500 }}>用完整案例展示联盟不是单纯收集资料，而是能组织课程、展台、支教和公众活动的教育协作平台。</p>
          <div className="showcase-strip">
            {displayCampaigns.map((item) => <CampaignCard key={item.title} item={item as Resource} />)}
          </div>
        </div>
      </section>

      {/* Category grid — light */}
      <section className="product-tile light">
        <div className="tile-content wide-container" style={{ maxWidth: 1440, width: "100%" }}>
          <h2>五个栏目</h2>
          <p>每个栏目都是一个可持续沉淀的教育专题。</p>
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
        </div>
      </section>
    </>
  )
}

export function LoginRequiredPage({ openLogin }: { openLogin: () => void }) {
  return (
    <section className="page-shell">
      <div>
        <p className="eyebrow">Login Required</p>
        <h1>登录后发布教育项目招募</h1>
        <p>请先登录团队账号，然后从顶部导航或栏目页进入教育项目发布流程。</p>
        <button className="pill-btn primary" type="button" onClick={openLogin}>
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
    <section className="page-shell">
      <div className="category-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${category.image})` }}>
        <div>
          <p className="eyebrow">{category.short}</p>
          <h1>{category.name}</h1>
          <p>{category.intro}</p>
        </div>
        <div className="category-badge">
          <Icon size={34} />
          <span>{list.length} 个项目</span>
        </div>
      </div>

      <section className="case-section">
        <SectionTitle title="教育项目" desc="每个项目都按真实招募信息组织，方便合作队伍快速判断是否适合参与。" />
        <div className="campaign-grid">
          {cases.map((c) => <CampaignCard key={c.title} item={c as Resource} variant="project" />)}
        </div>
      </section>

      <aside className="recommend-panel" style={{ marginTop: 48 }}>
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
    if (!confirm("确定删除此教育项目？此操作不可撤销。")) return
    onDelete(String(r.id))
  }

  return (
    <section className="page-shell case-detail">
      <div className="case-hero">
        <img src={r.image} alt="" />
        <div>
          <p className="eyebrow">教育项目</p>
          <h1>{r.title}</h1>
          <p>{r.subtitle}</p>
          {r.id && <span className="demo-badge">教育项目</span>}
        </div>
      </div>

      <div className="case-detail-grid">
        <article className="case-story">
          <h2>项目简介</h2>
          <p>{r.desc || "这是为 HP-Education 联盟网站 demo 生成的教育项目，用于说明一个教育活动如何从主题设计、材料准备、现场执行到反馈收集形成完整闭环。"}</p>
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


