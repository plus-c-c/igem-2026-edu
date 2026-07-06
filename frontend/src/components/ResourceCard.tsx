import { Link } from "react-router-dom"
import type { Resource } from "../types"
import { categories } from "../data/categories"
import { materialTypes } from "../data/constants"

export function ResourceCard({ resource }: { resource: Resource }) {
  const category = categories.find((c) => c.id === resource.category)
  const pct = Math.min(100, Math.round((resource.materials.length / materialTypes.length) * 100))

  return (
    <Link to={`/resource/${resource.id}`} className="resource-card">
      <div className="card-top">
        <span>{category?.name}</span>
        <small>{resource.updatedAt}</small>
      </div>
      <h3>{resource.title}</h3>
      <p className="meta">{resource.team} · {resource.audience}</p>
      <p>{resource.desc}</p>
      {(resource.delivery || resource.location || resource.duration || resource.reimbursement) && (
        <dl className="project-details">
          {resource.delivery && <div><dt>参与形式</dt><dd>{resource.delivery}</dd></div>}
          {resource.location && <div><dt>地区</dt><dd>{resource.location}</dd></div>}
          {resource.duration && <div><dt>时限</dt><dd>{resource.duration}</dd></div>}
          {resource.reimbursement && <div><dt>报销</dt><dd>{resource.reimbursement}</dd></div>}
        </dl>
      )}
      <div className="progress"><span style={{ width: `${pct}%` }} /></div>
      <div className="tags">
        {resource.materials.map((material) => (
          <span key={material}>{material}</span>
        ))}
      </div>
    </Link>
  )
}
