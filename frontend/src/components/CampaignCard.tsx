import { Link } from "react-router-dom"
import type { Resource } from "../types"
import { projectMetaByCategory } from "../data/projectMeta"

export function caseSlug(title: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  if (slug) return slug
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i)
    hash |= 0
  }
  return `project-${Math.abs(hash).toString(36)}`
}

interface CampaignCardProps {
  item: Resource
  variant?: "case" | "project"
}

export function CampaignCard({ item, variant = "case" }: CampaignCardProps) {
  const meta = projectMetaByCategory[item.category as keyof typeof projectMetaByCategory] || projectMetaByCategory.applications
  const project = {
    organization: (item as any).organization || meta.organization,
    kind: (item as any).kind || meta.kind,
    delivery: (item as any).delivery || meta.delivery,
    region: (item as any).region || meta.region,
    duration: (item as any).duration || meta.duration,
    venue: (item as any).venue || meta.venue,
  }

  if (variant === "project") {
    return (
      <Link className="campaign-card project-card" to={`/cases/${caseSlug(item.title)}`}>
        {item.image ? <img src={item.image} alt="" /> : <div className="card-img-placeholder" />}
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
    )
  }

  return (
    <Link className="campaign-card" to={`/cases/${caseSlug(item.title)}`}>
      {item.image ? <img src={item.image} alt="" /> : <div className="card-img-placeholder" />}
      <div>
        <p className="campaign-format">{item.format}</p>
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
        <strong>{item.impact}</strong>
        <div className="tags">
          {item.materials.map((m) => <span key={m}>{m}</span>)}
        </div>
        <span className="detail-link">查看项目详情</span>
      </div>
    </Link>
  )
}
