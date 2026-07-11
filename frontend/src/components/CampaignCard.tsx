import { Link } from "react-router-dom"
import type { Resource } from "../types"
import { useI18n } from "../i18n"
import { Translatable } from "./Translatable"

interface CampaignCardProps {
  item: Resource
  variant?: "case" | "project"
}

const defaultPoster = "/images/classroom.jpg"

export function CampaignCard({ item, variant = "case" }: CampaignCardProps) {
  const { t } = useI18n()
  const coverImage = item.image || defaultPoster

  if (variant === "project") {
    const row1: string[] = []
    const row2: string[] = []

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

    return (
      <Link className="campaign-card project-card" to={`/cases/${item.id}`}>
        <img src={coverImage} alt="" />
        {canJoin && <span className="tag-can-join">{t.campaignCard.canJoin}</span>}
        <div>
          {item.team && <p className="project-org">{item.team}</p>}
          <h3><Translatable text={item.title} as="span" /></h3>
          <div className="project-event-tags">
            {row1.map((tag) => <span key={tag}><Translatable text={tag} as="span" caseMode="lower" /></span>)}
          </div>
          <div className="project-event-tags">
            {row2.map((tag) => <span key={tag}><Translatable text={tag} as="span" caseMode="lower" /></span>)}
          </div>
          <div style={{ flex: 1 }} />
          <span className="detail-link">{t.caseDetail.detailLink}</span>
        </div>
      </Link>
    )
  }

  return (
    <Link className="campaign-card" to={`/cases/${item.id}`}>
      <img src={coverImage} alt="" />
      <div>
        <p className="campaign-format"><Translatable text={item.format} as="span" caseMode="lower" /></p>
        <h3><Translatable text={item.title} as="span" /></h3>
        {item.impact && <strong><Translatable text={item.impact} as="span" /></strong>}
        <div className="tags">
          {(item.materials || []).map((m) => <span key={m}><Translatable text={m} as="span" caseMode="lower" /></span>)}
        </div>
        <span className="detail-link">{t.caseDetail.detailLink}</span>
      </div>
    </Link>
  )
}
