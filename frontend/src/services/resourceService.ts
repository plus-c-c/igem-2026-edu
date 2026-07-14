import type { Resource } from "../types"
import { API_BASE, authHeaders, authFetch, fetchWithTimeout } from "./client"

export interface ResourceDetailResult {
  resource: Resource
  likedByMe: boolean
  favoritedByMe: boolean
}

export const resourceService = {
  list: async (filters: { category?: string; material?: string; team?: string; audience?: string; status?: string } = {}): Promise<Resource[]> => {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== "all") params.set("category", filters.category)
    if (filters.team) params.set("team", filters.team)
    if (filters.status) params.set("status", filters.status)
    const qs = params.toString()
    const token = localStorage.getItem("authToken")
    const headers: Record<string, string> = {}
    if (filters.status === "draft" && token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    const res = await fetchWithTimeout(`${API_BASE}/resources${qs ? `?${qs}` : ""}`, { headers })
    if (!res.ok) throw new Error(`请求失败 (${res.status})`)
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
    if (!res.ok) throw new Error(`请求失败 (${res.status})`)
    return res.json()
  },

  get: async (id: string): Promise<ResourceDetailResult> => {
    const res = await authFetch(`${API_BASE}/resources/${id}`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error(`请求失败 (${res.status})`)
    return res.json()
  },

  update: async (id: string, resource: Record<string, any>) => {
    const res = await authFetch(`${API_BASE}/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(resource),
    })
    if (!res.ok) throw new Error(`请求失败 (${res.status})`)
    return res.json()
  },

  remove: async (id: string) => {
    const res = await authFetch(`${API_BASE}/resources/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error(`请求失败 (${res.status})`)
    return res.json()
  },

  toggleFavorite: async (id: string, currentlyFavorited: boolean) => {
    if (currentlyFavorited) {
      const res = await authFetch(`${API_BASE}/resources/${id}/favorite`, {
        method: "DELETE",
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      return res.json()
    }
    const res = await authFetch(`${API_BASE}/resources/${id}/favorite`, {
      method: "POST",
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error(`请求失败 (${res.status})`)
    return res.json()
  },

  toggleLike: async (id: string, currentlyLiked: boolean) => {
    if (currentlyLiked) {
      const res = await authFetch(`${API_BASE}/resources/${id}/like`, {
        method: "DELETE",
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      return res.json()
    }
    const res = await authFetch(`${API_BASE}/resources/${id}/like`, {
      method: "POST",
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error(`请求失败 (${res.status})`)
    return res.json()
  },

  getMyFavorites: async (): Promise<Resource[]> => {
    const res = await authFetch(`${API_BASE}/resources/favorites`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error(`请求失败 (${res.status})`)
    const data = await res.json()
    return data.resources || []
  },
}
