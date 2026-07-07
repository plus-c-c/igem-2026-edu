import type { Resource } from "../types"
import { API_BASE, authHeaders, authFetch } from "./client"

export const resourceService = {
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
