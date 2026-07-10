import { type ChangeEvent, useState } from "react"
import { IGEM_ROLE_OPTIONS } from "../data/constants"
import { useI18n } from "../i18n"

interface RegisterFieldsProps {
  igemRole: string
  setIgemRole: (role: string) => void
  avatarPreview: string
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function RegisterFields({ igemRole, setIgemRole, avatarPreview, onAvatarChange }: RegisterFieldsProps) {
  const { t } = useI18n()

  return (
    <div className="register-grid">
      <div className="avatar-field">
        <span>{t.loginModal.avatar}</span>
        <img className="avatar-preview" src={avatarPreview} alt={t.loginModal.avatarPreview} />
        <label className="avatar-upload">
          <input name="avatarFile" type="file" accept="image/*" onChange={onAvatarChange} />
          {t.loginModal.optionalAvatar}
        </label>
      </div>
      <div className="register-fields">
        <label>{t.loginModal.registrantName}
          <input name="registrantName" required placeholder={t.loginModal.registrantPlaceholder} />
        </label>
        <label>{t.loginModal.teamName}
          <input name="name" required placeholder={t.loginModal.teamPlaceholder} />
        </label>
        <label>{t.loginModal.igemRole}
          <input type="hidden" name="igemRole" value={igemRole} />
          <div className="role-tabs" role="tablist" aria-label={t.loginModal.igemRole}>
            {IGEM_ROLE_OPTIONS.map((option) => {
              const roleLabel: Record<string, string> = {
                "Wet Lab": t.loginModal.roleWetLab,
                "Dry Lab": t.loginModal.roleDryLab,
                "HP": t.loginModal.roleHP,
                "美工": t.loginModal.roleArt,
                "Wiki": t.loginModal.roleWiki,
              }
              return (
                <button
                  key={option}
                  className={option === igemRole ? "active" : ""}
                  type="button"
                  onClick={() => setIgemRole(option)}
                >
                  {roleLabel[option] || option}
                </button>
              )
            })}
          </div>
        </label>
      </div>
    </div>
  )
}
