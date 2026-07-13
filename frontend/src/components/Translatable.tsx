import { useState, useEffect, useRef } from "react"
import { translateText, type CaseMode } from "../services/translateService"
import { useI18n } from "../i18n"

interface TranslatableProps {
  text: string
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div"
  className?: string
  caseMode?: CaseMode
}

export function Translatable({ text, as: Tag = "span", className, caseMode }: TranslatableProps) {
  const { language } = useI18n()
  const [translated, setTranslated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const prevKey = useRef("")

  if (!text) return null

  const targetLang = language
  const cjkCount = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const enCount = (text.match(/[a-zA-Z]/g) || []).length
  const isChinese = cjkCount > enCount
  const needsTranslate = targetLang === "en" ? isChinese : !isChinese

  useEffect(() => {
    if (!needsTranslate) {
      setTranslated(null)
      setLoading(false)
      return
    }

    const key = targetLang + ":" + text + ":" + (caseMode || "")
    if (key === prevKey.current) return
    prevKey.current = key

    let cancelled = false
    setLoading(true)
    const source = targetLang === "en" ? "zh" : "en"
    translateText(text, targetLang, source, caseMode).then((result) => {
      if (!cancelled) {
        setTranslated(result)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [text, targetLang, needsTranslate, caseMode])

  return <Tag className={className}>{loading ? text : (translated ?? text)}</Tag>
}
