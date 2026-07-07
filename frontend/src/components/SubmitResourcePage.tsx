import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Upload, Loader2, Plus, Trash2 } from "lucide-react"
import type { User, Resource } from "../types"
import { categories } from "../data/categories"
import { resourceApi, fileApi } from "../api"
import { MaterialChecklist } from "./MaterialChecklist"
import { caseSlug } from "./CampaignCard"

interface SubmitResourcePageProps {
  user: User
  addResource: (resource: Partial<Resource>) => void
  updateResource?: (id: string, resource: Partial<Resource>) => void
  editResource?: Resource | null
}

export function SubmitResourcePage({ user, addResource, updateResource, editResource }: SubmitResourcePageProps) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const isEdit = !!editResource
  const [selected, setSelected] = useState<string[]>(editResource?.materials || [])
  const fileInputs = useRef<Record<string, File | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [existingFiles, setExistingFiles] = useState<Record<string, { id: string; name: string; size: number }[]>>({})
  const [deleting, setDeleting] = useState<string | null>(null)
  const imageFileRef = useRef<File | null>(null)
  const [imageUploadPct, setImageUploadPct] = useState<number | undefined>(undefined)
  const [coverFileId, setCoverFileId] = useState<string | null>(null)
  const [coverDeleting, setCoverDeleting] = useState(false)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | undefined>(editResource?.image)
  const coverUploadedUrl = useRef<string | undefined>(undefined)
  const [campaignSteps, setCampaignSteps] = useState<{ id: string; text: string; files: { fileId: string; name: string }[] }[]>(
    (editResource?.campaignSteps || [])
  )
  const stepFileInputs = useRef<Record<string, File | null>>({})
  const [stepUploadProgress, setStepUploadProgress] = useState<Record<string, number>>({})
  const [stepDeleting, setStepDeleting] = useState<string | null>(null)
  const [existingStepFiles, setExistingStepFiles] = useState<Record<string, { id: string; name: string }[]>>({})
  const [draftId, setDraftId] = useState<string | null>(null)

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
  const defaultCategory = params.get("category") || editResource?.category || "applications"
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory)
  const projectLabel = selectedCategory === "applications" ? "科普项目" : selectedCategory === "activities" ? "实践活动" : "教育项目"

  useEffect(() => {
    if (editResource) {
      setSelected(editResource.materials || [])
      setCampaignSteps(editResource.campaignSteps || [])
    }
    setCoverFileId(null)
    setExistingStepFiles({})
    setErrorMsg("")
    setCoverPreviewUrl(editResource?.image)
    coverUploadedUrl.current = undefined
    setDraftId(null)
    setSelectedCategory(defaultCategory)
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

  const ensureRid = async (): Promise<string> => {
    if (isEdit) return String(editResource!.id)
    if (draftId) return draftId
    const res = await resourceApi.create({ type: "campaign", category: defaultCategory })
    if (!res.resource) throw new Error("无法创建资源")
    setDraftId(res.resource.id)
    return res.resource.id
  }

  const handleMaterialFileChange = async (material: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    fileInputs.current[material] = file
    setUploadProgress((p) => ({ ...p, [material]: 0 }))
    try {
      const rid = await ensureRid()
      const upRes = await fileApi.uploadWithProgress(
        rid, file, material,
        (pct) => setUploadProgress((p) => ({ ...p, [material]: pct }))
      )
      setExistingFiles((prev) => {
        const next = { ...prev }
        if (!next[material]) next[material] = []
        next[material] = [...next[material], { id: upRes.file.id, name: upRes.file.originalName, size: upRes.file.size }]
        return next
      })
      fileInputs.current[material] = null
    } catch (e) {
      const msg = e instanceof Error ? e.message : `${material} 文件上传失败`
      setErrorMsg(msg)
    }
  }

  const handleStepFileChange = async (stepId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    stepFileInputs.current[stepId] = file
    setStepUploadProgress((p) => ({ ...p, [stepId]: 0 }))
    try {
      const rid = await ensureRid()
      await uploadStepFile(rid, stepId, file)
      stepFileInputs.current[stepId] = null
    } catch (e) {
      const msg = e instanceof Error ? e.message : "步骤文件上传失败"
      setErrorMsg(msg)
    }
  }

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    imageFileRef.current = file
    setImageUploadPct(0)
    const objectUrl = URL.createObjectURL(file)
    setCoverPreviewUrl(objectUrl)
    try {
      const rid = await ensureRid()
      const upRes = await fileApi.uploadWithProgress(
        rid, file, "cover",
        (pct) => setImageUploadPct(pct)
      )
      const url = `/api/resources/files/${upRes.file.id}/download`
      coverUploadedUrl.current = url
      setCoverPreviewUrl(url)
      setCoverFileId(upRes.file.id)
      imageFileRef.current = null
    } catch (e) {
      const msg = e instanceof Error ? e.message : "封面上传失败"
      setErrorMsg(msg)
    }
  }

  const uploadImage = async (rid: string): Promise<string | undefined> => {
    const imgFile = imageFileRef.current
    if (!imgFile) return
    const upRes = await fileApi.uploadWithProgress(
      rid, imgFile, "cover",
      (pct) => setImageUploadPct(pct)
    )
    return `/api/resources/files/${upRes.file.id}/download`
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMsg("")
    try {
      const data = new FormData(event.currentTarget)

      const payload: Record<string, any> = {
        type: "campaign",
        category: data.get("category") as string,
        title: data.get("title") as string,
        materials: selected,
        team: data.get("team") as string || user.teamName,
        subtitle: data.get("subtitle") as string,
        image: editResource?.image || "",
        format: data.get("format") as string,
        impact: data.get("impact") as string,
        desc: data.get("desc") as string,
        campaignSteps,
      }

      let rid: string
      const hasDraft = isEdit || !!draftId

      if (hasDraft) {
        rid = isEdit ? String(editResource!.id) : draftId!
      } else {
        const res = await resourceApi.create(payload)
        if (!res.resource) throw new Error(res.message || "发布失败")
        rid = res.resource.id
      }

      for (const material of selected) {
        const file = fileInputs.current[material]
        if (file) {
          await fileApi.uploadWithProgress(
            rid, file, material,
            (pct) => setUploadProgress((p) => ({ ...p, [material]: pct }))
          )
          fileInputs.current[material] = null
        }
      }

      for (const step of campaignSteps) {
        const file = stepFileInputs.current[step.id]
        if (file) {
          const upRes = await fileApi.uploadWithProgress(
            rid, file, `campaign-step-${step.id}`,
            (pct) => setStepUploadProgress((p) => ({ ...p, [step.id]: pct }))
          )
          const newFile = { fileId: upRes.file.id, name: upRes.file.originalName }
          setCampaignSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, files: [...s.files, newFile] } : s))
          setExistingStepFiles((prev) => {
            const next = { ...prev }
            if (!next[step.id]) next[step.id] = []
            next[step.id] = [...next[step.id], { id: upRes.file.id, name: upRes.file.originalName }]
            return next
          })
          const targetStep = (payload.campaignSteps as any[]).find((s: any) => s.id === step.id)
          if (targetStep) targetStep.files = [...targetStep.files, newFile]
          stepFileInputs.current[step.id] = null
        }
      }

      if (!coverUploadedUrl.current) {
        const imgUrl = await uploadImage(rid)
        if (imgUrl) payload.image = imgUrl
      } else {
        payload.image = coverUploadedUrl.current
      }

      const res = await resourceApi.update(rid, payload)
      if (!res.resource) throw new Error(res.message || "保存失败")

      if (isEdit) {
        updateResource?.(rid, res.resource)
      } else {
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
          <h1>{isEdit ? `编辑${projectLabel}` : `发布${projectLabel}`}</h1>
          <p>当前登录团队：{user.teamName}。</p>
        </div>
      </div>

      <form className="submit-form" onSubmit={submit}>
        <div className="form-grid">
          <label>机构名称<input name="team" defaultValue={editResource?.team || user.teamName} /></label>
          <label>项目名称<input name="title" required placeholder='例如："合成生物学是什么？"' defaultValue={editResource?.title} /></label>
          <label>分类
            <select name="category" required value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="" disabled>请选择分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label>副标题<input name="subtitle" placeholder="例如：从 DNA 到细胞工厂" defaultValue={editResource?.subtitle} /></label>
          <label>活动形式<input name="format" required placeholder="例如：90 分钟入门课" defaultValue={editResource?.format} /></label>
          <label>展示价值<input name="impact" required placeholder="例如：适合 40-80 人课堂" defaultValue={editResource?.impact} /></label>

          <div className="image-upload-block">
            <label className="image-upload-tile">
              <Upload size={20} />
              上传封面图片
              <input type="file" accept="image/*" onChange={handleCoverFileChange} />
              {imageFileRef.current && !coverUploadedUrl.current && <span>{imageFileRef.current.name}</span>}
            </label>
            {coverPreviewUrl && (
              <div className="image-preview">
                <img src={coverPreviewUrl} alt="封面预览" />
                <span>
                  当前封面
                  <button type="button" className="file-delete-btn" disabled={coverDeleting}
                    onClick={async (e) => {
                      e.stopPropagation()
                      setCoverDeleting(true)
                      try {
                        const rid = isEdit ? String(editResource!.id) : draftId
                        if (rid && coverFileId) {
                          await fileApi.remove(rid, coverFileId)
                        }
                        if (isEdit) {
                          await resourceApi.update(String(editResource!.id), { image: "" })
                        }
                      } catch {}
                      setCoverDeleting(false)
                      setCoverPreviewUrl(undefined)
                      coverUploadedUrl.current = undefined
                      setCoverFileId(null)
                      imageFileRef.current = null
                    }}
                  >×</button>
                </span>
              </div>
            )}
            {imageUploadPct !== undefined && (
              <div className="upload-progress-bar">
                <div className="upload-progress-fill" style={{ width: `${imageUploadPct}%` }} />
              </div>
            )}
          </div>

          <label className="wide">简介<textarea name="desc" required placeholder="简要说明活动内容、形式、教育目标和合作要求" defaultValue={editResource?.desc} /></label>
        </div>

        <section className="step-editor">
          <div className="step-editor-header">
            <h2>展示内容</h2>
            <button type="button" className="pill-btn primary" style={{ fontSize: 14, padding: "8px 16px" }} onClick={addStep}>
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
                  <input type="file" onChange={(e) => handleStepFileChange(step.id, e)} />
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

        <MaterialChecklist selected={selected} onToggle={toggleMaterial} />

        <div className="upload-grid">
          {selected.map((material) => {
            const progress = uploadProgress[material]
            const existing = existingFiles[material]
            return (
              <label key={material} className="upload-tile">
                <Upload size={18} />
                {material} 上传
                <input type="file" onChange={(e) => handleMaterialFileChange(material, e)} />
                {fileInputs.current[material] && !existing?.length && <span>{fileInputs.current[material]!.name}</span>}
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
              <button className="pill-btn primary" onClick={() => { setErrorMsg(""); setSubmitting(false) }}>确定</button>
            </div>
          </div>
        )}
        <div className="form-actions">
          <Link className="pill-btn secondary" to={isEdit ? `/cases/${caseSlug(editResource!.title)}` : "/"}>
            {isEdit ? "返回" : "取消"}
          </Link>
          <button className="pill-btn primary" type="submit" disabled={!selected.length || submitting}>
            {submitting ? <><Loader2 size={16} className="spin" /> 保存中...</> : isEdit ? "保存修改" : "发布教育项目"}
          </button>
        </div>
      </form>
    </section>
  )
}
