import { useState } from "react"
import { translateText } from "../services/translateService"
import { useI18n } from "../i18n"

interface TranslatableProps {
  text: string
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div"
  className?: string
  inline?: boolean
}

export function Translatable({ text, as: Tag = "span", className, inline }: TranslatableProps) {
  const { language } = useI18n()
  const [translated, setTranslated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!text) return null

  const showTranslated = translated !== null
  const displayText = showTranslated ? translated : text
  const targetLang = language === "en" ? "en" : "zh"
  const hasZh = /[\u4e00-\u9fff]/.test(text)
  const hasEn = /[a-zA-Z]/.test(text)
  const needsTranslate = targetLang === "en" ? hasZh : hasEn

  const handleToggle = async () => {
    if (showTranslated) {
      setTranslated(null)
      return
    }
    setLoading(true)
    const result = await translateText(text, targetLang)
    setTranslated(result)
    setLoading(false)
  }

  if (!needsTranslate && !showTranslated) {
    return <Tag className={className}>{text}</Tag>
  }

  const wrapperStyle = inline ? { display: "inline" as const } : undefined

  return (
    <span style={wrapperStyle}>
      <Tag className={className} style={inline ? { display: "inline" } : undefined}>
        {loading ? text : displayText}
      </Tag>
      {needsTranslate && (
        <button
          type="button"
          className="translate-btn"
          onClick={handleToggle}
          disabled={loading}
          style={{ fontSize: "0.75em", marginLeft: 6, opacity: 0.6, cursor: "pointer", background: "none", border: "none", textDecoration: "underline", color: "inherit" }}
        >
          {loading ? "..." : showTranslated ? (targetLang === "en" ? "原文" : "English") : targetLang === "en" ? "Translate" : "翻译"}
        </button>
      )}
    </span>
  )
}
