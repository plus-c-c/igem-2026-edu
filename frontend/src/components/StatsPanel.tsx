import type { Resource } from "../types"

export function StatsPanel({ resources }: { resources: Resource[] }) {
  return (
    <section className="stats-panel">
      <div><strong>{resources.length}</strong><span>已收录资源</span></div>
      <div><strong>5</strong><span>核心栏目</span></div>
      <div><strong>6</strong><span>项目材料</span></div>
      <div><strong>2+</strong><span>高校团队</span></div>
    </section>
  )
}
