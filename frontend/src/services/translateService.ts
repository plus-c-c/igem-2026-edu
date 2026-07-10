const cache = new Map<string, string>()

function cacheKey(text: string, target: string): string {
  return `${target}:${text}`
}

export async function translateText(text: string, target: string): Promise<string> {
  if (!text.trim()) return text
  const key = cacheKey(text, target)
  if (cache.has(key)) return cache.get(key)!

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target }),
      signal: controller.signal,
    })
    clearTimeout(id)

    if (!res.ok) return text

    const data = await res.json()
    const translated = data.translatedText || text
    cache.set(key, translated)
    return translated
  } catch {
    clearTimeout(id)
    return text
  }
}
