import { useState, useEffect, type ChangeEvent } from "react"
import { LogIn } from "lucide-react"
import { authService } from "../services/authService"
import type { User } from "../types"
import { useI18n } from "../i18n"
import { IGEM_ROLE_OPTIONS, DEFAULT_AVATAR } from "../data/constants"
import { mapUser } from "../utils/avatar"
import { RegisterFields } from "./RegisterFields"
import { ForgotPasswordContent } from "./ForgotPasswordContent"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onLogin: (user: User) => void
}

export function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  const { t } = useI18n()

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login")
  const [step, setStep] = useState<"form" | "verify" | "done">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [registerData, setRegisterData] = useState({
    email: "",
    name: "",
    password: "",
    registrantName: "",
    igemRole: IGEM_ROLE_OPTIONS[0],
    avatar: DEFAULT_AVATAR,
  })
  const [igemRole, setIgemRole] = useState(IGEM_ROLE_OPTIONS[0])
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR)
  const [avatarValue, setAvatarValue] = useState(DEFAULT_AVATAR)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

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
      setAvatarPreview(DEFAULT_AVATAR)
      setAvatarValue(DEFAULT_AVATAR)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : DEFAULT_AVATAR
      setAvatarPreview(value)
      setAvatarValue(value)
    }
    reader.readAsDataURL(file)
    event.target.value = ""
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
          setError(res.message || (t.loginModal.loginFailed))
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
            avatar: avatarValue || DEFAULT_AVATAR,
          }
          const res = await authService.sendCode(nextRegisterData)
          if (res.message) {
            setRegisterData(nextRegisterData)
            setStep("verify")
            setSuccessMsg(res.message)
            startCountdown()
          } else {
            setError(res.message || (t.loginModal.codeFailed))
          }
        } else {
          const code = data.get("code") as string
          const res = await authService.verifyRegister({ email: registerData.email, code })
          if (res.token) {
            localStorage.setItem("authToken", res.token)
            onLogin(mapUser(res.user))
            onClose()
          } else {
            setError(res.message || (t.loginModal.registerFailed))
          }
        }
      }
    } catch (e: any) {
      setError(e.message || (t.loginModal.networkError))
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setStep("form")
    setError("")
    setSuccessMsg("")
  }

  const openForgotPassword = () => {
    setMode("forgot")
    setStep("form")
    setError("")
    setSuccessMsg("")
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className={`login-modal ${mode === "register" ? "register-modal" : ""}`}
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2>{mode === "login" ? t.loginModal.teamLogin : mode === "forgot" ? (step === "done" ? t.loginModal.resetSuccess : step === "verify" ? t.loginModal.resetPassword : t.loginModal.forgotPassword) : step === "form" ? t.loginModal.register : t.loginModal.verifyEmail}</h2>
        {error && <p className="login-error">{error}</p>}
        {successMsg && <p className="login-success">{successMsg}</p>}

        {mode === "forgot" ? (
          <ForgotPasswordContent setMode={setMode} />
        ) : mode === "register" && step === "verify" ? (
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
                    else setError(res.message || (t.loginModal.sendFailed))
                  } catch (e: any) { setError(e.message) }
                  setLoading(false)
                }}
              >{t.loginModal.resend}</span>
            )}
          </>
        ) : (
          <>
            {mode === "register" && (
              <RegisterFields
                igemRole={igemRole}
                setIgemRole={setIgemRole}
                avatarPreview={avatarPreview}
                onAvatarChange={handleAvatarChange}
              />
            )}
            <label>{t.loginModal.email}<input name="email" type="email" required placeholder="team@example.com" /></label>
            <label>{t.loginModal.password}<input name="password" type="password" required placeholder={mode === "login" ? t.loginModal.passwordPlaceholderLogin : t.loginModal.passwordPlaceholderRegister} />
              {mode === "login" && <span className="text-link forgot-link" onClick={openForgotPassword}>{t.loginModal.forgotPasswordLink}</span>}
            </label>
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
