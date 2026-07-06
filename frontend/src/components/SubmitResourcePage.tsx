import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Upload, Loader2, Plus, Trash2 } from "lucide-react"
import type { User, Resource } from "../types"
import { categories } from "../data/categories"
import { deliveryOptions, audienceOptions, participationOptions } from "../data/constants"
import { resourceApi, fileApi } from "../api"
import { MaterialChecklist } from "./MaterialChecklist"

interface SubmitResourcePageProps {
  user: User
  addResource: (resource: Partial<Resource>) => void
  updateResource?: (id: string, resource: Partial<Resource>) => void
  editResource?: Resource | null
}

function parseDuration(duration?: string) {
  if (!duration || duration === "长期可行") return { mode: "long" as const }
  return { mode: "limited" as const }
}

export function SubmitResourcePage({ user, addResource, updateResource, editResource }: SubmitResourcePageProps) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const isEdit = !!editResource
  const [resourceType, setResourceType] = useState<"normal" | "campaign">(
    (editResource?.type as "normal" | "campaign") || params.get("type") as "normal" | "campaign" || "normal"
  )
  const isCampaign = resourceType === "campaign"
  const [selected, setSelected] = useState<string[]>(editResource?.materials || [])
  const fileInputs = useRef<Record<string, File | null>>({})
  const dur = parseDuration(editResource?.duration)
  const [durationMode, setDurationMode] = useState<"long" | "limited">(dur.mode)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [existingFiles, setExistingFiles] = useState<Record<string, { id: string; name: string; size: number }[]>>({})
  const [deleting, setDeleting] = useState<string | null>(null)
  const imageFileRef = useRef<File | null>(null)
  const [imageUploadPct, setImageUploadPct] = useState<number | undefined>(undefined)
  const [coverFileId, setCoverFileId] = useState<string | null>(null)
  const [coverDeleting, setCoverDeleting] = useState(false)
  const [campaignSteps, setCampaignSteps] = useState<{ id: string; text: string; files: { fileId: string; name: string }[] }[]>(
    (editResource?.campaignSteps || [])
  )
  const stepFileInputs = useRef<Record<string, File | null>>({})
  const [stepUploadProgress, setStepUploadProgress] = useState<Record<string, number>>({})
  const [stepDeleting, setStepDeleting] = useState<string | null>(null)
  const [existingStepFiles, setExistingStepFiles] = useState<Record<string, { id: string; name: string }[]>>({})

  useEffect(() => {
    if (!isEdit || !editResource) return
    fileApi.list(String(editResource.id)).then((files) => {
      const grouped: Record<string, { id: string; name: string; size: number }[]> = {}
      const stepFiles: Record<string, { id: string; name: string }[]> = {}
      for (const f of files) {
        if (f.materialLabel === "cover") {
          setCoverFileId(f.id)
          continue
        }
        if (f.materialLabel?.startsWith("campaign-step-")) {
          const stepId = f.materialLabel.replace("campaign-step-", "")
          if (!stepFiles[stepId]) stepFiles[stepId] = []
          stepFiles[stepId].push({ id: f.id, name: f.originalName })
          continue
        }
        const key = f.materialLabel || "其他"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({ id: f.id, name: f.originalName, size: f.size })
      }
      setExistingFiles(grouped)
      setExistingStepFiles(stepFiles)
    }).catch(() => {})
  }, [isEdit, editResource])
  const defaultCategory = params.get("category") || editResource?.category || "synbio"

  useEffect(() => {
    if (editResource) {
      setSelected(editResource.materials || [])
      setDurationMode(parseDuration(editResource.duration).mode)
      setResourceType((editResource.type as "normal" | "campaign") || "normal")
      setCampaignSteps(editResource.campaignSteps || [])
    }
    setCoverFileId(null)
    setExistingStepFiles({})
    setErrorMsg("")
  }, [editResource])

  const toggleMaterial = (material: string) => {
    setSelected((prev) =>
      prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]
    )
  }

  const addStep = () => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
    setCampaignSteps((prev) => [...prev, { id, text: "", files: [] }])
  }

  const removeStep = (stepId: string) => {
    setCampaignSteps((prev) => prev.filter((s) => s.id !== stepId))
  }

  const updateStepText = (stepId: string, text: string) => {
    setCampaignSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, text } : s))
  }

  const uploadStepFile = async (rid: string, stepId: string, file: File) => {
    const upRes = await fileApi.uploadWithProgress(
      rid, file, `campaign-step-${stepId}`,
      (pct) => setStepUploadProgress((p) => ({ ...p, [stepId]: pct }))
    )
    const newFile = { fileId: upRes.file.id, name: upRes.file.originalName }
    setCampaignSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, files: [...s.files, newFile] } : s))
    setExistingStepFiles((prev) => {
      const next = { ...prev }
      if (!next[stepId]) next[stepId] = []
      next[stepId] = [...next[stepId], { id: upRes.file.id, name: upRes.file.originalName }]
      return next
    })
  }

  const deleteStepFile = async (rid: string, stepId: string, fileId: string) => {
    setStepDeleting(fileId)
    await fileApi.remove(rid, fileId)
    setCampaignSteps((prev) => prev.map((s) =>
      s.id === stepId ? { ...s, files: s.files.filter((f) => f.fileId !== fileId) } : s
    ))
    setExistingStepFiles((prev) => {
      const next = { ...prev }
      if (next[stepId]) next[stepId] = next[stepId].filter((f) => f.id !== fileId)
      if (!next[stepId]?.length) delete next[stepId]
      return next
    })
    setStepDeleting(null)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMsg("")
    try {
      const data = new FormData(event.currentTarget)
      const duration = isCampaign ? "" : (data.get("durationMode") === "limited"
        ? `${data.get("startDate")} 至 ${data.get("endDate")}`
        : "长期可行")

      const payload: Record<string, any> = {
        type: resourceType,
        category: data.get("category") as string,
        title: data.get("title") as string,
        materials: selected,
      }

      if (isCampaign) {
        payload.team = data.get("team") as string || user.teamName
        payload.subtitle = data.get("subtitle") as string
        payload.image = editResource?.image || ""
        payload.format = data.get("format") as string
        payload.impact = data.get("impact") as string
        payload.desc = data.get("desc") as string
        payload.campaignSteps = campaignSteps
      } else {
        payload.team = data.get("team") as string
        payload.negotiator = data.get("negotiator") as string
        payload.acceptsOthers = data.get("acceptsOthers") as string
        payload.delivery = data.get("delivery") as string
        payload.duration = duration
        payload.location = data.get("location") as string
        payload.reimbursement = data.get("reimbursement") as string
        payload.contact = data.get("contact") as string
        payload.audience = data.get("audience") as string
        payload.desc = data.get("desc") as string
      }

      const uploadImage = async (rid: string): Promise<string | undefined> => {
        const imgFile = imageFileRef.current
        if (!isCampaign || !imgFile) return
        const upRes = await fileApi.uploadWithProgress(
          rid, imgFile, "cover",
          (pct) => setImageUploadPct(pct)
        )
        return `/api/resources/files/${upRes.file.id}/download`
      }

      const uploadStepFiles = async (rid: string) => {
        for (const step of campaignSteps) {
          const file = stepFileInputs.current[step.id]
          if (file) {
            await uploadStepFile(rid, step.id, file)
          }
        }
      }

      if (isEdit && editResource) {
        const rid = String(editResource.id)
        for (const material of selected) {
          const file = fileInputs.current[material]
          if (file) {
            await fileApi.uploadWithProgress(
              rid, file, material,
              (pct) => setUploadProgress((p) => ({ ...p, [material]: pct }))
            )
          }
        }
        await uploadStepFiles(rid)
        const imgUrl = await uploadImage(rid)
        if (imgUrl) payload.image = imgUrl
        const res = await resourceApi.update(rid, payload)
        if (!res.resource) throw new Error(res.message || "修改失败")
        updateResource?.(rid, res.resource)
      } else {
        const res = await resourceApi.create(payload)
        if (!res.resource) throw new Error(res.message || "发布失败")
        const rid = res.resource.id
        for (const material of selected) {
          const file = fileInputs.current[material]
          if (file) {
            await fileApi.uploadWithProgress(
              rid, file, material,
              (pct) => setUploadProgress((p) => ({ ...p, [material]: pct }))
            )
          }
        }
        await uploadStepFiles(rid)
        const imgUrl = await uploadImage(rid)
        if (imgUrl) {
          const upRes = await resourceApi.update(rid, { ...payload, image: imgUrl })
          if (upRes.resource) res.resource = upRes.resource
        }
        addResource(res.resource)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "操作失败，请重试"
      setErrorMsg(msg)
      setSubmitting(false)
    }
  }

  return (
    <section className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{isEdit ? "Edit" : "Submit"}</p>
          <h1>{isEdit ? "编辑项目招募" : "教育项目招募"}</h1>
          <p>当前登录团队：{user.teamName}。</p>
        </div>
      </div>

      <form className="submit-form" onSubmit={submit}>
        <div className="type-toggle">
          <label className={resourceType === "normal" ? "active" : ""}>
            <input type="radio" name="resourceType" value="normal"
              checked={resourceType === "normal"}
              onChange={() => setResourceType("normal")}
              disabled={isEdit} /> 教育项目
          </label>
          <label className={resourceType === "campaign" ? "active" : ""}>
            <input type="radio" name="resourceType" value="campaign"
              checked={resourceType === "campaign"}
              onChange={() => setResourceType("campaign")}
              disabled={isEdit} /> 演示案例
          </label>
        </div>

        <div className="form-grid">
          <label>机构名称<input name="team" defaultValue={editResource?.team || user.teamName} /></label>
          <label>项目名称<input name="title" required placeholder="例如：合成生物学是什么？" defaultValue={editResource?.title} /></label>
          <label>分类
            <select name="category" required defaultValue={defaultCategory}>
              <option value="" disabled>请选择分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          {isCampaign ? (
            <>
              <label>副标题<input name="subtitle" placeholder="例如：从 DNA 到细胞工厂" defaultValue={editResource?.subtitle} /></label>
              <label>活动形式<input name="format" required placeholder="例如：90 分钟入门课" defaultValue={editResource?.format} /></label>
              <label>展示价值<input name="impact" required placeholder="例如：适合 40-80 人课堂" defaultValue={editResource?.impact} /></label>
              <div className="image-upload-block">
                <label className="image-upload-tile">
                  <Upload size={20} />
                  上传封面图片
                  <input type="file" accept="image/*" onChange={(e) => { imageFileRef.current = e.target.files?.[0] || null; setImageUploadPct(undefined) }} />
                  {imageFileRef.current && <span>{imageFileRef.current.name}</span>}
                </label>
                {editResource?.image && (
                  <div className="image-preview">
                    <img src={editResource.image} alt="当前封面" />
                    <span>
                      当前封面
                      {coverFileId && (
                        <button type="button" className="file-delete-btn" disabled={coverDeleting}
                          onClick={async (e) => {
                            e.stopPropagation()
                            setCoverDeleting(true)
                            await fileApi.remove(String(editResource.id), coverFileId)
                            setCoverFileId(null)
                            setCoverDeleting(false)
                            window.location.reload()
                          }}
                        >×</button>
                      )}
                    </span>
                  </div>
                )}
                {imageUploadPct !== undefined && (
                  <div className="upload-progress-bar">
                    <div className="upload-progress-fill" style={{ width: `${imageUploadPct}%` }} />
                    <span>{imageUploadPct}%</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <label>主要洽谈队伍<input name="negotiator" required placeholder="例如：Westlake iGEM / ZJU iGEM" defaultValue={editResource?.negotiator} /></label>
              <fieldset className="choice-group">
                <legend>是否接受其他队伍参与</legend>
                <div>
                  {participationOptions.map((opt) => (
                    <label key={opt.value}>
                      <input type="radio" name="acceptsOthers" value={opt.value} required
                        defaultChecked={editResource?.acceptsOthers === opt.value} /> {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="choice-group">
                <legend>线上/线下要求</legend>
                <div>
                  {deliveryOptions.map((opt) => (
                    <label key={opt}>
                      <input type="radio" name="delivery" value={opt} required
                        defaultChecked={editResource?.delivery === opt} /> {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="audience-field">
                目标受众
                <select name="audience" required defaultValue={editResource?.audience || ""}>
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
                      onChange={(e) => setDurationMode(e.target.value as "long" | "limited")}
                    /> 有时限
                  </label>
                  <label>
                    <input type="radio" name="durationMode" value="long" required
                      checked={durationMode === "long"}
                      onChange={(e) => setDurationMode(e.target.value as "long" | "limited")}
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
              <label className="location-field">活动地点<input name="location" required placeholder="填写国家、省份和城市" defaultValue={editResource?.location} /></label>
              <label className="reimbursement-field">报销情况<input name="reimbursement" required placeholder="例如：交通可报销 / 不报销 / 待确认" defaultValue={editResource?.reimbursement} /></label>
              <label className="contact-field">机构联系方式<input name="contact" required placeholder="邮箱、微信或联系人电话" defaultValue={editResource?.contact} /></label>
            </>
          )}

          <label className="desc-field wide">简介<textarea name="desc" required={!isCampaign} placeholder="简要说明活动内容、形式、教育目标和合作要求" defaultValue={editResource?.desc} /></label>
        </div>

        {isCampaign && (
          <section className="step-editor">
            <div className="step-editor-header">
              <h2>展示内容</h2>
              <button type="button" className="primary-action compact" onClick={addStep}>
                <Plus size={16} /> 添加板块
              </button>
            </div>
            <div className="step-grid">
              {campaignSteps.map((step, i) => (
                <div key={step.id} className="step-block">
                  <div className="step-block-header">
                    <strong>{String(i + 1).padStart(2, "0")}</strong>
                    <button type="button" className="file-delete-btn" onClick={() => removeStep(step.id)} title="删除板块">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input className="step-text-input" placeholder="输入板块描述" value={step.text}
                    onChange={(e) => updateStepText(step.id, e.target.value)} />
                  <label className="upload-tile step-upload-tile">
                    <Upload size={16} />
                    上传文件
                    <input type="file" onChange={(e) => { stepFileInputs.current[step.id] = e.target.files?.[0] || null }} />
                    {stepFileInputs.current[step.id] && <span>{stepFileInputs.current[step.id]!.name}</span>}
                  </label>
                  {existingStepFiles[step.id]?.map((f) => (
                    <span key={f.id} className="existing-file">
                      {f.name}
                      {isEdit && (
                        <button type="button" className="file-delete-btn" disabled={stepDeleting === f.id}
                          onClick={(e) => { e.stopPropagation(); deleteStepFile(String(editResource!.id), step.id, f.id) }}
                        >×</button>
                      )}
                    </span>
                  ))}
                  {stepUploadProgress[step.id] !== undefined && (
                    <div className="upload-progress-bar">
                      <div className="upload-progress-fill" style={{ width: `${stepUploadProgress[step.id]}%` }} />
                      <span>{stepUploadProgress[step.id]}%</span>
                    </div>
                  )}
                  {step.files.map((f) => (
                    !existingStepFiles[step.id]?.some((ef) => ef.id === f.fileId) && (
                      <span key={f.fileId} className="existing-file">{f.name}</span>
                    )
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        <MaterialChecklist selected={selected} onToggle={toggleMaterial} />

        <div className="upload-grid">
          {selected.map((material) => {
            const progress = uploadProgress[material]
            const existing = existingFiles[material]
            return (
              <label key={material} className="upload-tile">
                <Upload size={18} />
                {material} 上传
                <input type="file" onChange={(e) => { fileInputs.current[material] = e.target.files?.[0] || null }} />
                {fileInputs.current[material] && <span>{fileInputs.current[material]!.name}</span>}
                {existing?.map((f) => (
                  <span key={f.id} className="existing-file">
                    {f.name}
                    {isEdit && (
                      <button type="button" className="file-delete-btn" disabled={deleting === f.id}
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (!editResource) return
                          setDeleting(f.id)
                          await fileApi.remove(String(editResource.id), f.id)
                          setExistingFiles((prev) => {
                            const next = { ...prev }
                            next[material] = (next[material] || []).filter((x) => x.id !== f.id)
                            if (!next[material]?.length) delete next[material]
                            return next
                          })
                          setDeleting(null)
                        }}
                      >×</button>
                    )}
                  </span>
                ))}
                {progress !== undefined && (
                  <div className="upload-progress-bar">
                    <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
                    <span>{progress}%</span>
                  </div>
                )}
              </label>
            )
          })}
        </div>

        {errorMsg && (
          <div className="modal-backdrop" onClick={() => { setErrorMsg(""); setSubmitting(false) }}>
            <div className="error-modal" onClick={(e) => e.stopPropagation()}>
              <p>{errorMsg}</p>
              <button className="primary-action compact" onClick={() => { setErrorMsg(""); setSubmitting(false) }}>确定</button>
            </div>
          </div>
        )}
        <div className="form-actions">
          <Link className="secondary-action" to={isEdit ? `/resource/${editResource!.id}` : "/resources"}>{isEdit ? "返回" : "取消"}</Link>
          <button className="primary-action compact" type="submit" disabled={!selected.length || submitting}>
            {submitting ? <><Loader2 size={16} className="spin" /> 保存中...</> : isEdit ? "保存修改" : resourceType === "campaign" ? "发布案例" : "发布招募"}
          </button>
        </div>
      </form>
    </section>
  )
}
