import type { Resource, UploadedFile } from "./types"

const API_BASE = "/api"

export let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, options)
  if (res.status === 401 && onUnauthorized) onUnauthorized()
  return res
}

export const authApi = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return res.json()
  },

  sendCode: async ({ email, name, password }: { email: string; name: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    })
    return res.json()
  },

  verifyRegister: async ({ email, code }: { email: string; code: string }) => {
    const res = await fetch(`${API_BASE}/auth/verify-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    })
    return res.json()
  },

  getMe: async (token: string) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json()
  },
}

export const resourceApi = {
  list: async (filters: { category?: string; material?: string; team?: string; audience?: string } = {}): Promise<Resource[]> => {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== "all") params.set("category", filters.category)
    if (filters.team) params.set("team", filters.team)
    const qs = params.toString()
    const res = await fetch(`${API_BASE}/resources${qs ? `?${qs}` : ""}`)
    const data = await res.json()
    let items: Resource[] = data.resources || []
    if (filters.material && filters.material !== "all") {
      items = items.filter((r) => r.materials?.includes(filters.material!))
    }
    if (filters.audience) {
      items = items.filter((r) => r.audience?.includes(filters.audience!))
    }
    return items
  },

  create: async (resource: Record<string, any>) => {
    const res = await authFetch(`${API_BASE}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(resource),
    })
    return res.json()
  },

  get: async (id: string) => {
    const res = await fetch(`${API_BASE}/resources/${id}`)
    return res.json()
  },

  update: async (id: string, resource: Record<string, any>) => {
    const res = await authFetch(`${API_BASE}/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(resource),
    })
    return res.json()
  },

  remove: async (id: string) => {
    const res = await authFetch(`${API_BASE}/resources/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    return res.json()
  },
}

export const fileApi = {
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
      const msg = data?.message || (res.status === 413 ? "文件大小超过 1GB 限制" : "文件上传失败")
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
          const msg = data?.message || (xhr.status === 413 ? "文件大小超过 1GB 限制" : "文件上传失败")
          reject(new Error(msg))
        } catch { reject(new Error("上传响应解析失败")) }
      }

      xhr.onerror = () => reject(new Error("网络错误，上传中断"))
      xhr.ontimeout = () => reject(new Error("上传超时，请重试"))
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
