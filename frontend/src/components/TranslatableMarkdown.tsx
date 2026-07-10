import { useState, useEffect, useRef } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { translateText } from "../services/translateService"
import { useI18n } from "../i18n"

interface TranslatableMarkdownProps {
  markdown: string
}

export function TranslatableMarkdown({ markdown }: TranslatableMarkdownProps) {
  const { language } = useI18n()
  const [translated, setTranslated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const prevKey = useRef("")

  if (!markdown) return null

  const hasZh = /[\u4e00-\u9fff]/.test(markdown)
  const hasEn = /[a-zA-Z]/.test(markdown)
  const needsTranslate = language === "en" ? hasZh : hasEn

  useEffect(() => {
    if (!needsTranslate) {
      setTranslated(null)
      setLoading(false)
      return
    }

    const key = language + ":" + markdown
    if (key === prevKey.current) return
    prevKey.current = key

    let cancelled = false
    setLoading(true)
    const source = language === "en" ? "zh" : "en"
    translateText(markdown, language, source).then((result) => {
      if (!cancelled) {
        setTranslated(result)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [markdown, language, needsTranslate])

  const displayMarkdown = translated ?? markdown
  const html = DOMPurify.sanitize(marked.parse(displayMarkdown) as string)

  return (
    <div
      className="markdown-body"
      style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
