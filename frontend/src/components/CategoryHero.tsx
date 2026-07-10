import type { ReactNode } from "react"
import type { Category } from "../types"
import { useI18n } from "../i18n"

interface CategoryHeroProps {
  category: Category
  badge?: ReactNode
  gradient?: string
  intro?: string
  className?: string
}

export function CategoryHero({ category, badge, gradient, intro, className }: CategoryHeroProps) {
  const { t } = useI18n()
  const bg = gradient || "linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))"
  const cat = t.categories[category.id]

  return (
    <div
      className={`category-hero${className ? " " + className : ""}`}
      style={{ backgroundImage: `${bg}, url(${category.image})` }}
    >
      <div>
        <p className="eyebrow">{cat?.short ?? category.short}</p>
        <h1>{cat?.name ?? category.name}</h1>
        <p>{intro ?? cat?.intro ?? category.intro}</p>
      </div>
      {badge && <div className="category-badge">{badge}</div>}
    </div>
  )
}
