import { useState } from "react"
import { LogIn } from "lucide-react"
import { authService } from "../services/authService"
import type { User } from "../types"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onLogin: (user: User) => void
}

export function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  if (!open) return null

  const [mode, setMode] = useState<"login" | "register">("login")
  const [step, setStep] = useState<"form" | "verify">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [registerData, setRegisterData] = useState({ email: "", name: "", password: "" })
  const [countdown, setCountdown] = useState(0)

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccessMsg("")
    setLoading(true)
    const data = new FormData(event.currentTarget)

    try {
      if (mode === "login") {
        const res = await authService.login({ email: data.get("email") as string, password: data.get("password") as string })
        if (res.token) {
          localStorage.setItem("authToken", res.token)
          onLogin({ id: res.user.id, email: res.user.email, teamName: res.user.name, role: res.user.role })
          onClose()
        } else {
          setError(res.message || "登录失败")
        }
      } else {
        if (step === "form") {
          const email = data.get("email") as string
          const name = data.get("name") as string
          const password = data.get("password") as string
          const res = await authService.sendCode({ email, name, password })
          if (res.message) {
            setRegisterData({ email, name, password })
            setStep("verify")
            setSuccessMsg(res.message)
            startCountdown()
          } else {
            setError(res.message || "发送验证码失败")
          }
        } else {
          const code = data.get("code") as string
          const res = await authService.verifyRegister({ email: registerData.email, code })
          if (res.token) {
            localStorage.setItem("authToken", res.token)
            onLogin({ id: res.user.id, email: res.user.email, teamName: res.user.name, role: res.user.role })
            onClose()
          } else {
            setError(res.message || "注册失败")
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "网络错误，请检查后端服务")
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setStep("form")
    setError("")
    setSuccessMsg("")
    setCountdown(0)
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="login-modal" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{mode === "login" ? "团队登录" : step === "form" ? "注册新账号" : "验证邮箱"}</h2>
        {error && <p className="login-error">{error}</p>}
        {successMsg && <p className="login-success">{successMsg}</p>}

        {mode === "register" && step === "verify" ? (
          <>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-muted-48)" }}>
              验证码已发送至 <strong>{registerData.email}</strong>
            </p>
            <label>验证码
              <input name="code" type="text" maxLength={6} required placeholder="输入 6 位验证码" autoFocus />
            </label>
            <div className="form-actions">
              <button className="pill-btn secondary" type="button" onClick={() => { setStep("form"); setError(""); setSuccessMsg("") }}>
                返回
              </button>
              <button className="pill-btn primary" type="submit" disabled={loading}>
                {loading ? "注册中..." : "完成注册"}
              </button>
            </div>
            {countdown > 0 ? (
              <p className="login-hint">{countdown} 秒后可重新发送</p>
            ) : (
              <span className="text-link" style={{ cursor: "pointer", fontSize: 13, textAlign: "center", display: "block", marginTop: 8 }}
                onClick={async () => {
                  setError(""); setSuccessMsg(""); setLoading(true)
                  try {
                    const res = await authService.sendCode(registerData)
                    if (res.message) { setSuccessMsg(res.message); startCountdown() }
                    else setError(res.message || "发送失败")
                  } catch (e: any) { setError(e.message) }
                  setLoading(false)
                }}
              >重新发送验证码</span>
            )}
          </>
        ) : (
          <>
            {mode === "register" && <label>团队名称<input name="name" required placeholder="例如：Westlake iGEM" /></label>}
            <label>邮箱<input name="email" type="email" required placeholder="team@example.com" /></label>
            <label>密码<input name="password" type="password" required placeholder={mode === "login" ? "请输入密码" : "6 位以上密码"} /></label>
            <div className="form-actions">
              <button className="pill-btn secondary" type="button" onClick={onClose}>取消</button>
              <button className="auth-switch-link" type="button" onClick={switchMode}>
                {mode === "login" ? "没有账号？注册" : "已有账号？登录"}
              </button>
              <button className="pill-btn primary" type="submit" disabled={loading}>
                {loading ? "处理中..." : mode === "login" ? "登录" : "发送验证码"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
