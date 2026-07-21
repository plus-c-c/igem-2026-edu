export function SectionTitle({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
      {action && <div className="section-link">{action}</div>}
    </div>
  )
}
