import { Link } from "react-router-dom"
import type { Resource } from "../types"
import { useI18n } from "../i18n"

interface CampaignCardProps {
  item: Resource
  variant?: "case" | "project"
}

function uploadedMaterialCount(item: Resource) {
  const stepFileCount = item.campaignSteps?.reduce((sum, step) => sum + step.files.length, 0) || 0
  const sitePhotoCount = item.sitePhotoIds?.split(",").filter(Boolean).length || 0
  return Math.min(8, stepFileCount + sitePhotoCount)
}

export function CampaignCard({ item, variant = "case" }: CampaignCardProps) {
  const { t } = useI18n()

  if (variant === "project") {
    const row1: string[] = []
    const row2: string[] = []

    if (item.subcategory) row1.push(item.subcategory)
    if (item.timeLimitType) row1.push(item.timeLimitType)

    if (item.locationType) {
      const types = item.locationType.split(",")
      if (types.includes("线上") && types.includes("线下")) {
        row1.push(t.campaignCard.onlineOffline)
      } else {
        types.forEach((tag) => row1.push(tag))
      }
    }

    const isOffline = item.locationType?.includes("线下")
    if (isOffline && item.locationCity) row1.push(item.locationCity)

    if (item.eventDate) row2.push(item.eventDate)
    if (item.format) row2.push(item.format)
    const canJoin = item.canParticipate === "yes"
    const uploadedCount = uploadedMaterialCount(item)

    return (
      <Link className="campaign-card project-card" to={`/cases/${item.id}`}>
        {item.image ? <img src={item.image} alt="" /> : <div className="card-img-placeholder" />}
        <span className="project-material-progress" aria-hidden="true">
          <span className="project-material-progress-fill" style={{ width: `${(uploadedCount / 8) * 100}%` }} />
        </span>
        <div>
          {item.team && <p className="project-org">{item.team}</p>}
          <h3>{item.title}</h3>
          <div className="project-event-tags">
            {row1.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="project-event-tags">
            {row2.map((tag) => <span key={tag}>{tag}</span>)}
            {canJoin && <span className="tag-can-join">{t.campaignCard.canJoin}</span>}
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
