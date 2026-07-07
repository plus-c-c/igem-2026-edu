import { useEffect, useRef, useState } from "react"
import type { Resource } from "../types"
import { useI18n } from "../i18n"

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const [runId, setRunId] = useState(0)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    let wasVisible = false
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !wasVisible) {
        wasVisible = true
        setRunId((id) => id + 1)
      }
      if (!entry.isIntersecting) wasVisible = false
    }, { threshold: 0.45 })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (runId === 0) return
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    let frame = 0
    const duration = 900
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }

    setDisplay(0)
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [runId, value])

  return <strong ref={ref}>{display}{suffix}</strong>
}

export function StatsPanel({ resources }: { resources: Resource[] }) {
  const { t } = useI18n()

  return (
    <section className="stats-panel">
      <div><AnimatedNumber value={resources.length} /><span>{t.stats.resources}</span></div>
      <div><AnimatedNumber value={5} /><span>{t.stats.columns}</span></div>
      <div><AnimatedNumber value={6} /><span>{t.stats.materials}</span></div>
      <div><AnimatedNumber value={3} suffix="+" /><span>{t.stats.teams}</span></div>
    </section>
  )
}
