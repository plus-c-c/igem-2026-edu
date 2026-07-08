import { useState, type ChangeEvent } from "react"
import { User, Eye, EyeOff, Save, Camera } from "lucide-react"
import { authService } from "../services/authService"
import type { User as UserType } from "../types"

const igemRoleOptions = ["Wet Lab", "Dry Lab", "HP", "美工", "Wiki"]
const defaultAvatar = "/images/logo.jpg"

interface ProfilePageProps {
  user: UserType
  setUser: (user: UserType) => void
}

export function ProfilePage({ user, setUser }: ProfilePageProps) {
  const token = localStorage.getItem("authToken") || ""

  const [name, setName] = useState(user.teamName)
  const [registrantName, setRegistrantName] = useState(user.registrantName || "")
  const [igemRole, setIgemRole] = useState(user.igemRole || igemRoleOptions[0])
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || defaultAvatar)
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState("")
  const [profileError, setProfileError] = useState("")
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : defaultAvatar
      setAvatarPreview(value)
      setAvatarDataUri(value)
    }
    reader.readAsDataURL(file)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg("")
    setProfileError("")
    setProfileLoading(true)
    try {
      const res = await authService.updateMe(token, {
        name,
        registrantName,
        igemRole,
        ...(avatarDataUri ? { avatar: avatarDataUri } : {}),
      })
      if (res.user) {
        setUser({
          ...user,
          teamName: res.user.name,
          registrantName: res.user.registrantName,
          igemRole: res.user.igemRole,
          avatar: res.user.avatar,
        })
        setProfileMsg("个人信息已更新")
        setAvatarDataUri(null)
      } else {
        setProfileError(res.message || "更新失败")
      }
    } catch {
      setProfileError("网络错误")
    }
    setProfileLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg("")
    setPasswordError("")
    setPasswordLoading(true)
    try {
      const res = await authService.changePassword(token, currentPassword, newPassword)
      if (res.message) {
        setPasswordMsg(res.message)
        setCurrentPassword("")
        setNewPassword("")
      } else {
        setPasswordError(res.message || "修改失败")
      }
    } catch {
      setPasswordError("网络错误")
    }
    setPasswordLoading(false)
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <img className="profile-avatar" src={avatarPreview} alt="头像" />
          <label className="profile-avatar-upload">
            <Camera size={16} />
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>
        <div className="profile-title-group">
          <h1>{user.teamName}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-content">
        <section className="profile-section">
          <h2><User size={18} /> 个人信息</h2>
          {profileMsg && <p className="profile-success">{profileMsg}</p>}
          {profileError && <p className="profile-error">{profileError}</p>}
          <form onSubmit={handleProfileSubmit}>
            <div className="profile-form-grid">
              <label>
                iGEM 队伍名称
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label>
                姓名（与 iGEM 官网展示一致）
                <input value={registrantName} onChange={(e) => setRegistrantName(e.target.value)} required />
              </label>
              <label>
                邮箱
                <input value={user.email} disabled className="profile-disabled-input" />
              </label>
              <label>
                在 iGEM 的职位
                <input type="hidden" value={igemRole} readOnly />
                <div className="role-tabs" role="tablist">
                  {igemRoleOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={option === igemRole ? "active" : ""}
                      onClick={() => setIgemRole(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </label>
            </div>
            <button className="pill-btn primary" type="submit" disabled={profileLoading}>
              <Save size={14} /> {profileLoading ? "保存中..." : "保存修改"}
            </button>
          </form>
        </section>

        <section className="profile-section">
          <h2><Eye size={18} /> 修改密码</h2>
          {passwordMsg && <p className="profile-success">{passwordMsg}</p>}
          {passwordError && <p className="profile-error">{passwordError}</p>}
          <form onSubmit={handlePasswordSubmit}>
            <div className="profile-form-grid">
              <label className="password-field">
                当前密码
                <div className="password-input-wrapper">
                  <input type={showCurrent ? "text" : "password"} value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="输入当前密码" />
                  <button type="button" className="password-toggle" onClick={() => setShowCurrent((s) => !s)}>
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
              <label className="password-field">
                新密码
                <div className="password-input-wrapper">
                  <input type={showNew ? "text" : "password"} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} required placeholder="6 位以上新密码" minLength={6} />
                  <button type="button" className="password-toggle" onClick={() => setShowNew((s) => !s)}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
            </div>
            <button className="pill-btn primary" type="submit" disabled={passwordLoading}>
              <Save size={14} /> {passwordLoading ? "修改中..." : "修改密码"}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
