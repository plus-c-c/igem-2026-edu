import { useEffect, useState } from "react"

type ThemeMode = "system" | "light" | "dark"

export function useThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    () => (localStorage.getItem("hpEduTheme") as ThemeMode) || "system"
  )

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    localStorage.setItem("hpEduTheme", themeMode)
  }, [themeMode])

  const setThemeMode = (value: ThemeMode) => {
    setThemeModeState(value)
  }

  return [themeMode, setThemeMode]
}
