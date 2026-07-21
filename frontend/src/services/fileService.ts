import type { UploadedFile } from "../types"
import { API_BASE, authHeaders, authFetch, onUnauthorized } from "./client"
import { tr } from "../i18n"

export const fileService = {
  upload: async (resourceId: string, file: File, materialLabel?: string) => {
    const form = new FormData()
    form.append("file", file)
    if (materialLabel) form.append("materialLabel", materialLabel)
    const res = await authFetch(`${API_BASE}/resources/${resourceId}/files`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const msg = data?.message || (res.status === 413 ? tr("errors.fileTooLarge") : tr("errors.fileUploadFailed"))
      throw new Error(msg)
    }
    return data
  },

  uploadWithProgress: (resourceId: string, file: File, materialLabel?: string, onProgress?: (pct: number) => void, timeoutMs = 300000): Promise<any> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const form = new FormData()
      form.append("file", file)
      if (materialLabel) form.append("materialLabel", materialLabel)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) return resolve(data)
          if (xhr.status === 401 && onUnauthorized) onUnauthorized()
          const msg = data?.message || (xhr.status === 413 ? tr("errors.fileTooLarge") : tr("errors.fileUploadFailed"))
          reject(new Error(msg))
        } catch { reject(new Error(tr("errors.uploadParseFailed"))) }
      }

      xhr.onerror = () => reject(new Error(tr("errors.uploadNetworkError")))
      xhr.ontimeout = () => reject(new Error(tr("errors.uploadTimeout")))
      xhr.timeout = timeoutMs

      xhr.open("POST", `${API_BASE}/resources/${resourceId}/files`)
      for (const [k, v] of Object.entries(authHeaders())) xhr.setRequestHeader(k, v)
      xhr.send(form)
    }),

  list: async (resourceId: string): Promise<UploadedFile[]> => {
    const res = await fetch(`${API_BASE}/resources/${resourceId}/files`)
    const data = await res.json()
    return data.files || []
  },

  remove: async (resourceId: string, fileId: string) => {
    const res = await authFetch(`${API_BASE}/resources/${resourceId}/files/${fileId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    return res.json()
  },

  downloadUrl: (fileId: string) => `${API_BASE}/resources/files/${fileId}/download`,
}
