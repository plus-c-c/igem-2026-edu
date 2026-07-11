export type CaseMode = "sentence" | "lower" | "title" | "none"

const cache = new Map<string, string>()

function cacheKey(text: string, target: string, caseMode: CaseMode): string {
  return `${target}:${caseMode}:${text}`
}

const ACRONYMS = new Set([
  "DNA", "RNA", "CRISPR", "SDG", "PCR", "WHO", "UN", "FAQ", "DIY",
  "AI", "VR", "AR", "3D", "pH", "ATP", "ADP", "NAD", "FAD",
])

function normalizeCase(text: string, mode: CaseMode): string {
  if (mode === "none") return text

  if (mode === "lower") {
    let result = text.toLowerCase()
    for (const acro of ACRONYMS) {
      const lc = acro.toLowerCase()
      result = result.replace(new RegExp(`\\b${lc}\\b`, "g"), acro)
    }
    return result
  }

  const letters = text.match(/[a-zA-Z]/g)
  if (!letters || letters.length < 3) return text

  const upper = text.match(/[A-Z]/g) || []
  if (upper.length / letters.length < 0.7) return text

  let result = text.toLowerCase()

  for (const acro of ACRONYMS) {
    const lc = acro.toLowerCase()
    result = result.replace(new RegExp(`\\b${lc}\\b`, "g"), acro)
  }

  if (mode === "title") {
    result = result.replace(/\b\w/g, (c) => c.toUpperCase())
    for (const acro of ACRONYMS) {
      result = result.replace(new RegExp(`\\b${acro}\\b`, "g"), acro)
    }
    return result
  }

  result = result.charAt(0).toUpperCase() + result.slice(1)
  result = result.replace(/([.!?]\s*)([a-z])/g, (_, p, c) => p + c.toUpperCase())
  result = result.replace(/^#+\s+([a-z])/gm, (_, c) => _.toUpperCase())
  result = result.replace(/\n\n([a-z])/g, (_, c) => '\n\n' + c.toUpperCase())

  return result
}

export async function translateText(
  text: string,
  target: string,
  source?: string,
  caseMode: CaseMode = "sentence",
): Promise<string> {
  if (!text.trim()) return text
  const key = cacheKey(text, target, caseMode)
  if (cache.has(key)) return cache.get(key)!

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 10000)

  try {
    const body: Record<string, string> = { q: text, target }
    if (source) body.source = source

    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(id)

    if (!res.ok) return text

    const data = await res.json()
    const translated = normalizeCase(data.translatedText || text, caseMode)
    cache.set(key, translated)
    return translated
  } catch {
    clearTimeout(id)
    return text
  }
}
