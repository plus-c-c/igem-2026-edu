import { useEffect, useState } from "react"
import type { Resource, User } from "../types"
import { fileService } from "../services/fileService"
import { CommentSection } from "./CommentSection"
import { resourceService } from "../services/resourceService"
import { categories } from "../data/categories"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Download, LogIn, Plus, Star, ThumbsUp, Trash2 } from "lucide-react"
import { CampaignCard } from "./CampaignCard"
import { CategoryHero } from "./CategoryHero"
import { StatsPanel } from "./StatsPanel"
import { SectionTitle } from "./SectionTitle"
import { useI18n } from "../i18n"
import { useResourceFiles } from "../hooks/useResourceFiles"

interface PageProps {
  resources: Resource[]
  onSubmit: (categoryId?: string) => void
}

interface ProjectFilterState {
  theme: string
  material: string
  audience: string
}

const defaultProjectFilters: ProjectFilterState = {
  theme: "",
  material: "",
  audience: "",
}

function optionMatches(item: Resource, option: string) {
  if (!option) return true
  const haystack = [
    item.title,
    item.subtitle,
    item.desc,
    item.format,
    item.impact,
    item.audience,
    ...(item.materials || []),
  ].filter(Boolean).join(" ").toLowerCase()
  return haystack.includes(option.toLowerCase())
}

function filterProjects(items: Resource[], filters: ProjectFilterState) {
  return items.filter((item) =>
    optionMatches(item, filters.theme) &&
    optionMatches(item, filters.material) &&
    optionMatches(item, filters.audience)
  )
}

