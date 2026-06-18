import { useState } from "react"
import { LogIn } from "lucide-react"
import { authApi } from "../api"
import type { User } from "../types"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onLogin: (user: User) => void
}

export function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  if (!open) return null

  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    const data = new FormData(event.currentTarget)
    try {
      if (mode === "login") {
        const res = await authApi.login({ email: data.get("email") as string, password: data.get("password") as string })
        if (res.token) {
          localStorage.setItem("authToken", res.token)
          onLogin({ id: res.user.id, email: res.user.email, teamName: res.user.name })
          onClose()
        } else {
          setError(res.message || "登录失败")
        }
      } else {
        const res = await authApi.register({
          email: data.get("email") as string,
          password: data.get("password") as string,
          name: data.get("name") as string,
        })
        if (res.token) {
          localStorage.setItem("authToken", res.token)
          onLogin({ id: res.user.id, email: res.user.email, teamName: res.user.name })
          onClose()
        } else {
          setError(res.message || "注册失败")
        }
      }
    } catch {
      setError("网络错误，请检查后端服务")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="login-modal" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{mode === "login" ? "团队登录" : "注册新账号"}</h2>
        {error && <p style={{ color: "#e53935", marginBottom: 0 }}>{error}</p>}
        {mode === "register" && <label>团队名称<input name="name" required placeholder="Westlake iGEM" /></label>}
        <label>邮箱<input name="email" type="email" required placeholder="team@example.com" /></label>
        <label>密码<input name="password" type="password" required placeholder={mode === "login" ? "请输入密码" : "6位以上密码"} /></label>
        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={onClose}>取消</button>
          <span className="link-button" style={{ cursor: "pointer" }} onClick={() => { setMode(mode === "login" ? "register" : "login"); setError("") }}>
            {mode === "login" ? "没有账号？注册" : "已有账号？登录"}
          </span>
          <button className="primary-action compact" type="submit" disabled={loading}>
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>
        </div>
      </form>
    </div>
  )
}
