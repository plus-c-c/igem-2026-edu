import { Link, NavLink } from "react-router-dom"
import { Globe2, LogIn, LogOut, Menu, Shield, Star, UserRound, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { User } from "../types"
import { useI18n } from "../i18n"

interface HeaderProps {
  user: User | null
  setUser: (user: User | null) => void
  openLogin: () => void
}

export function Header({ user, setUser, openLogin }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement | null>(null)
  const { language, toggleLanguage, t } = useI18n()
  const navItems = [
    { path: "/", name: t.nav.home },
    { path: "/lecture", name: t.nav.applications },
    { path: "/activities", name: t.nav.activities },
    { path: "/recruitment", name: t.nav.recruitment },
    { path: "/about", name: t.nav.about },
  ]
  const handleLogout = () => {
    if (!confirm(t.nav.confirmLogout)) return
    localStorage.removeItem("authToken")
    localStorage.removeItem("hpEduUser")
    setUser(null)
    setAccountOpen(false)
  }

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  return (
    <nav className="global-nav">
      <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
        <img className="brand-logo" src="/images/logo.jpg" alt="SynEdu Global" />
        <span>SynEdu Global</span>
      </Link>
      <div className={menuOpen ? "nav-links open" : "nav-links"}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"} onClick={() => setMenuOpen(false)}>
            {item.name}
          </NavLink>
        ))}
      </div>
      <div className="nav-actions">
        <button className="language-toggle" type="button" onClick={toggleLanguage} aria-label={language === "zh" ? t.nav.switchToEn : t.nav.switchToZh}>
          <Globe2 size={15} />
          <span>{language === "zh" ? t.nav.langZh : t.nav.langEn}</span>
        </button>
        {user ? (
          <>
            {user.role === "admin" && <span className="admin-badge"><Shield size={12} /> {t.nav.admin}</span>}
            <span className="team-pill">{user.registrantName || user.teamName}</span>
            <div className="account-menu" ref={accountRef}>
              <button
                className="avatar-button"
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-label={t.nav.accountMenu}
                aria-expanded={accountOpen}
              >
                <img src={user.avatar || "/images/logo.jpg"} alt={t.profile.avatarAlt} />
              </button>
              {accountOpen && (
                <div className="account-dropdown">
                  <p>{t.nav.profileCenter}</p>
                  <Link to="/profile" onClick={() => { setAccountOpen(false); setMenuOpen(false) }}>
                    <UserRound size={14} />
                    <span>{t.nav.editProfile}</span>
                  </Link>
                  <Link to="/favorites" onClick={() => { setAccountOpen(false); setMenuOpen(false) }}>
                    <Star size={14} />
                    <span>{t.nav.favorites}</span>
                  </Link>
                </div>
              )}
            </div>
            <button className="icon-btn" type="button" onClick={handleLogout} aria-label={t.nav.logout}>
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <button className="login-btn" type="button" onClick={openLogin}>
            <LogIn size={14} /> {t.nav.login}
          </button>
        )}
        <button className="menu-btn" type="button" onClick={() => setMenuOpen((o) => !o)} aria-label={t.nav.menu}>
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
    </nav>
  )
}
