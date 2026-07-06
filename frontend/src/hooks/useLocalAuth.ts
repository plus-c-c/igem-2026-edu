import { useEffect, useState } from "react"
import type { User } from "../types"
import { authApi } from "../api"

export function useLocalAuth(): [User | null, (user: User | null) => void, boolean] {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!localStorage.getItem("authToken"))

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) return
    setLoading(true)
    authApi
      .getMe(token)
      .then((res: any) => {
        if (res.user) {
          const u: User = { id: res.user.id, email: res.user.email, teamName: res.user.name, role: res.user.role }
          setUserState(u)
          localStorage.setItem("hpEduUser", JSON.stringify(u))
        } else {
          localStorage.removeItem("authToken")
          localStorage.removeItem("hpEduUser")
        }
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem("authToken")
        localStorage.removeItem("hpEduUser")
        setLoading(false)
      })
  }, [])

  const setUser = (value: User | null) => {
    setUserState(value)
    if (value) localStorage.setItem("hpEduUser", JSON.stringify(value))
    else localStorage.removeItem("hpEduUser")
  }

  return [user, setUser, loading]
}