function ProjectFilters({ filters, onChange }: { filters: ProjectFilterState; onChange: (filters: ProjectFilterState) => void }) {
  const { t } = useI18n()

  return (
    <div className="project-filter-panel" aria-label={t.filters.aria}>
      <label>
        {t.filters.theme}
        <select value={filters.theme} onChange={(e) => onChange({ ...filters, theme: e.target.value })}>
          <option value="">{t.filters.allThemes}</option>
          {t.filters.themeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        {t.filters.material}
        <select value={filters.material} onChange={(e) => onChange({ ...filters, material: e.target.value })}>
          <option value="">{t.filters.allMaterials}</option>
          {t.filters.materialOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        {t.filters.audience}
        <select value={filters.audience} onChange={(e) => onChange({ ...filters, audience: e.target.value })}>
          <option value="">{t.filters.allAudiences}</option>
          {t.filters.audienceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
    </div>
  )
}

export function HomePage({ resources }: { resources: Resource[] }) {
  const campaignResources = resources.filter((r) => r.type === "campaign")
  const displayCampaigns = campaignResources.slice(0, 4)
  const titleLines = ["SynEdu Global:", "Synthetic Biology Education Global Alliance"]
  const fullTitle = titleLines.join("\n")
  const [typedTitle, setTypedTitle] = useState("")

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setTypedTitle(fullTitle)
      return
    }

    setTypedTitle("")
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedTitle(fullTitle.slice(0, index))
      if (index >= fullTitle.length) window.clearInterval(timer)
    }, 42)

    return () => window.clearInterval(timer)
  }, [fullTitle])

  const typedLines = typedTitle.split("\n")

  return (
    <>
      {/* Hero — product-tile-light */}
      <section className="product-tile light home-hero">
        <div className="tile-content">
          <p className="eyebrow">ZJU-China、Westlake、XJTLU-China</p>
          <h1 className="hero-title" aria-label={fullTitle}>
            <span className="typewriter-text" aria-hidden="true">
              <span className="typewriter-line">{typedLines[0] || "\u00a0"}</span>
              <span className="typewriter-line">{typedLines[1] || "\u00a0"}</span>
            </span>
          </h1>
          <p style={{ maxWidth: 600 }}>加入我们，一起点亮世界合成生物学科普的微光。</p>
          <div className="tile-actions">
            <Link className="pill-btn primary" to="/submit">
              <Plus size={18} /> 在这里添加你的项目
            </Link>
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
          <h2 style={{ maxWidth: 500 }}>可直接对外展示的教育活动样板</h2>
          <p style={{ maxWidth: 500 }}>用完整案例展示联盟不是单纯收集资料，而是能组织课程、展台、支教和公众活动的教育协作平台。</p>
          <div className="showcase-strip">
            {displayCampaigns.map((item) => <CampaignCard key={item.title} item={item as Resource} variant="project" />)}
          </div>
        </div>
      </section>

      {/* Category grid — light */}
      <section className="product-tile light">
        <div className="tile-content wide-container" style={{ maxWidth: 1440, width: "100%" }}>
          <h2>四个栏目</h2>
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

export function RecruitmentPage({ resources, onSubmit }: PageProps) {
  const category = categories.find((c) => c.id === "cooperation") || categories[0]
  const list = resources.filter((r) => r.category === category.id)
  const cases = resources.filter((r) => r.category === category.id && r.type === "campaign")
  const [filters, setFilters] = useState<ProjectFilterState>(defaultProjectFilters)
  const filteredCases = filterProjects(cases, filters)
  const Icon = category.icon
  const sectionTitle = category.id === "applications" ? "科普项目" : category.id === "activities" ? "活动主题" : "教育项目"

  return (
    <section className="page-shell recruitment-page">
      <CategoryHero category={category} badge={<><Icon size={34} /><span>{list.length} 个项目</span></>} />

      <section className="case-section">
        <SectionTitle
          title={sectionTitle}
          action={
            <button className="add-project-button" type="button" onClick={() => onSubmit(category.id)}>
              <Plus size={19} />
              <span>在这里添加你的项目</span>
            </button>
          }
        />
        <ProjectFilters filters={filters} onChange={setFilters} />
        {filteredCases.length ? (
          <div className="campaign-grid">
            {filteredCases.map((c) => <CampaignCard key={c.title} item={c as Resource} variant="project" />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>{cases.length ? "没有符合当前检索条件的教育项目。" : "暂时还没有发布的教育项目。登录后可以添加第一个项目招募。"}</p>
          </div>
        )}
      </section>
    </section>
  )
}

export function AboutPage() {
  const category = categories.find((c) => c.id === "about") || categories[0]

  return (
    <section className="page-shell about-page">
      <CategoryHero category={category} className="about-hero" gradient="linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.28))" intro="加入我们，一起点亮世界合成生物学科普的微光。" />

      <article className="about-story">
        <p>
          SynEdu Global 是由 ZJU-China、Westlake、XJTLU-China 三支 iGEM 队伍联合发起的合成生物学教育网站，旨在共享教育资源，启发教育灵感，联合国内外的 iGEMer 共同推动合成生物学教育的发展。
        </p>
        <p>
          我们相信，iGEM 教育板块的核心，从来不是孤军奋战，而是平等、共享、交流与传递。SynEdu Global 从三支国内队伍的微小想法出发，希望可以联合各位优秀 iGEMer 的力量，共同搭建一个纯粹、开放、以启发为核心的科普交流平台。我们希望让每一支热爱科普的 iGEM 队伍都能在此获得支撑、迸发创意、传递科学的温度。
        </p>
        <p>
          在此，我们诚挚邀请 iGEMer、教育公益组织、爱心企业等优秀团队，加入 SynEdu Global。希望你的建议和支持，项目和灵感，可以让 SynEdu 更好成长。期待与你一同上传成果、交流思想、投身教育、联结全球，以协同教育之力，点亮世界各地合成生物学科普的微光。
        </p>
      </article>
    </section>
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
  const cases = resources.filter((r) => r.category === category.id && r.type === "campaign")
  const [filters, setFilters] = useState<ProjectFilterState>(defaultProjectFilters)
  const filteredCases = filterProjects(cases, filters)
  const Icon = category.icon
  const sectionTitle = category.id === "applications" ? "科普项目" : category.id === "activities" ? "活动主题" : "教育项目"

  return (
    <section className="page-shell">
      <CategoryHero category={category} badge={<><Icon size={34} /><span>{list.length} 个项目</span></>} />

      <section className="case-section">
        <SectionTitle
          title={sectionTitle}
          action={
            <button className="add-project-button" type="button" onClick={() => onSubmit(category.id)}>
              <Plus size={19} />
              <span>在这里添加你的项目</span>
            </button>
          }
        />
        <ProjectFilters filters={filters} onChange={setFilters} />
        {filteredCases.length ? (
          <div className="campaign-grid">
            {filteredCases.map((c) => <CampaignCard key={c.title} item={c as Resource} variant="project" />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>{cases.length ? "没有符合当前检索条件的项目。" : "暂时还没有发布的项目。"}</p>
          </div>
        )}
      </section>

    </section>
  )
}

export function CaseDetailPage({ resources, user, onDelete }: { resources: Resource[]; user: User | null; onDelete: (id: string) => void }) {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const item = resources.find((c) => c.type === "campaign" && String(c.id) === caseId)
  const r = item
  const category = categories.find((c) => c.id === r?.category)
  const canEdit = user && (user.role === "admin" || r?.userId === user.id)
  const steps = r?.campaignSteps && r.campaignSteps.length > 0 ? r.campaignSteps : []
  const { materialFiles } = useResourceFiles(r?.id)
  const resId = r?.id ? String(r.id) : ""

  const [likedByMe, setLikedByMe] = useState(() => {
    if (!resId || !user) return false
    return localStorage.getItem(`liked_${resId}`) === "true"
  })
  const [favoritedByMe, setFavoritedByMe] = useState(() => {
    if (!resId || !user) return false
    return localStorage.getItem(`favorited_${resId}`) === "true"
  })
  const [likesCount, setLikesCount] = useState(() => {
    const n = parseInt(localStorage.getItem(`likesCount_${resId}`) || "0")
    return isNaN(n) ? 0 : n
  })
  const [favoritesCount, setFavoritesCount] = useState(() => {
    const n = parseInt(localStorage.getItem(`favCount_${resId}`) || "0")
    return isNaN(n) ? 0 : n
  })

  const syncLocal = (liked: boolean, favorited: boolean, lCount: number, fCount: number) => {
    if (!resId || !user) return
    localStorage.setItem(`liked_${resId}`, String(liked))
    localStorage.setItem(`favorited_${resId}`, String(favorited))
    localStorage.setItem(`likesCount_${resId}`, String(lCount))
    localStorage.setItem(`favCount_${resId}`, String(fCount))
  }

  useEffect(() => {
    if (!resId) return
    resourceService.get(resId).then((data) => {
      setLikedByMe(data.likedByMe)
      setFavoritedByMe(data.favoritedByMe)
      syncLocal(data.likedByMe, data.favoritedByMe, likesCount, favoritesCount)
    }).catch(() => {})
  }, [resId, user?.id])

  const handleLike = async () => {
    if (!user || !resId) return
    const next = !likedByMe
    try {
      const res = await resourceService.toggleLike(resId, likedByMe)
      setLikedByMe(next)
      const count = res.likesCount !== undefined ? res.likesCount : likesCount
      setLikesCount(count)
      syncLocal(next, favoritedByMe, count, favoritesCount)
    } catch {}
  }

  const handleFavorite = async () => {
    if (!user || !resId) return
    const next = !favoritedByMe
    try {
      const res = await resourceService.toggleFavorite(resId, favoritedByMe)
      setFavoritedByMe(next)
      const count = res.favoritesCount !== undefined ? res.favoritesCount : favoritesCount
      setFavoritesCount(count)
      syncLocal(likedByMe, next, likesCount, count)
    } catch {}
  }

  const handleDelete = () => {
    if (!confirm("确定删除此教育项目？此操作不可撤销。")) return
    onDelete(String(r!.id))
  }

  if (!r) {
    return (
      <section className="page-shell">
        <h1>教育项目不存在</h1>
        <p>该教育项目可能已被删除或链接无效。</p>
        <Link className="pill-btn secondary" to="/" style={{ width: "fit-content" }}>返回首页</Link>
      </section>
    )
  }

  const locationParts = [r.locationCountry, r.locationProvince, r.locationCity].filter(Boolean).join(" / ")
  const locationLabel = r.locationType?.split(",").join("、")
  const sitePhotoIdList = r.sitePhotoIds ? r.sitePhotoIds.split(",").filter(Boolean) : []

  return (
    <section className="page-shell case-detail">
      <div className="case-hero">
        {r.image ? <img src={r.image} alt="" /> : <div className="hero-img-placeholder" />}
        <div>
          <h1>{r.title}</h1>
          {r.team && <p className="hero-team">{r.team}</p>}
        </div>
      </div>

      <div className="case-detail-grid">
        <article className="case-story">
          <h2>项目简介</h2>
          <p>{r.desc || "这是为 HP-Education 联盟网站 demo 生成的教育项目，用于说明一个教育活动如何从主题设计、材料准备、现场执行到反馈收集形成完整闭环。"}</p>

          {r.introductionContent && (
            <>
              <h2>项目介绍书</h2>
              <p style={{ whiteSpace: "pre-wrap" }}>{r.introductionContent}</p>
            </>
          )}

          {sitePhotoIdList.length > 0 && (
            <>
              <h2>现场照片</h2>
              <div className={`site-photos-grid format-${r.sitePhotosFormat === "双图" ? "double" : r.sitePhotosFormat === "四宫格" ? "quad" : "single"}`}>
                {(() => {
                  const labels = r.sitePhotosFormat === "单图" ? ["照片"] : r.sitePhotosFormat === "双图" ? ["左", "右"] : ["左上", "右上", "左下", "右下"]
                  return labels.map((label, i) => (
                    <div key={i} className="site-photo-slot">
                      {sitePhotoIdList[i] ? (
                        <div className="site-photo-preview">
                          <img src={fileService.downloadUrl(sitePhotoIdList[i])} alt={label} />
                        </div>
                      ) : (
                        <div className="site-photo-slot empty" />
                      )}
                    </div>
                  ))
                })()}
              </div>
            </>
          )}

          {r.tips && (
            <>
              <h2>温馨提示</h2>
              <p style={{ whiteSpace: "pre-wrap" }}>{r.tips}</p>
            </>
          )}

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
                          href={fileService.downloadUrl(f.fileId)}
                          target="_blank" rel="noopener noreferrer"
                        ><Download size={14} /> {f.name}</a>
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
          {r.canParticipate && <p><strong>是否可参与</strong>{r.canParticipate === "yes" ? "可参与" : "不可参与"}</p>}
          {locationLabel && <p><strong>活动地点</strong>{[locationLabel, locationParts].filter(Boolean).join(" · ")}</p>}
          {r.eventDate && <p><strong>活动日期</strong>{r.eventDate}</p>}
          {r.timeLimitType && <p><strong>时限</strong>{r.timeLimitType}</p>}
          {r.format && <p><strong>活动形式</strong>{r.format}</p>}
          {r.impact && <p><strong>展示价值</strong>{r.impact}</p>}
          {r.materials && r.materials.length > 0 && (
            <div className="tags">
              {r.materials.map((m) => (
                <div key={m} className="tag-group">
                  <span>{m}</span>
                  {materialFiles()[m]?.map((f) => (
                    <a key={f.id} className="tag-file-link"
                      href={fileService.downloadUrl(f.id)}
                      target="_blank" rel="noopener noreferrer"
                    ><Download size={12} /> {f.name}</a>
                  ))}
                </div>
              ))}
            </div>
          )}
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

      <div className="detail-footer-bar">
        <div className="detail-footer-actions">
          <button className={`detail-action-btn ${likedByMe ? "active" : ""}`} type="button" onClick={handleLike} disabled={!user}>
            <ThumbsUp size={18} />
            <span>{likedByMe ? "已赞" : "点赞"}</span>
            {likesCount > 0 && <span className="count-badge">{likesCount}</span>}
          </button>
          <button className={`detail-action-btn ${favoritedByMe ? "active" : ""}`} type="button" onClick={handleFavorite} disabled={!user}>
            <Star size={18} className={favoritedByMe ? "star-filled" : ""} />
            <span>{favoritedByMe ? "已收藏" : "收藏"}</span>
            {favoritesCount > 0 && <span className="count-badge">{favoritesCount}</span>}
          </button>
        </div>
      </div>

      {r.id && <CommentSection resourceId={r.id} user={user} />}
    </section>
  )
}
