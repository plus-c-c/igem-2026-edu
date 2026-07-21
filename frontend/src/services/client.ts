const API_BASE = "/api"

const DEFAULT_TIMEOUT = 15000

export let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb
}

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetchWithTimeout(url, options)
  if (res.status === 401 && onUnauthorized) onUnauthorized()
  return res
}

export { API_BASE }
