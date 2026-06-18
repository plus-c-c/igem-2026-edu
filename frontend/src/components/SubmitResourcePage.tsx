import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Upload } from "lucide-react"
import type { User, Resource } from "../types"
import { categories } from "../data/categories"
import { materialTypes, deliveryOptions, audienceOptions, participationOptions } from "../data/constants"
import { resourceApi } from "../api"
import { MaterialChecklist } from "./MaterialChecklist"

interface SubmitResourcePageProps {
  user: User
  addResource: (resource: Partial<Resource>) => void
}

export function SubmitResourcePage({ user, addResource }: SubmitResourcePageProps) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const [selected, setSelected] = useState<string[]>([])
  const [files, setFiles] = useState<Record<string, string>>({})
  const [durationMode, setDurationMode] = useState("")
  const defaultCategory = params.get("category") || "synbio"

  const toggleMaterial = (material: string) => {
    setSelected((prev) =>
      prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]
    )
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const uploaded = Object.entries(files).filter(([, name]) => name).map(([type, name]) => `${type}: ${name}`)
    const duration = data.get("durationMode") === "limited"
      ? `${data.get("startDate")} 至 ${data.get("endDate")}`
      : "长期可行"

    addResource({
      category: data.get("category") as string,
      team: data.get("team") as string,
      organization: data.get("team") as string,
      title: data.get("title") as string,
      negotiator: data.get("negotiator") as string,
      acceptsOthers: data.get("acceptsOthers") as string,
      delivery: data.get("delivery") as string,
      duration,
      location: data.get("location") as string,
      reimbursement: data.get("reimbursement") as string,
      contact: data.get("contact") as string,
      audience: data.get("audience") as string,
      desc: `${data.get("desc")}${uploaded.length ? ` 已上传：${uploaded.join("；")}` : ""}`,
      materials: selected,
    })
  }

  return (
    <section className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Submit</p>
          <h1>教育项目招募</h1>
          <p>当前登录团队：{user.teamName}。</p>
        </div>
      </div>

      <form className="submit-form" onSubmit={submit}>
        <div className="form-grid">
          <label>机构名称<input name="team" required defaultValue={user.teamName} /></label>
          <label>项目名称<input name="title" required placeholder="例如：合成生物学是什么？" /></label>
          <label>主要洽谈队伍<input name="negotiator" required placeholder="例如：Westlake iGEM / ZJU iGEM" /></label>
          <label className="category-field">
            所属栏目
            <select name="category" defaultValue={defaultCategory}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <fieldset className="choice-group">
            <legend>是否接受其他队伍参与</legend>
            <div>
              {participationOptions.map((opt) => (
                <label key={opt.value}>
                  <input type="radio" name="acceptsOthers" value={opt.value} required /> {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="choice-group">
            <legend>线上/线下要求</legend>
            <div>
              {deliveryOptions.map((opt) => (
                <label key={opt}><input type="radio" name="delivery" value={opt} required /> {opt}</label>
              ))}
            </div>
          </fieldset>
          <label className="audience-field">
            目标受众
            <select name="audience" required defaultValue="">
              <option value="" disabled>请选择目标受众</option>
              {audienceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
          <fieldset className="choice-group">
            <legend>活动时限</legend>
            <div>
              <label>
                <input type="radio" name="durationMode" value="limited" required
                  checked={durationMode === "limited"}
                  onChange={(e) => setDurationMode(e.target.value)}
                /> 有时限
              </label>
              <label>
                <input type="radio" name="durationMode" value="long" required
                  checked={durationMode === "long"}
                  onChange={(e) => setDurationMode(e.target.value)}
                /> 长期可行
              </label>
            </div>
            {durationMode === "limited" && (
              <div className="date-range">
                <label>开始日期<input type="date" name="startDate" required /></label>
                <label>结束日期<input type="date" name="endDate" required /></label>
              </div>
            )}
          </fieldset>
          <label className="location-field">活动地点<input name="location" required placeholder="填写国家、省份和城市" /></label>
          <label className="reimbursement-field">报销情况<input name="reimbursement" required placeholder="例如：交通可报销 / 不报销 / 待确认" /></label>
          <label className="contact-field">机构联系方式<input name="contact" required placeholder="邮箱、微信或联系人电话" /></label>
          <label className="desc-field wide">活动简介和要求<textarea name="desc" required placeholder="简要说明活动内容、形式、教育目标和合作要求" /></label>
        </div>

        <MaterialChecklist selected={selected} onToggle={toggleMaterial} />

        <div className="upload-grid">
          {selected.map((material) => (
            <label key={material} className="upload-tile">
              <Upload size={18} />
              {material} 上传
              <input type="file" onChange={(e) => setFiles((prev) => ({ ...prev, [material]: e.target.files?.[0]?.name || "" }))} />
              {files[material] && <span>{files[material]}</span>}
            </label>
          ))}
        </div>

        <div className="form-actions">
          <Link className="secondary-action" to="/resources">取消</Link>
          <button className="primary-action compact" type="submit" disabled={!selected.length}>发布招募</button>
        </div>
      </form>
    </section>
  )
}
