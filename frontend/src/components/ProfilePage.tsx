import { useEffect, useState, type ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { User, Eye, EyeOff, Save, Camera, FileText, Edit, Trash2, Send, Heart, ExternalLink } from "lucide-react"
import { authService } from "../services/authService"
import { resourceService } from "../services/resourceService"
import { useI18n } from "../i18n"
import { categories } from "../data/categories"
import { IGEM_ROLE_OPTIONS, DEFAULT_AVATAR } from "../data/constants"
import { resizeAvatar } from "../utils/avatar"
import type { User as UserType, Resource } from "../types"

interface ProfilePageProps {
  user: UserType
  setUser: (user: UserType) => void
}

export function ProfilePage({ user, setUser }: ProfilePageProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const token = localStorage.getItem("authToken") || ""

  const [name, setName] = useState(user.teamName)
  const [registrantName, setRegistrantName] = useState(user.registrantName || "")
  const [igemRole, setIgemRole] = useState(user.igemRole || IGEM_ROLE_OPTIONS[0])
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || DEFAULT_AVATAR)
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

  const [drafts, setDrafts] = useState<Resource[]>([])
  const [draftsLoading, setDraftsLoading] = useState(false)
  const [draftMsg, setDraftMsg] = useState("")

  const [favorites, setFavorites] = useState<Resource[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)

  const loadDrafts = () => {
    if (!user) return
    setDraftsLoading(true)
    resourceService.list({ status: "draft" }).then((items) => {
      setDrafts(items.filter((r) => r.userId === user.id))
      setDraftsLoading(false)
    }).catch(() => setDraftsLoading(false))
  }

  const loadFavorites = () => {
    if (!user) return
    setFavoritesLoading(true)
    resourceService.getMyFavorites().then((items) => {
      setFavorites(items)
      setFavoritesLoading(false)
    }).catch(() => setFavoritesLoading(false))
  }

  useEffect(() => { loadDrafts(); loadFavorites() }, [user])

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    setProfileError("")
    try {
      let value = await resizeAvatar(file)
      if (value.length > 90_000) value = await resizeAvatar(file, 256, 0.72)
      setAvatarPreview(value)
      setAvatarDataUri(value)
    } catch {
      setProfileError(t.profile.updateFailed || "更新失败")
    }
    event.target.value = ""
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
        setProfileMsg(t.profile.updated)
        setAvatarPreview(res.user.avatar)
        setAvatarDataUri(null)
      } else {
        setProfileError(res.message || t.profile.updateFailed)
      }
    } catch {
      setProfileError(t.profile.networkError)
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
        setPasswordError(res.message || t.profile.changeFailed)
      }
    } catch {
      setPasswordError(t.profile.networkError)
    }
    setPasswordLoading(false)
  }

  const handlePublishDraft = async (draft: Resource) => {
    if (!confirm(t.profile.publishDraft + "?")) return
    await resourceService.update(String(draft.id), { status: "published" })
    setDrafts((prev) => prev.filter((r) => r.id !== draft.id))
    navigate(`/cases/${draft.id}`)
  }

  const handleDeleteDraft = async (draft: Resource) => {
    if (!confirm(t.profile.confirmDeleteDraft)) return
    await resourceService.remove(String(draft.id))
    setDrafts((prev) => prev.filter((r) => r.id !== draft.id))
    setDraftMsg(t.profile.draftDeleted)
    setTimeout(() => setDraftMsg(""), 3000)
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <img className="profile-avatar" src={avatarPreview} alt={t.profile.avatarAlt} />
          <label className="profile-avatar-upload">
            <Camera size={16} />
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>
        <div className="profile-title-group">
          {user.registrantName && user.registrantName !== user.teamName ? (
            <div className="profile-name-row">
              <span className="profile-registrant-name">{user.registrantName}</span>
              <span className="profile-team-name">{user.teamName}</span>
            </div>
          ) : (
            <h1 className="profile-single-name">{user.teamName}</h1>
          )}
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-content">
        <section className="profile-section">
          <h2><User size={18} /> {t.profile.personalInfo}</h2>
          {profileMsg && <p className="profile-success">{profileMsg}</p>}
          {profileError && <p className="profile-error">{profileError}</p>}
          <form onSubmit={handleProfileSubmit}>
            <div className="profile-form-grid">
              <label>
                {t.profile.registrantName}
                <input value={registrantName} onChange={(e) => setRegistrantName(e.target.value)} required />
              </label>
              <label>
                {t.profile.teamName}
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label>
                {t.profile.email}
                <input value={user.email} disabled className="profile-disabled-input" />
              </label>
              <label>
                {t.profile.igemRole}
                <input type="hidden" value={igemRole} readOnly />
                <div className="role-tabs" role="tablist">
                  {IGEM_ROLE_OPTIONS.map((option) => {
                    const roleLabel: Record<string, string> = { "Wet Lab": t.loginModal.roleWetLab, "Dry Lab": t.loginModal.roleDryLab, "HP": t.loginModal.roleHP, "美工": t.loginModal.roleArt, "Wiki": t.loginModal.roleWiki }
                    return (
                      <button
                        key={option}
                        type="button"
                        className={option === igemRole ? "active" : ""}
                        onClick={() => setIgemRole(option)}
                      >
                        {roleLabel[option] || option}
                      </button>
                    )
                  })}
                </div>
              </label>
            </div>
            <button className="pill-btn primary" type="submit" disabled={profileLoading}>
              <Save size={14} /> {profileLoading ? t.profile.saving : t.profile.save}
            </button>
          </form>
        </section>

        <section className="profile-section">
          <h2><Eye size={18} /> {t.profile.passwordTitle}</h2>
          {passwordMsg && <p className="profile-success">{passwordMsg}</p>}
          {passwordError && <p className="profile-error">{passwordError}</p>}
          <form onSubmit={handlePasswordSubmit}>
            <div className="profile-form-grid">
              <label className="password-field">
                {t.profile.currentPassword}
                <div className="password-input-wrapper">
                  <input type={showCurrent ? "text" : "password"} value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)} required placeholder={t.profile.currentPasswordPlaceholder} />
                  <button type="button" className="password-toggle" onClick={() => setShowCurrent((s) => !s)}>
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
              <label className="password-field">
                {t.profile.newPassword}
                <div className="password-input-wrapper">
                  <input type={showNew ? "text" : "password"} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} required placeholder={t.profile.newPasswordPlaceholder} minLength={6} />
                  <button type="button" className="password-toggle" onClick={() => setShowNew((s) => !s)}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
            </div>
            <button className="pill-btn primary" type="submit" disabled={passwordLoading}>
              <Save size={14} /> {passwordLoading ? t.profile.changing : t.profile.changePassword}
            </button>
          </form>
        </section>

        <section className="profile-section">
          <h2><Heart size={18} /> {t.profile.favoritesTitle}</h2>
          {favoritesLoading ? (
            <p>{t.profile.loading}</p>
          ) : favorites.length === 0 ? (
            <p>{t.profile.noFavorites}</p>
          ) : (
            <div className="drafts-list">
              {favorites.map((fav) => (
                <div key={fav.id} className="draft-item">
                  <div className="draft-info">
                    <strong>{fav.title || t.profile.untitled}</strong>
                    <span>{(() => { const fc = categories.find((c) => c.id === fav.category); return fc ? (t.categories[fc.id]?.name ?? fc.name) : fav.category })()}</span>
                    <span className="draft-date">{fav.updatedAt ? new Date(fav.updatedAt).toLocaleDateString() : ""}</span>
                  </div>
                  <div className="draft-actions">
                    <button className="pill-btn secondary" onClick={() => navigate(`/cases/${fav.id}`)}>
                      <ExternalLink size={14} /> {t.profile.viewFavorite}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="profile-section">
          <h2><FileText size={18} /> {t.profile.draftsTitle}</h2>
          {draftMsg && <p className="profile-success">{draftMsg}</p>}
          {draftsLoading ? (
            <p>{t.profile.loading}</p>
          ) : drafts.length === 0 ? (
            <p>{t.profile.noDrafts}</p>
          ) : (
            <div className="drafts-list">
              {drafts.map((draft) => (
                <div key={draft.id} className="draft-item">
                  <div className="draft-info">
                    <strong>{draft.title || t.profile.untitled}</strong>
                    <span>{(() => { const dc = categories.find((c) => c.id === draft.category); return dc ? (t.categories[dc.id]?.name ?? dc.name) : draft.category })()}</span>
                    <span className="draft-date">{draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : ""}</span>
                  </div>
                  <div className="draft-actions">
                    <button className="pill-btn secondary" onClick={() => navigate(`/resource/${draft.id}/edit`)}>
                      <Edit size={14} /> {t.profile.editDraft}
                    </button>
                    <button className="pill-btn primary" onClick={() => handlePublishDraft(draft)}>
                      <Send size={14} /> {t.profile.publishDraft}
                    </button>
                    <button className="pill-btn secondary draft-delete" onClick={() => handleDeleteDraft(draft)}>
                      <Trash2 size={14} /> {t.profile.deleteDraft}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
