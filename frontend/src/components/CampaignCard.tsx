import { Link } from "react-router-dom"
import type { Resource } from "../types"
import { useI18n } from "../i18n"

interface CampaignCardProps {
  item: Resource
  variant?: "case" | "project"
}

export function CampaignCard({ item, variant = "case" }: CampaignCardProps) {
  const { t } = useI18n()

  if (variant === "project") {
    const row1: string[] = []
    const row2: string[] = []

    if (item.timeLimitType) row1.push(item.timeLimitType)

    if (item.locationType) {
      const types = item.locationType.split(",")
      if (types.includes("线上") && types.includes("线下")) {
        row1.push("线上/线下")
      } else {
        types.forEach((tag) => row1.push(tag))
      }
    }

    const isOffline = item.locationType?.includes("线下")
    if (isOffline && item.locationCity) row1.push(item.locationCity)

    if (item.eventDate) row2.push(item.eventDate)
    if (item.format) row2.push(item.format)
    const canJoin = item.canParticipate === "yes"

    return (
      <Link className="campaign-card project-card" to={`/cases/${item.id}`}>
        {item.image ? <img src={item.image} alt="" /> : <div className="card-img-placeholder" />}
        <div>
          {item.team && <p className="project-org">{item.team}</p>}
          <h3>{item.title}</h3>
          <div className="project-event-tags">
            {row1.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="project-event-tags">
            {row2.map((tag) => <span key={tag}>{tag}</span>)}
            {canJoin && <span className="tag-can-join">可参与</span>}
          </div>
          <span className="detail-link">{t.caseDetail.detailLink}</span>
        </div>
      </Link>
    )
  }

  return (
    <Link className="campaign-card" to={`/cases/${item.id}`}>
      {item.image ? <img src={item.image} alt="" /> : <div className="card-img-placeholder" />}
      <div>
        <p className="campaign-format">{item.format}</p>
        <h3>{item.title}</h3>
        <strong>{item.impact}</strong>
        <div className="tags">
          {(item.materials || []).map((m) => <span key={m}>{m}</span>)}
        </div>
        <span className="detail-link">{t.caseDetail.detailLink}</span>
      </div>
    </Link>
  )
}
