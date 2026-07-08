import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

export type Language = "zh" | "en"

const STORAGE_KEY = "synedu-language"

interface DeepRecord {
  [key: string]: string | string[] | DeepRecord
}

const cache: Record<string, DeepRecord> = {}
const loadPromises: Record<string, Promise<DeepRecord>> = {}

function loadLocale(lang: string): Promise<DeepRecord> {
  if (cache[lang]) return Promise.resolve(cache[lang])
  if (!loadPromises[lang]) {
    const file = lang === "zh" ? "zh-CN.lang.json" : "en-US.lang.json"
    loadPromises[lang] = fetch(`/locales/${file}`)
      .then((r) => r.json())
      .then((data) => { cache[lang] = data; return data })
  }
  return loadPromises[lang]
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "zh"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === "en" ? "en" : "zh"
}

function makeProxy(data: DeepRecord, prefix = ""): Record<string, any> {
  return new Proxy(data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined
      const path = prefix ? `${prefix}.${prop}` : prop
      const val = target[prop]
      if (val === undefined) return undefined
      if (typeof val === "string") return val
      if (Array.isArray(val)) return val
      if (typeof val === "object") return makeProxy(val as DeepRecord, path)
      return val
    },
  })
}

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: Record<string, any>
  ready: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)
  const [ready, setReady] = useState(false)
  const [locData, setLocData] = useState<DeepRecord>({})

  useEffect(() => {
    loadLocale(language).then((data) => {
      setLocData(data)
      setReady(true)
    })
  }, [language])

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en"
  }

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en"
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "zh" ? "en" : "zh"),
    t: makeProxy(locData),
    ready,
  }), [language, locData, ready])

  if (!ready) return null

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error("useI18n must be used inside LanguageProvider")
  return value
}

export function useCategoryText(categoryId: string) {
  const { t } = useI18n()
  return t.categories?.[categoryId]
}
