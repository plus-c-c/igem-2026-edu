import type { ReactNode } from "react"
import type { Category } from "../types"

interface CategoryHeroProps {
  category: Category
  badge?: ReactNode
  gradient?: string
  intro?: string
  className?: string
}

export function CategoryHero({ category, badge, gradient, intro, className }: CategoryHeroProps) {
  const bg = gradient || "linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))"

  return (
    <div
      className={`category-hero${className ? " " + className : ""}`}
      style={{ backgroundImage: `${bg}, url(${category.image})` }}
    >
      <div>
        <p className="eyebrow">{category.short}</p>
        <h1>{category.name}</h1>
        <p>{intro ?? category.intro}</p>
      </div>
      {badge && <div className="category-badge">{badge}</div>}
    </div>
  )
}
