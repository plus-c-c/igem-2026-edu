import { useState } from "react"
import { authService } from "../services/authService"
import { useI18n } from "../i18n"

interface ForgotPasswordContentProps {
  setMode: (mode: "login" | "register" | "forgot") => void
}

export function ForgotPasswordContent({ setMode }: ForgotPasswordContentProps) {
  const { t } = useI18n()
  const [step, setStep] = useState<"form" | "verify" | "done">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [verificationCode, setVerificationCode] = useState("")

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const sendCode = async () => {
    setError("")
    setSuccessMsg("")
    setLoading(true)
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]')
    if (!emailInput?.value) { setLoading(false); return }
    try {
      const res = await authService.sendPasswordResetCode(emailInput.value)
      if (res.message) {
        setForgotEmail(emailInput.value)
        setVerificationCode("")
        setStep("verify")
        setSuccessMsg(res.message)
        startCountdown()
      } else {
        setError(res.message || (t.loginModal.sendFailed))
      }
    } catch (e: any) {
      setError(e.message || (t.loginModal.networkError))
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    setError("")
    setSuccessMsg("")
    setLoading(true)
    const newPasswordInput = document.querySelector<HTMLInputElement>('input[name="newPassword"]')
    if (!verificationCode || !newPasswordInput?.value) { setLoading(false); return }
    try {
      const res = await authService.resetPassword({ email: forgotEmail, code: verificationCode, newPassword: newPasswordInput.value })
      if (res.message && !res.code) {
        setSuccessMsg(res.message)
        setStep("done")
      } else {
        setError(res.message || (t.loginModal.resetFailed))
      }
    } catch (e: any) {
      setError(e.message || (t.loginModal.networkError))
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setError("")
    setSuccessMsg("")
    setLoading(true)
    try {
      const res = await authService.sendPasswordResetCode(forgotEmail)
      if (res.message) { setSuccessMsg(res.message); startCountdown() }
      else setError(res.message || (t.loginModal.sendFailed))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === "done") {
    return (
      <>
        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-muted-48)" }}>
          {t.loginModal.passwordResetDone}
        </p>
        <div className="form-actions">
          <button className="pill-btn primary" type="button" onClick={() => setMode("login")}>
            {t.loginModal.backToLogin}
          </button>
        </div>
      </>
    )
  }

  if (step === "verify") {
    return (
      <div>
        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-muted-48)" }}>
          {t.loginModal.verificationSent} <strong>{forgotEmail}</strong>
        </p>
        <label>{t.loginModal.verificationCode}
          <input className="verification-code-input" name="passwordResetVerificationCode" type="text" inputMode="numeric" pattern="[0-9]{6}" autoComplete="off" maxLength={6} required placeholder={t.loginModal.codePlaceholder} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))} autoFocus />
        </label>
        <label>{t.loginModal.newPassword}
          <input name="newPassword" type="password" required minLength={6} placeholder={t.loginModal.passwordPlaceholderRegister} />
        </label>
        <div className="form-actions">
          <button className="pill-btn secondary" type="button" onClick={() => { setStep("form"); setError(""); setSuccessMsg("") }}>
            {t.loginModal.back}
          </button>
          <button className="pill-btn primary" type="button" disabled={loading} onClick={resetPassword}>
            {loading ? t.loginModal.resetting : t.loginModal.resetPassword}
          </button>
        </div>
        {countdown > 0 ? (
          <p className="login-hint">{countdown} {t.loginModal.resendAfter}</p>
        ) : (
          <span className="text-link" style={{ cursor: "pointer", fontSize: 13, textAlign: "center", display: "block", marginTop: 8 }}
            onClick={resendCode}
          >{t.loginModal.resend}</span>
        )}
      </div>
    )
  }

  return (
    <div>
      <label>{t.loginModal.email}<input name="email" type="email" required placeholder={t.loginModal.emailPlaceholder} /></label>
      <div className="form-actions">
        <button className="pill-btn secondary" type="button" onClick={() => setMode("login")}>
          {t.loginModal.back}
        </button>
        <button className="pill-btn primary" type="button" disabled={loading} onClick={sendCode}>
          {loading ? t.loginModal.sending : t.loginModal.sendCode}
        </button>
      </div>
    </div>
  )
}
