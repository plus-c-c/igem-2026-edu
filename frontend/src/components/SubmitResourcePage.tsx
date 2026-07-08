import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Upload, Loader2, Plus, Trash2, Bold, Italic, Heading, List, Link2, Eye, Edit3, ImageIcon } from "lucide-react"
import type { User, Resource } from "../types"
import { categories } from "../data/categories"
import { materialTags } from "../data/constants"
import { worldCountries, worldRegions, worldCities } from "../data/locations"
import { resourceService } from "../services/resourceService"
import { fileService } from "../services/fileService"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { useI18n } from "../i18n"

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
  const { t } = useI18n()
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
  const [activityFormat, setActivityFormat] = useState(editResource?.format || "")
  // 现场照片
  const [sitePhotosFormat, setSitePhotosFormat] = useState(editResource?.sitePhotosFormat || "")
  const [sitePhotoFiles, setSitePhotoFiles] = useState<Record<string, { fileId: string; url: string }>>({})
  const [sitePhotoUploading, setSitePhotoUploading] = useState<string | null>(null)
  // 项目Tips
  const [tips, setTips] = useState(editResource?.tips || "")
  // 项目介绍书
  const [introductionContent, setIntroductionContent] = useState(editResource?.introductionContent || "")
  const [showIntroPreview, setShowIntroPreview] = useState(false)
  const [introImageUploading, setIntroImageUploading] = useState(false)
  const introTextareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const savingDraft = useRef(false)
  const [draftSaved, setDraftSaved] = useState(false)

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
  const projectLabel = selectedCategory === "applications" ? (t.submitPage.projectLabelApplications) : selectedCategory === "activities" ? (t.submitPage.projectLabelActivities) : (t.submitPage.projectLabelCooperation)

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
    setActivityFormat(editResource?.format || "")
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
    if (isEdit && editResource?.status === "published") {
      if (draftId) return draftId
      const res = await resourceService.create({
        type: "campaign",
        status: "draft",
        originalId: String(editResource.id),
        category: selectedCategory,
        team: user.teamName,
        title: "",
        desc: "",
      })
      if (!res.resource) throw new Error("创建草稿失败")
      setDraftId(res.resource.id)
      return res.resource.id
    }
    if (isEdit) return String(editResource!.id)
    if (draftId) return draftId
    const res = await resourceService.create({
      type: "campaign",
      category: defaultCategory,
      team: user.teamName,
      title: "",
      desc: "",
    })
    if (!res.resource) throw new Error(t.submitPage.createFailed || "无法创建资源")
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
      const msg = e instanceof Error ? e.message : (t.submitPage.stepFileFailed || "步骤文件上传失败")
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
      const msg = e instanceof Error ? e.message : (t.submitPage.coverUploadFailed || "封面上传失败")
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
      const msg = e instanceof Error ? e.message : (t.submitPage.photoUploadFailed || "现场照片上传失败")
      setErrorMsg(msg)
    }
    setSitePhotoUploading(null)
  }

  const insertMarkdown = (before: string, after = "") => {
    const ta = introTextareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    setIntroductionContent((prev) => {
      const selected = prev.slice(start, end)
      const inserted = before + selected + after
      return prev.slice(0, start) + inserted + prev.slice(end)
    })
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + (end - start))
    })
  }

  const handleIntroImagePaste = async (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files?.[0]
    if (!file?.type.startsWith("image/")) return
    e.preventDefault()
    const rid = draftId || editResource?.id
    if (!rid) return
    setIntroImageUploading(true)
    try {
      const upRes = await fileService.uploadWithProgress(String(rid), file, "intro-image")
      const url = fileService.downloadUrl(upRes.file.id)
      const ta = introTextareaRef.current
      if (ta) {
        const start = ta.selectionStart
        const md = `\n![${file.name}](${url})\n`
        setIntroductionContent((prev) => prev.slice(0, start) + md + prev.slice(ta.selectionEnd))
      }
    } catch { setErrorMsg(t.submitPage.imageUploadFailed || "图片上传失败") }
    setIntroImageUploading(false)
  }

  const doSubmit = async (isDraft: boolean) => {
    savingDraft.current = isDraft
    setSubmitting(true)
    setErrorMsg("")
    setDraftSaved(false)
    try {
      const emptyStep = campaignSteps.find((s) => !s.text.trim())
      if (emptyStep) {
        throw new Error(t.submitPage.emptyStepType || "请填写所有下载材料的材料类型")
      }

      const form = formRef.current
      if (!form) return
      const formData = new FormData(form)

      const payload: Record<string, any> = {
        type: "campaign",
        status: isDraft ? "draft" : "published",
        category: formData.get("category") as string || selectedCategory,
        title: formData.get("title") as string,
        team: formData.get("team") as string || user.teamName,
        image: editResource?.image || "",
        desc: formData.get("desc") as string,
        campaignSteps,
        canParticipate,
        locationType: locationTypes.join(","),
        locationCountry,
        locationProvince,
        locationCity,
        eventDate,
        timeLimitType,
        format: activityFormat,
        sitePhotosFormat,
        sitePhotoIds: Object.values(sitePhotoFiles).map((f) => f.fileId).filter(Boolean).join(","),
        tips,
        introductionContent,
      }

      const isEditingPublished = isEdit && editResource?.status === "published"
      const isEditingDraft = isEdit && editResource?.status === "draft"

      let rid: string

      if (isDraft && isEditingPublished) {
        if (draftId) {
          rid = draftId
          await resourceService.update(rid, payload)
        } else {
          const res = await resourceService.create({
            ...payload,
            status: "draft",
            originalId: String(editResource!.id),
          })
          if (!res.resource) throw new Error("创建草稿失败")
          rid = res.resource.id
          setDraftId(rid)
        }
      } else if (!isDraft && isEditingDraft && editResource?.originalId) {
        await resourceService.update(editResource.originalId, { ...payload, status: "published" })
        await resourceService.remove(String(editResource.id))
        const original = await resourceService.get(editResource.originalId)
        updateResource?.(editResource.originalId, original.resource)
        return
      } else {
        const hasDraft = isEdit || !!draftId
        if (hasDraft) {
          rid = isEditingDraft ? String(editResource!.id) : (isEdit ? String(editResource!.id) : draftId!)
          const res = await resourceService.update(rid, payload)
          if (!res.resource) throw new Error(res.message || (t.submitPage.saveFailed || "保存失败"))
        } else {
          const res = await resourceService.create(payload)
          if (!res.resource) throw new Error(res.message || (t.submitPage.publishFailed || "发布失败"))
          rid = res.resource.id
        }
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

      if (isDraft && !isEditingPublished) {
        await resourceService.update(rid, { image: payload.image })
      } else if (!isDraft && !isEditingDraft) {
        const res = await resourceService.update(rid, payload)
        if (!res.resource) throw new Error(res.message || "保存失败")
      }

      if (isDraft) {
        setDraftSaved(true)
        setSubmitting(false)
        return
      }

      if (!isEditingDraft || !editResource?.originalId) {
        const final = await resourceService.get(rid)
        if (isEdit) {
          updateResource?.(rid, final.resource)
        } else {
          addResource(final.resource)
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : (t.submitPage.operationFailed || "操作失败，请重试")
      setErrorMsg(msg)
      setSubmitting(false)
    }
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    doSubmit(false)
  }

  return (
    <section className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{isEdit ? "Edit" : "Submit"}</p>
          <h1>{isEdit ? `${t.submitPage.edit}${projectLabel}` : `${t.submitPage.submit}${projectLabel}`}</h1>
          <p>{t.submitPage.currentTeam}{user.teamName}。</p>
        </div>
      </div>

      <form ref={formRef} className="submit-form" onSubmit={submit}>
        <div className="form-grid">
          <label>{t.submitPage.teamName}<input name="team" defaultValue={editResource?.team || user.teamName} /></label>
          <label>{t.submitPage.projectName}<input name="title" required placeholder={t.submitPage.projectPlaceholder} defaultValue={editResource?.title} /></label>
          <label>{t.submitPage.category}
            <select name="category" required value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="" disabled>{t.submitPage.selectCategory}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="wide" style={{ display: "grid", gap: "var(--label-spacing)" }}>
            <span>{t.submitPage.coverImage}</span>
            <div className="site-photo-slot">
              {coverPreviewUrl ? (
                <div className="site-photo-preview">
                  <img src={coverPreviewUrl} alt={t.submitPage.coverPreview} />
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
                  <span>{t.submitPage.uploadCover}</span>
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

          <label className="wide">{t.submitPage.desc}<textarea name="desc" required placeholder={t.submitPage.descPlaceholder} defaultValue={editResource?.desc} /></label>
        </div>

        <section className="tips-section">
          <h2>{t.submitPage.tips}</h2>
          <textarea className="intro-textarea" placeholder={t.submitPage.tipsPlaceholder} value={tips}
            onChange={(e) => setTips(e.target.value)} rows={4} />
        </section>

        <section className="event-info-section">
          <h2>{t.submitPage.eventInfo}</h2>
          <div className="event-info-grid">
            <label className="choice-group wide">{t.submitPage.activityFormat}
              <div>
                {["讲座", "集市摊位", "路演", "其他"].map((opt) => (
                  <label key={opt} className={activityFormat === opt ? "active" : ""}>
                    <input type="radio" name="activityFormat" value={opt}
                      checked={activityFormat === opt}
                      onChange={(e) => setActivityFormat(e.target.value)} />
                    {opt}
                  </label>
                ))}
              </div>
            </label>

            <label className="choice-group">{t.submitPage.canParticipate}
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

            <label className="choice-group">{t.submitPage.location}
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
                    <option value="">{t.submitPage.selectCountry}</option>
                    {worldCountries.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  {locationCountry && worldRegions[locationCountry] && (
                    <select value={locationProvince} onChange={(e) => { setLocationProvince(e.target.value); setLocationCity("") }}>
                      <option value="">{t.submitPage.selectProvince}</option>
                      {worldRegions[locationCountry].map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                  )}
                  {locationProvince && worldCities[`${locationCountry}|${locationProvince}`] && (
                    <select value={locationCity} onChange={(e) => setLocationCity(e.target.value)}>
                      <option value="">{t.submitPage.selectCity}</option>
                      {worldCities[`${locationCountry}|${locationProvince}`].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                </div>
              )}
            </label>

            <label>{t.submitPage.date}
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </label>

            <label className="choice-group">{t.submitPage.timeLimit}
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

          <div className="step-editor">
            <h3>{t.submitPage.downloadMaterials}</h3>
          <div className="step-button-grid">
            {materialTags.map((t) => (
              <button key={t} type="button" className="pill-btn primary" onClick={() => addStepWithTag(t)}>
                {t}
              </button>
            ))}
            <button type="button" className="pill-btn primary" onClick={addStep}>
              <Plus size={16} /> {t.submitPage.otherMaterial}
            </button>
          </div>
          <div className="step-grid">
            {campaignSteps.map((step, i) => (
              <div key={step.id} className="step-block">
                <div className="step-block-header">
                  <input className="step-text-input" placeholder={t.submitPage.materialTypePlaceholder} value={step.text}
                    onChange={(e) => updateStepText(step.id, e.target.value)} />
                  <button type="button" className="file-delete-btn" onClick={() => removeStep(step.id)} title={t.submitPage.delete}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <label className="upload-tile step-upload-tile">
                  <Upload size={16} />
                  {t.submitPage.uploadFile}
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
        </div>
        </section>

        <section className="site-photos-section" style={{ marginTop: 0 }}>
          <h2>{t.submitPage.sitePhotos}</h2>
          <div className="choice-group">
            <span className="field-label">{t.submitPage.photoFormat}</span>
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
                const slots = sitePhotosFormat === "单图" ? [t.submitPage.slotPhoto] : sitePhotosFormat === "双图" ? [t.submitPage.slotLeft, t.submitPage.slotRight] : [t.submitPage.slotTopLeft, t.submitPage.slotTopRight, t.submitPage.slotBottomLeft, t.submitPage.slotBottomRight]
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
          <div className="intro-header">
            <h2>{t.submitPage.introBook}</h2>
            <div className="intro-header-actions">
              <span className="intro-upload-status">{introImageUploading ? t.submitPage.uploadingImage : ""}</span>
              <button type="button" className={`pill-btn ${showIntroPreview ? "secondary" : "primary"}`}
                onClick={() => setShowIntroPreview((p) => !p)}>
                {showIntroPreview ? <><Edit3 size={14} /> {t.submitPage.edit}</> : <><Eye size={14} /> {t.submitPage.preview}</>}
              </button>
            </div>
          </div>
          {showIntroPreview ? (
            <div className="markdown-preview"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(introductionContent || t.submitPage.emptyMarkdown) as string)
              }}
            />
          ) : (
            <>
              <div className="md-toolbar">
                <button type="button" onClick={() => insertMarkdown("**", "**")} title={t.submitPage.toolbarBold}><Bold size={14} /></button>
                <button type="button" onClick={() => insertMarkdown("*", "*")} title={t.submitPage.toolbarItalic}><Italic size={14} /></button>
                <button type="button" onClick={() => insertMarkdown("### ", "")} title={t.submitPage.toolbarHeading}><Heading size={14} /></button>
                <button type="button" onClick={() => insertMarkdown("- ")} title={t.submitPage.toolbarList}><List size={14} /></button>
                <button type="button" onClick={() => insertMarkdown("[", "](url)")} title={t.submitPage.toolbarLink}><Link2 size={14} /></button>
                <span className="md-toolbar-hint">{t.submitPage.toolbarHint}</span>
              </div>
              <textarea ref={introTextareaRef} className="intro-textarea" placeholder={t.submitPage.introPlaceholder}
                value={introductionContent}
                onChange={(e) => setIntroductionContent(e.target.value)}
                onPaste={handleIntroImagePaste} rows={10} />
            </>
          )}
        </section>

        {draftSaved && (
          <div className="modal-backdrop" onClick={() => setDraftSaved(false)}>
            <div className="error-modal" onClick={(e) => e.stopPropagation()}>
              <p>{t.submitPage.draftSaved}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
                <Link className="pill-btn secondary" to="/profile">{t.submitPage.viewDrafts}</Link>
                <button className="pill-btn primary" onClick={() => setDraftSaved(false)}>{t.submitPage.continue}</button>
              </div>
            </div>
          </div>
        )}
        {errorMsg && (
          <div className="modal-backdrop" onClick={() => { setErrorMsg(""); setSubmitting(false) }}>
            <div className="error-modal" onClick={(e) => e.stopPropagation()}>
              <p>{errorMsg}</p>
              <button className="pill-btn primary" onClick={() => { setErrorMsg(""); setSubmitting(false) }}>{t.submitPage.ok}</button>
            </div>
          </div>
        )}
        <div className="form-actions">
          <Link className="pill-btn secondary" to={isEdit ? `/cases/${editResource!.id}` : "/"}>
            {isEdit ? t.submitPage.back : t.submitPage.cancel}
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="pill-btn secondary" type="button" disabled={submitting}
              onClick={() => doSubmit(true)}>
              {submitting && savingDraft.current ? <><Loader2 size={16} className="spin" /> {t.submitPage.saving}</> : t.submitPage.saveDraft}
            </button>
            <button className="pill-btn primary" type="submit" disabled={submitting}>
              {submitting && !savingDraft.current ? <><Loader2 size={16} className="spin" /> {t.submitPage.saving}</> : isEdit ? t.submitPage.saveChanges : t.submitPage.publish}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
