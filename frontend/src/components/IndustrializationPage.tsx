import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import type { Resource } from "../types"
import { categories } from "../data/categories"
import { useI18n } from "../i18n"
import { CampaignCard } from "./CampaignCard"
import { CategoryHero } from "./CategoryHero"
import { SectionTitle } from "./SectionTitle"

type ActiveTab = "forum" | "video"

interface VideoItem {
  team: string
  title: string
  tag: string
}

interface IndustrializationPageProps {
  resources: Resource[]
  user: unknown
  onSubmit: (categoryId?: string) => void
  initialTab?: ActiveTab
}

export function IndustrializationPage({ resources, onSubmit, initialTab = "forum" }: IndustrializationPageProps) {
  const { t } = useI18n()
  const category = categories.find((c) => c.id === "industrialization") || categories[0]
  const Icon = category.icon

  const [tab, setTab] = useState<ActiveTab>(initialTab)
  const [query, setQuery] = useState("")
  const [forumCat, setForumCat] = useState("全部")
  const [videoTopic, setVideoTopic] = useState("全部")

  const discussions = useMemo(
    () => (resources || []).filter((r) => r.category === "industrialization" && r.type === "discussion"),
    [resources],
  )
  const videos = (t.industrialization.videos || []) as VideoItem[]
  const categoriesList = (t.industrialization.categories || []) as string[]
  const videoTopics = (t.industrialization.videoTopics || []) as string[]

  const filteredDiscussions = useMemo(() => {
    return discussions.filter((d) => {
      if (forumCat !== "全部" && d.subcategory !== forumCat) return false
      if (query && ![d.title, d.team, d.subcategory].some((v) => v?.includes(query))) return false
      return true
    })
  }, [discussions, forumCat, query])

  const filteredVideos = useMemo(() => {
    const list = videos.map((v, idx) => ({ ...v, key: idx }))
    const queryMatch = query
      ? list.filter((v) => [v.title, v.team, v.tag].some((field) => field.includes(query)))
      : list
    const topicMatch = videoTopic !== "全部" ? queryMatch.filter((v) => v.tag === videoTopic) : queryMatch
    return topicMatch
  }, [videos, query, videoTopic])

  const currentSearchPlaceholder = tab === "forum"
    ? t.industrialization.searchPlaceholder
    : t.industrialization.searchPlaceholder.replace("讨论", "视频")

  return (
    <section className="page-shell industrialization-page">
      <CategoryHero category={category} badge={<><Icon size={34} /><span>{t.industrialization.badgeLabel}</span></>} />

      <section className="case-section">
        <SectionTitle
          title={t.categories.industrialization?.name ?? category.name}
          action={
            <button className="add-project-button" type="button" onClick={() => onSubmit("industrialization")}>
              <Plus size={19} />
              <span>{t.industrialization.addContent}</span>
            </button>
          }
        />
      </section>

      {/* Tab switcher */}
      <div className="ind-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "forum"}
          className={tab === "forum" ? "ind-tab active" : "ind-tab"}
          onClick={() => setTab("forum")}
        >
          {t.industrialization.forumTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "video"}
          className={tab === "video" ? "ind-tab active" : "ind-tab"}
          onClick={() => setTab("video")}
        >
          {t.industrialization.videoTab}
        </button>
      </div>

      {/* Search row */}
      <div className="ind-toolbar">
        <div className="search-input ind-search">
          <Search size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={currentSearchPlaceholder}
          />
        </div>
      </div>

      {tab === "forum" ? (
        <>
          <div className="ind-filter-row">
            {categoriesList.map((c) => (
              <button
                key={c}
                type="button"
                className={forumCat === c ? "ind-filter active" : "ind-filter"}
                onClick={() => setForumCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="campaign-grid">
            {filteredDiscussions.length ? (
              filteredDiscussions.map((d) => <CampaignCard key={d.id} item={d} variant="project" />)
            ) : (
              <div className="empty-state">
                <p>{t.pages.noProjectMatch}</p>
              </div>
            )}
          </div>

          <div className="ind-view-all">
            <Link to="/industrialization/discussions">{t.industrialization.viewAllDiscussions}</Link>
          </div>
        </>
      ) : (
        <>
          <div className="ind-filter-row">
            {videoTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                className={videoTopic === topic ? "ind-filter active" : "ind-filter"}
                onClick={() => setVideoTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="campaign-grid">
            {filteredVideos.length ? (
              filteredVideos.map((v) => (
                <Link key={v.key} className="campaign-card project-card" to={`/industrialization/video/${v.key + 1}`}>
                  <img src="/images/industrialization.jpg" alt="" />
                  <div>
                    <p className="project-org">{v.team}</p>
                    <h3>{v.title}</h3>
                    <div className="project-event-tags">
                      <span>{v.tag}</span>
                    </div>
                    <div style={{ flex: 1 }} />
                    <span className="detail-link">{t.caseDetail.detailLink}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <p>{t.pages.noProjectMatch}</p>
              </div>
            )}
          </div>

          <div className="ind-view-all">
            <Link to="/industrialization/videos">{t.industrialization.viewAllVideos}</Link>
          </div>
        </>
      )}

      {/* Learning ↔ Discussion connection */}
      <section className="ind-connect">
        <h2>{t.industrialization.connectTitle}</h2>
        <p>{t.industrialization.connectDesc}</p>
        <div className="ind-connect-links">
          <span>↺ {t.industrialization.connectVideoToDiscussion}</span>
          <span>↺ {t.industrialization.connectDiscussionToVideo}</span>
        </div>
      </section>
    </section>
  )
}