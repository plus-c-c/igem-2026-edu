export function MaterialChecklist({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (material: string) => void
}) {
  const materialTypes = ["项目介绍书", "项目合作书", "实践建议", "现场照片", "项目 example"]

  return (
    <section className="material-checklist">
      <h2>项目材料</h2>
      <div>
        {materialTypes.map((material) => (
          <label key={material} className={selected.includes(material) ? "material active" : "material"}>
            <input type="checkbox" checked={selected.includes(material)} onChange={() => onToggle(material)} />
            {material}
          </label>
        ))}
      </div>
    </section>
  )
}
