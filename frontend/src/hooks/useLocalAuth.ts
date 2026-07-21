import { useEffect, useRef, useState } from "react"
import type { User } from "../types"
import { authService } from "../services/authService"

const CHECK_INTERVAL = 5 * 60 * 1000
const MAX_FAILURES = 5

export function useLocalAuth(): [User | null, (user: User | null) => void, boolean] {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!localStorage.getItem("authToken"))
  const checkRef = useRef<number>(0)
  const failCountRef = useRef(0)

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
        failCountRef.current = 0
        const u: User = {
          id: res.user.id,
          email: res.user.email,
          teamName: res.user.name,
          role: res.user.role,
          registrantName: res.user.registrantName,
          igemRole: res.user.igemRole,
          avatar: res.user.avatar,
        }
        setUserState(u)
        localStorage.setItem("hpEduUser", JSON.stringify(u))
      } else {
        clearAuth()
      }
    } catch {
      failCountRef.current++
      if (failCountRef.current >= MAX_FAILURES) {
        clearAuth()
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) { setLoading(false); return }
    setLoading(true)
    verifyToken()
    checkRef.current = window.setInterval(verifyToken, CHECK_INTERVAL)
    return () => window.clearInterval(checkRef.current)
  }, [])

  const setUser = (value: User | null) => {
    setUserState(value)
    if (value) localStorage.setItem("hpEduUser", JSON.stringify(value))
    else clearAuth()
  }

  return [user, setUser, loading]
}
