import { useEffect, useRef, useState } from "react"
import type { Resource, User } from "../types"
import { fileService } from "../services/fileService"
import { CommentSection } from "./CommentSection"
import { resourceService } from "../services/resourceService"
import { categories } from "../data/categories"
import { materialOptions, audienceOptions, categoryThemeOptions, timeLimitOptions, CORE_COLUMNS_LIMIT } from "../data/constants"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Download, ImageIcon, LogIn, Plus, Search, Star, ThumbsUp, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { CampaignCard } from "./CampaignCard"
import { CategoryHero } from "./CategoryHero"
import { StatsPanel } from "./StatsPanel"
import { SectionTitle } from "./SectionTitle"
import { useI18n } from "../i18n"
import { useResourceFiles } from "../hooks/useResourceFiles"

import { marked } from "marked"
import DOMPurify from "dompurify"

interface PageProps {
  resources: Resource[]
  onSubmit: (categoryId?: string) => void
}

interface ProjectFilterState {
  searchText: string
  theme: string
  materials: string[]
  audience: string
  canParticipate: string
  timeLimitType: string
  location: string
}

const defaultProjectFilters: ProjectFilterState = {
  searchText: "",
  theme: "",
  materials: [],
  audience: "",
  canParticipate: "",
  timeLimitType: "",
  location: "",
}

function optionMatches(item: Resource, option: string) {
  if (!option) return true
  const haystack = [
    item.title,
    item.subtitle,
    item.subcategory,
    item.desc,
    item.format,
    item.impact,
    item.audience,
    item.team,
    item.location,
    item.locationCity,
    item.locationProvince,
    item.locationCountry,
    item.timeLimitType,
    item.locationType,
    item.eventDate,
    ...(item.materials || []),
    ...(item.campaignSteps || []).map((s: any) => s.text),
  ].filter(Boolean).join(" ").toLowerCase()
  return haystack.includes(option.toLowerCase())
}

function filterProjects(items: Resource[], filters: ProjectFilterState) {
  return items.filter((item) => {
    if (filters.searchText && !optionMatches(item, filters.searchText)) return false
    if (filters.theme && !optionMatches(item, filters.theme)) return false
    if (filters.materials.length > 0) {
      const itemMaterials = (item.materials || []).map((m) => m.toLowerCase())
      const itemStepTexts = (item.campaignSteps || []).map((s: any) => s.text?.toLowerCase()).filter(Boolean)
      const allTexts = [...new Set([...itemMaterials, ...itemStepTexts])]
      const hasMatch = filters.materials.every((m) => allTexts.includes(m.toLowerCase()))
      if (!hasMatch) return false
    }
    if (filters.audience && item.audience !== filters.audience) return false
    if (filters.canParticipate && (item.canParticipate || "yes") !== filters.canParticipate) return false
    if (filters.timeLimitType && (item.timeLimitType || "") !== filters.timeLimitType) return false
    if (filters.location) {
      const locHaystack = [item.location, item.locationCity, item.locationProvince, item.locationCountry].filter(Boolean).join(" ").toLowerCase()
      if (!locHaystack.includes(filters.location.toLowerCase())) return false
    }
    return true
  })
}

function getProjectSortTime(item: Resource) {
  const rawDate = item.eventDate || item.updatedAt || item.createdAt || ""
  const parsedTime = Date.parse(rawDate)
  if (!Number.isNaN(parsedTime)) return parsedTime
  return Number(rawDate.replace(/\D/g, "").slice(0, 12)) || 0
}

function optLabel(t: any, section: string, value: string): string {
  return t?.categoryOptions?.[section]?.[value] || value
}

function MaterialMultiSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const allSelected = value.length === materialOptions.length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const toggle = (m: string) => {
    onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m])
  }

  const toggleAll = () => {
    onChange(allSelected ? [] : [...materialOptions])
  }

  const displayText = value.length === 0
    ? t.filters.allMaterials
    : value.length === 1
      ? optLabel(t, "materials", value[0])
      : `${value.length} ${t.filters.selected}`

  return (
    <div className="multi-select-dropdown" ref={ref}>
      <button type="button" className="multi-select-trigger" onClick={() => setOpen(!open)}>
        <span>{displayText}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="multi-select-panel">
          <label className={allSelected ? "active" : ""}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            {t.filters.selectAll}
          </label>
          {materialOptions.map((m) => (
            <label key={m} className={value.includes(m) ? "active" : ""}>
              <input type="checkbox" checked={value.includes(m)} onChange={() => toggle(m)} />
              {optLabel(t, "materials", m)}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectFilters({ filters, onChange, categoryId }: { filters: ProjectFilterState; onChange: (filters: ProjectFilterState) => void; categoryId?: string }) {
  const { t } = useI18n()
  const themes = categoryId ? categoryThemeOptions[categoryId] || [] : []
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="project-filter-panel" aria-label={t.filters.aria}>
      <div className="project-filter-search-row">
        <div className="search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder={t.filters.searchPlaceholder}
            value={filters.searchText}
            onChange={(e) => onChange({ ...filters, searchText: e.target.value })}
          />
          <button className={`filter-toggle-btn${showFilters ? " open" : ""}`} type="button" onClick={() => setShowFilters(!showFilters)} aria-label={t.filters.filterToggle}>
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="project-filter-fields">
          <div className="filter-row">
            <label>
              {t.filters.theme}
              <select value={filters.theme} onChange={(e) => onChange({ ...filters, theme: e.target.value })}>
                <option value="">{t.filters.allThemes}</option>
                {themes.map((item: string) => <option key={item} value={item}>{optLabel(t, "themes", item)}</option>)}
              </select>
            </label>
            <label className="filter-multi-label">
              <span>{t.filters.material}</span>
              <MaterialMultiSelect value={filters.materials} onChange={(v) => onChange({ ...filters, materials: v })} />
            </label>
            <label>
              {t.filters.canParticipate}
              <select value={filters.canParticipate} onChange={(e) => onChange({ ...filters, canParticipate: e.target.value })}>
                <option value="">{t.filters.all}</option>
                <option value="yes">{t.filters.canJoin}</option>
                <option value="no">{t.filters.cannotJoin}</option>
              </select>
            </label>
          </div>
          <div className="filter-row">
            <label>
              {t.filters.timeLimit}
              <select value={filters.timeLimitType} onChange={(e) => onChange({ ...filters, timeLimitType: e.target.value })}>
                <option value="">{t.filters.all}</option>
                {timeLimitOptions.map((opt: string) => <option key={opt} value={opt}>{optLabel(t, "timeLimitOptions", opt)}</option>)}
              </select>
            </label>
            <label>
              {t.filters.location}
              <input type="text" value={filters.location} onChange={(e) => onChange({ ...filters, location: e.target.value })} placeholder={t.filters.locationPlaceholder} />
            </label>
            <label>
              {t.filters.audience}
              <select value={filters.audience} onChange={(e) => onChange({ ...filters, audience: e.target.value })}>
                <option value="">{t.filters.allAudiences}</option>
                {audienceOptions.map((item: string) => <option key={item} value={item}>{optLabel(t, "audiences", item)}</option>)}
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export function HomePage({ resources }: { resources: Resource[] }) {
  const { t } = useI18n()
  const campaignResources = resources.filter((r) => r.type === "campaign")
  const displayCampaigns = [...campaignResources]
    .sort((a, b) => getProjectSortTime(b) - getProjectSortTime(a))
    .slice(0, CORE_COLUMNS_LIMIT)
  const titleLines = t.home.titleLines
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
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1 className="hero-title" aria-label={fullTitle}>
            <span className="typewriter-text" aria-hidden="true">
              <span className="typewriter-line">{typedLines[0] || "\u00a0"}</span>
              <span className="typewriter-line">{typedLines[1] || "\u00a0"}</span>
            </span>
          </h1>
          <p className="home-subtitle">{t.home.subtitle}</p>
          <div className="tile-actions">
            <Link className="pill-btn primary" to="/submit">
              <Plus size={18} /> {t.home.recruitButton}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats — parchment section */}
      <section className="product-tile parchment">
        <div className="tile-content wide-container stats-container">
          <StatsPanel resources={resources} />
        </div>
      </section>

      {/* Campaign showcase — product-tile-dark */}
      <section className="showcase-band">
        <div className="tile-content">
          <h2 style={{ maxWidth: 500 }}>{t.home.showcaseTitle}</h2>
          <p style={{ maxWidth: 500 }}>{t.home.showcaseDesc}</p>
          <div className="showcase-strip">
            {displayCampaigns.map((item) => <CampaignCard key={item.title} item={item as Resource} variant="project" />)}
          </div>
        </div>
      </section>

      {/* Category grid — light */}
      <section className="product-tile light">
        <div className="tile-content wide-container" style={{ maxWidth: 1440, width: "100%" }}>
          <h2>{t.home.categoryTitle}</h2>
          <p>{t.home.categoryDesc}</p>
          <div className="category-grid">
            {categories.map((cat) => {
              const catT = t.categories[cat.id]
              return (
              <Link className="category-card" key={cat.id} to={cat.path} style={{ "--accent": cat.accent } as React.CSSProperties}>
                <img src={cat.image} alt="" />
                <div className="category-card-body">
                  <div className="category-card-header">
                    <cat.icon size={24} />
                    <strong>{catT?.name ?? cat.name}</strong>
                  </div>
                  <span>{catT?.intro ?? cat.intro}</span>
                </div>
              </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export function RecruitmentPage({ resources, onSubmit }: PageProps) {
  const { t } = useI18n()
  const category = categories.find((c) => c.id === "cooperation") || categories[0]
  const list = resources.filter((r) => r.category === category.id)
  const cases = resources.filter((r) => r.category === category.id && r.type === "campaign")
  const [filters, setFilters] = useState<ProjectFilterState>(defaultProjectFilters)
  const filteredCases = filterProjects(cases, filters)
  const Icon = category.icon
  const sectionTitle = category.id === "applications" ? t.pages.scienceProjects : category.id === "activities" ? t.pages.activityTopics : t.pages.educationProjects

  return (
    <section className="page-shell recruitment-page">
      <CategoryHero category={category} badge={<><Icon size={34} /><span>{list.length}{t.pages.itemCount}</span></>} />

      <section className="case-section">
        <SectionTitle
          title={sectionTitle}
          action={
            <button className="add-project-button" type="button" onClick={() => onSubmit(category.id)}>
              <Plus size={19} />
              <span>{t.pages.addProject}</span>
            </button>
          }
        />
        <ProjectFilters filters={filters} onChange={setFilters} categoryId={category.id} />
        {filteredCases.length ? (
          <div className="campaign-grid">
            {filteredCases.map((c) => <CampaignCard key={c.title} item={c as Resource} variant="project" />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>{cases.length ? t.pages.noRecruitmentMatch : t.pages.noRecruitmentItems}</p>
          </div>
        )}
      </section>
    </section>
  )
}

export function AboutPage() {
  const { t } = useI18n()
  const category = categories.find((c) => c.id === "about") || categories[0]

  return (
    <section className="page-shell about-page">
      <CategoryHero category={category} className="about-hero" gradient="linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.28))" intro={t.about.subtitle} />

      <article className="about-story">
        <p>{t.about.paragraphs[0]}</p>
        <p>{t.about.paragraphs[1]}</p>
        <p>{t.about.paragraphs[2]}</p>
      </article>
    </section>
  )
}

export function LoginRequiredPage({ openLogin }: { openLogin: () => void }) {
  const { t } = useI18n()
  return (
    <section className="page-shell">
      <div>
        <p className="eyebrow">{t.loginRequired.eyebrow}</p>
        <h1>{t.loginRequired.title}</h1>
        <p>{t.loginRequired.desc}</p>
        <button className="pill-btn primary" type="button" onClick={openLogin}>
          <LogIn size={18} /> {t.loginRequired.action}
        </button>
      </div>
    </section>
  )
}

export function FavoritesPage({ resources }: { resources: Resource[] }) {
  const { t } = useI18n()
  const favorites = resources.filter((item) => item.id && localStorage.getItem(`favorited_${item.id}`) === "true")

  return (
    <section className="page-shell favorites-page">
      <SectionTitle title={t.profile.favoritesTitle} />
      {favorites.length ? (
        <div className="campaign-grid">
          {favorites.map((item) => (
            <CampaignCard key={item.id || item.title} item={item as Resource} variant={item.type === "campaign" ? "project" : "case"} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{t.profile.noFavorites}</p>
        </div>
      )}
    </section>
  )
}

export function CategoryPage({ category, resources, onSubmit }: { category: typeof categories[0]; resources: Resource[]; onSubmit: (categoryId?: string) => void }) {
  const { t } = useI18n()
  const list = resources.filter((r) => r.category === category.id)
  const cases = resources.filter((r) => r.category === category.id && r.type === "campaign")
  const [filters, setFilters] = useState<ProjectFilterState>(defaultProjectFilters)
  const filteredCases = filterProjects(cases, filters)
  const Icon = category.icon
  const sectionTitle = category.id === "applications" ? t.pages.scienceProjects : category.id === "activities" ? t.pages.activityTopics : t.pages.educationProjects

  return (
    <section className="page-shell">
      <CategoryHero category={category} badge={<><Icon size={34} /><span>{list.length}{t.pages.itemCount}</span></>} />

      <section className="case-section">
        <SectionTitle
          title={sectionTitle}
          action={
            <button className="add-project-button" type="button" onClick={() => onSubmit(category.id)}>
              <Plus size={19} />
              <span>{t.pages.addProject}</span>
            </button>
          }
        />
        <ProjectFilters filters={filters} onChange={setFilters} categoryId={category.id} />
        {filteredCases.length ? (
          <div className="campaign-grid">
            {filteredCases.map((c) => <CampaignCard key={c.title} item={c as Resource} variant="project" />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>{cases.length ? t.pages.noProjectMatch : t.pages.noProjectItems}</p>
          </div>
        )}
      </section>

    </section>
  )
}

export function CaseDetailPage({ resources, user, onDelete }: { resources: Resource[]; user: User | null; onDelete: (id: string) => void }) {
  const { t } = useI18n()
  const { caseId } = useParams()
  const navigate = useNavigate()
  const item = resources.find((c) => c.type === "campaign" && String(c.id) === caseId)
  const [fetchedResource, setFetchedResource] = useState<Resource | null>(null)
  useEffect(() => {
    if (!item && caseId && !fetchedResource) {
      resourceService.get(caseId).then((data) => {
        if (data.resource?.type === "campaign" || data.resource?.status === "published") {
          setFetchedResource(data.resource)
        }
      }).catch(() => {})
    }
  }, [caseId, item])
  const r = item || fetchedResource
  const category = categories.find((c) => c.id === r?.category)
  const canEdit = user && (user.role === "admin" || r?.userId === user.id)
  const steps = r?.campaignSteps && r.campaignSteps.length > 0 ? r.campaignSteps : []
  const { materialFiles } = useResourceFiles(r?.id)
  const resId = r?.id ? String(r.id) : ""
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

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
    if (!confirm(t.caseDetail.confirmDelete)) return
    onDelete(String(r!.id))
    navigate(category?.path || "/")
  }

  if (!r) {
    return (
      <section className="page-shell">
        <h1>{t.caseDetail.missingTitle}</h1>
        <p>{t.caseDetail.missingDesc}</p>
        <Link className="pill-btn secondary" to="/" style={{ width: "fit-content" }}>{t.caseDetail.backHome}</Link>
      </section>
    )
  }

  const locationParts = [r.locationCountry, r.locationProvince, r.locationCity].filter(Boolean).join(" / ")
  const locationLabel = r.locationType?.split(",").join("、")
  const sitePhotoIdList = r.sitePhotoIds ? r.sitePhotoIds.split(",").filter(Boolean) : []
  const heroImage = r.image || "/images/classroom.jpg"

  return (
    <section className="page-shell case-detail">
      <div className="case-hero has-bg" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-content">
          <h1>{r.title}</h1>
          {r.team && <p className="hero-team">{r.team}</p>}
          {r.contact && <p className="hero-contact">{r.contact}</p>}
        </div>
        <button className="hero-close" type="button" onClick={() => navigate(-1)} aria-label={t.caseDetail.close}>×</button>
      </div>

      <div className="case-detail-grid">
        <div className="case-detail-left">
          <article className="case-detail-card">
            <h2>{t.caseDetail.intro}</h2>
            <p>{r.desc || t.caseDetail.fallbackDesc}</p>
          </article>

          {sitePhotoIdList.length > 0 && (
            <article className="case-detail-card">
              <h2>{t.caseDetail.sitePhotos}</h2>
              <div className={`site-photos-grid format-${r.sitePhotosFormat === "双图" ? "double" : r.sitePhotosFormat === "四宫格" ? "quad" : "single"}`}>
                {(() => {
                  const labels = r.sitePhotosFormat === "单图" ? [t.submitPage.slotPhoto] : r.sitePhotosFormat === "双图" ? [t.submitPage.slotLeft, t.submitPage.slotRight] : [t.submitPage.slotTopLeft, t.submitPage.slotTopRight, t.submitPage.slotBottomLeft, t.submitPage.slotBottomRight]
                  return labels.map((label, i) => (
                    <div key={i} className="site-photo-slot">
                      {sitePhotoIdList[i] ? (
                        <div className="site-photo-preview">
                          <button type="button" className="site-photo-preview-button" onClick={() => setPreviewImageUrl(fileService.downloadUrl(sitePhotoIdList[i]))}>
                            <img src={fileService.downloadUrl(sitePhotoIdList[i])} alt={label} />
                          </button>
                        </div>
                      ) : (
                        <div className="site-photo-slot empty" />
                      )}
                    </div>
                  ))
                })()}
              </div>
            </article>
          )}
        </div>

        <aside className="case-side">
          <h2>{t.caseDetail.info}</h2>
          <p><strong>{t.caseDetail.category}</strong><span>{category ? (t.categories[category.id]?.name ?? category.name) : ""}</span></p>
          {r.subcategory && <p><strong>{t.submitPage.subcategory}</strong><span>{r.subcategory}</span></p>}
          {r.audience && <p><strong>{t.filters.audience}</strong><span>{r.audience}</span></p>}
          {r.canParticipate && <p><strong>{t.caseDetail.canParticipate}</strong><span>{r.canParticipate === "yes" ? t.caseDetail.canJoin : t.caseDetail.cannotJoin}</span></p>}
          {locationLabel && <p><strong>{t.caseDetail.location}</strong><span>{[locationLabel, locationParts].filter(Boolean).join(" · ")}</span></p>}
          {r.eventDate && <p><strong>{t.caseDetail.date}</strong><span>{r.eventDate}</span></p>}
          {r.timeLimitType && <p><strong>{t.caseDetail.timeLimit}</strong><span>{r.timeLimitType}</span></p>}
          {r.timeRangeStart && r.timeRangeEnd && <p><strong>{t.caseDetail.timeRangeStart} – {t.caseDetail.timeRangeEnd}</strong><span>{r.timeRangeStart} ~ {r.timeRangeEnd}</span></p>}
          {r.duration && <p><strong>{t.caseDetail.lectureDuration}</strong><span>{r.duration}</span></p>}
          {r.format && <p><strong>{t.caseDetail.format}</strong><span>{r.format}</span></p>}
          {steps.length > 0 && (
            <div className="case-side-materials">
              <strong>{t.caseDetail.downloadMaterials}</strong>
              {steps.map((step) =>
                step.files.length > 0 && (
                  <div key={step.id} className="side-step-files">
                    <span>{step.text}</span>
                    {step.files.map((f) => (
                      <a key={f.fileId} className="tag-file-link"
                        href={fileService.downloadUrl(f.fileId)}
                        target="_blank" rel="noopener noreferrer"
                      ><Download size={12} /> {f.name}</a>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </aside>
      </div>

      {r.introductionContent && (
        <section className="case-detail-card">
          <h2>{t.caseDetail.introBook}</h2>
          <div className="markdown-body"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(marked.parse(r.introductionContent) as string)
            }}
          />
        </section>
      )}

      {r.tips && (
        <section className="case-detail-card">
          <h2>{t.caseDetail.tips}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{r.tips}</p>
        </section>
      )}

      {canEdit && r.id && (
        <div className="detail-actions">
          <button className="edit-button" type="button" onClick={() => navigate(`/resource/${r.id}/edit`)}>
            {t.caseDetail.edit}
          </button>
          <button className="delete-button" type="button" onClick={handleDelete}>
            <Trash2 size={16} /> {t.caseDetail.delete}
          </button>
        </div>
      )}

      <div className="detail-footer-bar">
        <div className="detail-footer-actions">
          <button className={`detail-action-btn ${likedByMe ? "active" : ""}`} type="button" onClick={handleLike} disabled={!user}>
            <ThumbsUp size={18} />
            <span>{likedByMe ? t.caseDetail.liked : t.caseDetail.like}</span>
            {likesCount > 0 && <span className="count-badge">{likesCount}</span>}
          </button>
          <button className={`detail-action-btn ${favoritedByMe ? "active" : ""}`} type="button" onClick={handleFavorite} disabled={!user}>
            <Star size={18} className={favoritedByMe ? "star-filled" : ""} />
            <span>{favoritedByMe ? t.caseDetail.favorited : t.caseDetail.favorite}</span>
            {favoritesCount > 0 && <span className="count-badge">{favoritesCount}</span>}
          </button>
        </div>
        {(r.team || r.contact) && (
          <div className="detail-footer-team">
            {r.team && <strong>{r.team}</strong>}
            {r.contact && <span>{r.contact}</span>}
          </div>
        )}
      </div>

      {r.id && <CommentSection resourceId={r.id} user={user} />}
      {previewImageUrl && (
        <div className="image-preview-modal" role="dialog" aria-modal="true" onClick={() => setPreviewImageUrl(null)}>
          <button type="button" className="image-preview-close" onClick={() => setPreviewImageUrl(null)}>×</button>
          <img src={previewImageUrl} alt={t.caseDetail.sitePhotos} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  )
}
