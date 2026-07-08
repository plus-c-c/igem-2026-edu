import { useState, type ChangeEvent } from "react"
import { LogIn } from "lucide-react"
import { authService } from "../services/authService"
import type { User } from "../types"
import { useI18n } from "../i18n"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onLogin: (user: User) => void
}

const defaultAvatar = "/images/logo.jpg"
const igemRoleOptions = ["Wet Lab", "Dry Lab", "HP", "美工", "Wiki"]

export function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  if (!open) return null

  const { t } = useI18n()

  const [mode, setMode] = useState<"login" | "register">("login")
  const [step, setStep] = useState<"form" | "verify">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [registerData, setRegisterData] = useState({
    email: "",
    name: "",
    password: "",
    registrantName: "",
    igemRole: igemRoleOptions[0],
    avatar: defaultAvatar,
  })
  const [igemRole, setIgemRole] = useState(igemRoleOptions[0])
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar)
  const [avatarValue, setAvatarValue] = useState(defaultAvatar)
  const [countdown, setCountdown] = useState(0)

  const mapUser = (user: any): User => ({
    id: user.id,
    email: user.email,
    teamName: user.name,
    role: user.role,
    registrantName: user.registrantName,
    igemRole: user.igemRole,
    avatar: user.avatar || defaultAvatar,
  })

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setAvatarPreview(defaultAvatar)
      setAvatarValue(defaultAvatar)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : defaultAvatar
      setAvatarPreview(value)
      setAvatarValue(value)
    }
    reader.readAsDataURL(file)
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
          onLogin(mapUser(res.user))
          onClose()
        } else {
          setError(res.message || (t.loginModal.loginFailed || "登录失败"))
        }
      } else {
        if (step === "form") {
          const email = data.get("email") as string
          const name = data.get("name") as string
          const password = data.get("password") as string
          const registrantName = data.get("registrantName") as string
          const nextRegisterData = {
            email,
            name,
            password,
            registrantName,
            igemRole,
            avatar: avatarValue || defaultAvatar,
          }
          const res = await authService.sendCode(nextRegisterData)
          if (res.message) {
            setRegisterData(nextRegisterData)
            setStep("verify")
            setSuccessMsg(res.message)
            startCountdown()
          } else {
            setError(res.message || (t.loginModal.codeFailed || "发送验证码失败"))
          }
        } else {
          const code = data.get("code") as string
          const res = await authService.verifyRegister({ email: registerData.email, code })
          if (res.token) {
            localStorage.setItem("authToken", res.token)
            onLogin(mapUser(res.user))
            onClose()
          } else {
            setError(res.message || (t.loginModal.registerFailed || "注册失败"))
          }
        }
      }
    } catch (e: any) {
      setError(e.message || (t.loginModal.networkError || "网络错误，请检查后端服务"))
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
      <form
        className={`login-modal ${mode === "register" ? "register-modal" : ""}`}
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2>{mode === "login" ? t.loginModal.teamLogin : step === "form" ? t.loginModal.register : t.loginModal.verifyEmail}</h2>
        {error && <p className="login-error">{error}</p>}
        {successMsg && <p className="login-success">{successMsg}</p>}

        {mode === "register" && step === "verify" ? (
          <>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-muted-48)" }}>
              {t.loginModal.verificationSent} <strong>{registerData.email}</strong>
            </p>
            <label>{t.loginModal.verificationCode}
              <input name="code" type="text" maxLength={6} required placeholder={t.loginModal.codePlaceholder} autoFocus />
            </label>
            <div className="form-actions">
              <button className="pill-btn secondary" type="button" onClick={() => { setStep("form"); setError(""); setSuccessMsg("") }}>
                {t.loginModal.back}
              </button>
              <button className="pill-btn primary" type="submit" disabled={loading}>
                {loading ? t.loginModal.registering : t.loginModal.completeRegister}
              </button>
            </div>
            {countdown > 0 ? (
              <p className="login-hint">{countdown} {t.loginModal.resendAfter}</p>
            ) : (
              <span className="text-link" style={{ cursor: "pointer", fontSize: 13, textAlign: "center", display: "block", marginTop: 8 }}
                onClick={async () => {
                  setError(""); setSuccessMsg(""); setLoading(true)
                  try {
                    const res = await authService.sendCode(registerData)
                    if (res.message) { setSuccessMsg(res.message); startCountdown() }
                    else setError(res.message || (t.loginModal.sendFailed || "发送失败"))
                  } catch (e: any) { setError(e.message) }
                  setLoading(false)
                }}
              >{t.loginModal.resend}</span>
            )}
          </>
        ) : (
          <>
            {mode === "register" && (
              <div className="register-grid">
                <div className="avatar-field">
                  <span>{t.loginModal.avatar}</span>
                  <img className="avatar-preview" src={avatarPreview} alt={t.loginModal.avatarPreview} />
                  <label className="avatar-upload">
                    <input name="avatarFile" type="file" accept="image/*" onChange={handleAvatarChange} />
                    {t.loginModal.optionalAvatar}
                  </label>
                </div>
                <div className="register-fields">
                  <label>{t.loginModal.registrantName}
                    <input name="registrantName" required placeholder={t.loginModal.registrantPlaceholder} />
                  </label>
                  <label>{t.loginModal.teamName}
                    <input name="name" required placeholder="Westlake iGEM" />
                  </label>
                  <label>{t.loginModal.igemRole}
                    <input type="hidden" name="igemRole" value={igemRole} />
                    <div className="role-tabs" role="tablist" aria-label={t.loginModal.igemRole}>
                      {igemRoleOptions.map((option) => (
                        <button
                          key={option}
                          className={option === igemRole ? "active" : ""}
                          type="button"
                          onClick={() => setIgemRole(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
              </div>
            )}
            <label>{t.loginModal.email}<input name="email" type="email" required placeholder="team@example.com" /></label>
            <label>{t.loginModal.password}<input name="password" type="password" required placeholder={mode === "login" ? t.loginModal.passwordPlaceholderLogin : t.loginModal.passwordPlaceholderRegister} /></label>
            <div className="form-actions">
              <button className="pill-btn secondary" type="button" onClick={onClose}>{t.loginModal.cancel}</button>
              <button className="auth-switch-link" type="button" onClick={switchMode}>
                {mode === "login" ? t.loginModal.switchToRegister : t.loginModal.switchToLogin}
              </button>
              <button className="pill-btn primary" type="submit" disabled={loading}>
                {loading ? t.loginModal.processing : mode === "login" ? t.loginModal.login : t.loginModal.sendCode}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
