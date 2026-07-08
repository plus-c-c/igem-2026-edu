import { Link, NavLink } from "react-router-dom"
import { Globe2, LogIn, LogOut, Menu, Shield, X } from "lucide-react"
import { useState } from "react"
import type { User } from "../types"
import { useI18n } from "../i18n"

interface HeaderProps {
  user: User | null
  setUser: (user: User | null) => void
  openLogin: () => void
}

export function Header({ user, setUser, openLogin }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
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
  }

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
        <button className="language-toggle" type="button" onClick={toggleLanguage} aria-label={language === "zh" ? "Switch to English" : "切换到中文"}>
          <Globe2 size={15} />
          <span>{language === "zh" ? "中 / EN" : "EN / 中"}</span>
        </button>
        {user ? (
          <>
            {user.role === "admin" && <span className="admin-badge"><Shield size={12} /> {t.nav.admin}</span>}
            <Link className="team-pill" to="/profile" onClick={() => setMenuOpen(false)}>{user.teamName}</Link>
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
