import { useState, useEffect, useRef } from "react"
import { translateText } from "../services/translateService"
import { useI18n } from "../i18n"

interface TranslatableProps {
  text: string
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div"
  className?: string
  inline?: boolean
}

export function Translatable({ text, as: Tag = "span", className }: TranslatableProps) {
  const { language } = useI18n()
  const [translated, setTranslated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const prevKey = useRef("")

  if (!text) return null

  const targetLang = language
  const hasZh = /[\u4e00-\u9fff]/.test(text)
  const hasEn = /[a-zA-Z]/.test(text)
  const needsTranslate = targetLang === "en" ? hasZh : hasEn

  useEffect(() => {
    if (!needsTranslate) {
      setTranslated(null)
      setLoading(false)
      return
    }

    const key = targetLang + ":" + text
    if (key === prevKey.current) return
    prevKey.current = key

    let cancelled = false
    setLoading(true)
    const source = targetLang === "en" ? "zh" : "en"
    translateText(text, targetLang, source).then((result) => {
      if (!cancelled) {
        setTranslated(result)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [text, targetLang, needsTranslate])

  return <Tag className={className}>{loading ? text : (translated ?? text)}</Tag>
}
