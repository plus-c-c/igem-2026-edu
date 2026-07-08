import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Upload, Loader2, Plus, Trash2 } from "lucide-react"
import type { User, Resource } from "../types"
import { categories } from "../data/categories"
import { materialTags } from "../data/constants"
import { worldCountries, worldRegions, worldCities } from "../data/locations"
import { resourceService } from "../services/resourceService"
import { fileService } from "../services/fileService"

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
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
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

  // 活动信息
  const [canParticipate, setCanParticipate] = useState(editResource?.canParticipate || "yes")
  const [locationTypes, setLocationTypes] = useState<string[]>(editResource?.locationType ? editResource.locationType.split(",") : [])
  const [locationCountry, setLocationCountry] = useState(editResource?.locationCountry || "")
  const [locationProvince, setLocationProvince] = useState(editResource?.locationProvince || "")
  const [locationCity, setLocationCity] = useState(editResource?.locationCity || "")
  const [eventDate, setEventDate] = useState(editResource?.eventDate || "")
  const [timeLimitType, setTimeLimitType] = useState(editResource?.timeLimitType || "")
  // 现场照片
  const [sitePhotosFormat, setSitePhotosFormat] = useState(editResource?.sitePhotosFormat || "")
  const [sitePhotoFiles, setSitePhotoFiles] = useState<Record<string, { fileId: string; url: string }>>({})
  const [sitePhotoUploading, setSitePhotoUploading] = useState<string | null>(null)
  // 项目Tips
  const [tips, setTips] = useState(editResource?.tips || "")
  // 项目介绍书
  const [introductionContent, setIntroductionContent] = useState(editResource?.introductionContent || "")

  useEffect(() => {
    if (!isEdit || !editResource) return
    fileService.list(String(editResource.id)).then((files) => {
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
      }
      setExistingStepFiles(stepFiles)
    }).catch(() => {})
  }, [isEdit, editResource])
  const defaultCategory = params.get("category") || editResource?.category || "applications"
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory)
  const projectLabel = selectedCategory === "applications" ? "科普项目" : selectedCategory === "activities" ? "实践活动" : "教育项目"

  useEffect(() => {
    if (editResource) {
      setCampaignSteps(editResource.campaignSteps || [])
    }
    setCoverFileId(null)
    setExistingStepFiles({})
    setErrorMsg("")
    setCoverPreviewUrl(editResource?.image)
    coverUploadedUrl.current = undefined
    setDraftId(null)
    setSelectedCategory(defaultCategory)
    setCanParticipate(editResource?.canParticipate || "yes")
    setLocationTypes(editResource?.locationType ? editResource.locationType.split(",") : [])
    setLocationCountry(editResource?.locationCountry || "")
    setLocationProvince(editResource?.locationProvince || "")
    setLocationCity(editResource?.locationCity || "")
    setEventDate(editResource?.eventDate || "")
    setTimeLimitType(editResource?.timeLimitType || "")
    setSitePhotosFormat(editResource?.sitePhotosFormat || "")
    setSitePhotoFiles({})
    setTips(editResource?.tips || "")
    setIntroductionContent(editResource?.introductionContent || "")
  }, [editResource])

  const addStep = () => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
    setCampaignSteps((prev) => [...prev, { id, text: "", files: [] }])
  }

  const addStepWithTag = (tag: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
    setCampaignSteps((prev) => [...prev, { id, text: tag, files: [] }])
  }

  const removeStep = (stepId: string) => {
    setCampaignSteps((prev) => prev.filter((s) => s.id !== stepId))
  }

  const updateStepText = (stepId: string, text: string) => {
    setCampaignSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, text } : s))
  }

  const uploadStepFile = async (rid: string, stepId: string, file: File) => {
    const upRes = await fileService.uploadWithProgress(
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
    await fileService.remove(rid, fileId)
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
    const res = await resourceService.create({
      type: "campaign",
      category: defaultCategory,
      team: user.teamName,
      title: "",
      desc: "",
    })
    if (!res.resource) throw new Error("无法创建资源")
    setDraftId(res.resource.id)
    return res.resource.id
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
      const upRes = await fileService.uploadWithProgress(
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
    const upRes = await fileService.uploadWithProgress(
      rid, imgFile, "cover",
      (pct) => setImageUploadPct(pct)
    )
    return `/api/resources/files/${upRes.file.id}/download`
  }

  const handleSitePhotoUpload = async (slotIndex: number, file: File) => {
    const slotKey = String(slotIndex)
    setSitePhotoUploading(slotKey)
    try {
      const rid = await ensureRid()
      const objectUrl = URL.createObjectURL(file)
      setSitePhotoFiles((prev) => ({ ...prev, [slotKey]: { fileId: "", url: objectUrl } }))
      const upRes = await fileService.uploadWithProgress(rid, file, "site-photo")
      const url = `/api/resources/files/${upRes.file.id}/download`
      setSitePhotoFiles((prev) => ({ ...prev, [slotKey]: { fileId: upRes.file.id, url } }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : "现场照片上传失败"
      setErrorMsg(msg)
    }
    setSitePhotoUploading(null)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMsg("")
    try {
      const emptyStep = campaignSteps.find((s) => !s.text.trim())
      if (emptyStep) {
        throw new Error("请填写所有下载材料的材料类型")
      }
      const data = new FormData(event.currentTarget)

      const payload: Record<string, any> = {
        type: "campaign",
        category: data.get("category") as string,
        title: data.get("title") as string,
        team: data.get("team") as string || user.teamName,
        image: editResource?.image || "",
        desc: data.get("desc") as string,
        campaignSteps,
        canParticipate,
        locationType: locationTypes.join(","),
        locationCountry,
        locationProvince,
        locationCity,
        eventDate,
        timeLimitType,
        sitePhotosFormat,
        sitePhotoIds: Object.values(sitePhotoFiles).map((f) => f.fileId).filter(Boolean).join(","),
        tips,
        introductionContent,
      }

      let rid: string
      const hasDraft = isEdit || !!draftId

      if (hasDraft) {
        rid = isEdit ? String(editResource!.id) : draftId!
      } else {
        const res = await resourceService.create(payload)
        if (!res.resource) throw new Error(res.message || "发布失败")
        rid = res.resource.id
      }

      for (const step of campaignSteps) {
        const file = stepFileInputs.current[step.id]
        if (file) {
          const upRes = await fileService.uploadWithProgress(
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

      const res = await resourceService.update(rid, payload)
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
          <label>团队名称<input name="team" defaultValue={editResource?.team || user.teamName} /></label>
          <label>项目名称<input name="title" required placeholder='例如："合成生物学是什么？"' defaultValue={editResource?.title} /></label>
          <label>分类
            <select name="category" required value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="" disabled>请选择分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="wide" style={{ display: "grid", gap: "var(--label-spacing)" }}>
            <span>封面图片</span>
            <div className="site-photo-slot">
              {coverPreviewUrl ? (
                <div className="site-photo-preview">
                  <img src={coverPreviewUrl} alt="封面预览" />
                  <button type="button" className="site-photo-remove" disabled={coverDeleting}
                    onClick={async (e) => {
                      e.stopPropagation()
                      setCoverDeleting(true)
                      try {
                        const rid = isEdit ? String(editResource!.id) : draftId
                        if (rid && coverFileId) {
                          await fileService.remove(rid, coverFileId)
                        }
                        if (isEdit) {
                          await resourceService.update(String(editResource!.id), { image: "" })
                        }
                      } catch {}
                      setCoverDeleting(false)
                      setCoverPreviewUrl(undefined)
                      coverUploadedUrl.current = undefined
                      setCoverFileId(null)
                      imageFileRef.current = null
                    }}>
                    ×
                  </button>
                </div>
              ) : (
                <label className="site-photo-upload">
                  <Upload size={20} />
                  <span>上传封面图片</span>
                  <input type="file" accept="image/*" onChange={handleCoverFileChange} />
                </label>
              )}
            </div>
            {imageUploadPct !== undefined && (
              <div className="upload-progress-bar">
                <div className="upload-progress-fill" style={{ width: `${imageUploadPct}%` }} />
              </div>
            )}
          </label>

          <label className="wide">简介<textarea name="desc" required placeholder="简要说明活动内容、形式、教育目标和合作要求" defaultValue={editResource?.desc} /></label>
        </div>

        <section className="tips-section">
          <h2>项目Tips</h2>
          <textarea className="intro-textarea" placeholder="输入项目提示/备注" value={tips}
            onChange={(e) => setTips(e.target.value)} rows={4} />
        </section>

        <section className="event-info-section">
          <h2>活动信息</h2>
          <div className="event-info-grid">
            <label className="choice-group">是否可参与
              <div>
                {["可参与", "不可参与"].map((opt) => (
                  <label key={opt} className={canParticipate === (opt === "可参与" ? "yes" : "no") ? "active" : ""}>
                    <input type="radio" name="canParticipate" value={opt === "可参与" ? "yes" : "no"}
                      checked={canParticipate === (opt === "可参与" ? "yes" : "no")}
                      onChange={(e) => setCanParticipate(e.target.value)} />
                    {opt}
                  </label>
                ))}
              </div>
            </label>

            <label className="choice-group">地点
              <div>
                {["线上", "线下"].map((opt) => (
                  <label key={opt} className={locationTypes.includes(opt) ? "active" : ""}>
                    <input type="checkbox" value={opt}
                      checked={locationTypes.includes(opt)}
                      onChange={(e) => {
                        setLocationTypes((prev) =>
                          e.target.checked ? [...prev, opt] : prev.filter((v) => v !== opt)
                        )
                      }} />
                    {opt}
                  </label>
                ))}
              </div>
              {locationTypes.includes("线下") && (
                <div className="location-cascade">
                  <select value={locationCountry} onChange={(e) => { setLocationCountry(e.target.value); setLocationProvince(""); setLocationCity("") }}>
                    <option value="">选择国家</option>
                    {worldCountries.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  {locationCountry && worldRegions[locationCountry] && (
                    <select value={locationProvince} onChange={(e) => { setLocationProvince(e.target.value); setLocationCity("") }}>
                      <option value="">选择省/州</option>
                      {worldRegions[locationCountry].map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                  )}
                  {locationProvince && worldCities[`${locationCountry}|${locationProvince}`] && (
                    <select value={locationCity} onChange={(e) => setLocationCity(e.target.value)}>
                      <option value="">选择城市</option>
                      {worldCities[`${locationCountry}|${locationProvince}`].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                </div>
              )}
            </label>

            <label>时间
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </label>

            <label className="choice-group">时限
              <div>
                {["有时限", "无时限"].map((opt) => (
                  <label key={opt} className={timeLimitType === opt ? "active" : ""}>
                    <input type="radio" name="timeLimitType" value={opt}
                      checked={timeLimitType === opt}
                      onChange={(e) => setTimeLimitType(e.target.value)} />
                    {opt}
                  </label>
                ))}
              </div>
            </label>
          </div>
        </section>

        <section className="step-editor">
          <div className="step-editor-header">
            <h2>下载材料</h2>
          </div>
          <div className="step-button-grid">
            {materialTags.map((t) => (
              <button key={t} type="button" className="pill-btn primary" onClick={() => addStepWithTag(t)}>
                {t}
              </button>
            ))}
            <button type="button" className="pill-btn primary" onClick={addStep}>
              <Plus size={16} /> 其他材料
            </button>
          </div>
          <div className="step-grid">
            {campaignSteps.map((step, i) => (
              <div key={step.id} className="step-block">
                <div className="step-block-header">
                  <input className="step-text-input" placeholder="材料类型" value={step.text}
                    onChange={(e) => updateStepText(step.id, e.target.value)} />
                  <button type="button" className="file-delete-btn" onClick={() => removeStep(step.id)} title="删除">
                    <Trash2 size={14} />
                  </button>
                </div>
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

        <section className="site-photos-section">
          <h2>现场照片</h2>
          <div className="choice-group">
            <span className="field-label">照片格式</span>
            <div>
              {["单图", "双图", "四宫格"].map((opt) => (
                <label key={opt} className={sitePhotosFormat === opt ? "active" : ""}>
                  <input type="radio" name="sitePhotosFormat" value={opt}
                    checked={sitePhotosFormat === opt}
                    onChange={(e) => { setSitePhotosFormat(e.target.value); setSitePhotoFiles({}) }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          {sitePhotosFormat && (
            <div className={`site-photos-grid format-${sitePhotosFormat === "单图" ? "single" : sitePhotosFormat === "双图" ? "double" : "quad"}`}>
              {(() => {
                const slots = sitePhotosFormat === "单图" ? ["照片"] : sitePhotosFormat === "双图" ? ["左", "右"] : ["左上", "右上", "左下", "右下"]
                return slots.map((label, i) => {
                  const slotKey = String(i)
                  const file = sitePhotoFiles[slotKey]
                  return (
                    <div key={slotKey} className="site-photo-slot">
                      {file ? (
                        <div className="site-photo-preview">
                          <img src={file.url} alt={label} />
                          <button type="button" className="site-photo-remove"
                            onClick={() => {
                              setSitePhotoFiles((prev) => { const n = { ...prev }; delete n[slotKey]; return n })
                            }}>×</button>
                        </div>
                      ) : (
                        <label className="site-photo-upload">
                          <Upload size={20} />
                          <span>{label}</span>
                          <input type="file" accept="image/*" disabled={sitePhotoUploading !== null}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSitePhotoUpload(i, f); e.target.value = "" }} />
                        </label>
                      )}
                      {sitePhotoUploading === slotKey && (
                        <div className="upload-progress-bar">
                          <div className="upload-progress-fill" style={{ width: "60%" }} />
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </section>

        <section className="introduction-section">
          <h2>项目介绍书</h2>
          <textarea className="intro-textarea" placeholder="输入项目介绍书内容" value={introductionContent}
            onChange={(e) => setIntroductionContent(e.target.value)} rows={8} />
        </section>

        {errorMsg && (
          <div className="modal-backdrop" onClick={() => { setErrorMsg(""); setSubmitting(false) }}>
            <div className="error-modal" onClick={(e) => e.stopPropagation()}>
              <p>{errorMsg}</p>
              <button className="pill-btn primary" onClick={() => { setErrorMsg(""); setSubmitting(false) }}>确定</button>
            </div>
          </div>
        )}
        <div className="form-actions">
          <Link className="pill-btn secondary" to={isEdit ? `/cases/${editResource!.id}` : "/"}>
            {isEdit ? "返回" : "取消"}
          </Link>
          <button className="pill-btn primary" type="submit" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="spin" /> 保存中...</> : isEdit ? "保存修改" : "发布教育项目"}
          </button>
        </div>
      </form>
    </section>
  )
}
