import { useEffect, useState } from "react"
import { fileService } from "../services/fileService"
import type { UploadedFile } from "../types"

export function useResourceFiles(resourceId: string | number | undefined) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!resourceId) return
    setLoading(true)
    fileService.list(String(resourceId))
      .then((items) => setFiles(items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [resourceId])

  const refresh = () => {
    if (!resourceId) return
    fileService.list(String(resourceId)).then(setFiles).catch(() => {})
  }

  const materialFiles = () => {
    const grouped: Record<string, { id: string; name: string }[]> = {}
    for (const f of files) {
      if (f.materialLabel === "cover") continue
      if (f.materialLabel?.startsWith("campaign-step-")) continue
      const key = f.materialLabel || "其他"
      if (!grouped[key]) grouped[key] = []
      grouped[key].push({ id: f.id, name: f.originalName })
    }
    return grouped
  }

  const stepFiles = () => {
    const grouped: Record<string, { id: string; name: string; size: number }[]> = {}
    for (const f of files) {
      if (f.materialLabel?.startsWith("campaign-step-")) {
        const stepId = f.materialLabel.replace("campaign-step-", "")
        if (!grouped[stepId]) grouped[stepId] = []
        grouped[stepId].push({ id: f.id, name: f.originalName, size: f.size })
      }
    }
    return grouped
  }

  const coverFile = () => files.find((f) => f.materialLabel === "cover") || null

  const groupedByLabel = () => {
    const grouped: Record<string, { id: string; name: string; size: number }[]> = {}
    for (const f of files) {
      if (f.materialLabel === "cover") continue
      if (f.materialLabel?.startsWith("campaign-step-")) continue
      const key = f.materialLabel || "其他"
      if (!grouped[key]) grouped[key] = []
      grouped[key].push({ id: f.id, name: f.originalName, size: f.size })
    }
    return grouped
  }

  return { files, loading, refresh, materialFiles, stepFiles, coverFile, groupedByLabel }
}
