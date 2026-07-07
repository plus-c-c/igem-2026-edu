const API_BASE = "/api"

export let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb
}

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, options)
  if (res.status === 401 && onUnauthorized) onUnauthorized()
  return res
}

export { API_BASE }
