import { useEffect, useRef, useState } from "react"
import type { User } from "../types"
import { authService } from "../services/authService"

const CHECK_INTERVAL = 5 * 60 * 1000

export function useLocalAuth(): [User | null, (user: User | null) => void, boolean] {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!localStorage.getItem("authToken"))
  const checkRef = useRef<ReturnType<typeof setInterval>>()

  const clearAuth = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("hpEduUser")
    setUserState(null)
  }

  const verifyToken = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) { clearAuth(); return }
    try {
      const res = await authService.getMe(token)
      if (res.user) {
        const u: User = { id: res.user.id, email: res.user.email, teamName: res.user.name, role: res.user.role }
        setUserState(u)
        localStorage.setItem("hpEduUser", JSON.stringify(u))
      } else {
        clearAuth()
      }
    } catch {
      clearAuth()
    }
    setLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) { setLoading(false); return }
    setLoading(true)
    verifyToken()
    checkRef.current = setInterval(verifyToken, CHECK_INTERVAL)
    return () => clearInterval(checkRef.current)
  }, [])

  const setUser = (value: User | null) => {
    setUserState(value)
    if (value) localStorage.setItem("hpEduUser", JSON.stringify(value))
    else clearAuth()
  }

  return [user, setUser, loading]
}
