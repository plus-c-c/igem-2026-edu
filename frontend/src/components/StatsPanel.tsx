import { useEffect, useRef, useState } from "react"
import type { Resource } from "../types"

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
  return (
    <section className="stats-panel">
      <div><AnimatedNumber value={resources.length} /><span>已收录资源</span></div>
      <div><AnimatedNumber value={5} /><span>核心栏目</span></div>
      <div><AnimatedNumber value={6} /><span>项目材料</span></div>
      <div><AnimatedNumber value={3} suffix="+" /><span>高校团队</span></div>
    </section>
  )
}
