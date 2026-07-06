import { Link, NavLink, useLocation } from "react-router-dom"
import { ChevronDown, LogIn, LogOut, Menu, Shield, X } from "lucide-react"
import { useState } from "react"
import type { User } from "../types"
import { categories } from "../data/categories"

const navItems = [
  { path: "/", name: "首页" },
  { path: "/synbio", name: "合成生物学科普" },
  { path: "/applications", name: "项目应用科普" },
  { path: "/activities", name: "缤纷开放活动" },
  { path: "/cooperation", name: "教育合作" },
  { path: "/about", name: "关于联盟" },
]

interface HeaderProps {
  user: User | null
  setUser: (user: User | null) => void
  openLogin: () => void
}

export function Header({ user, setUser, openLogin }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const currentCategory = categories.find((c) => location.pathname.startsWith(c.path))

  return (
    <>
      {/* Global Nav — black bar */}
      <nav className="global-nav">
        <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">HP</span>
          <span>HP-Education 联盟</span>
        </Link>
        <div className={menuOpen ? "nav-links open" : "nav-links"}>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === "/"} onClick={() => setMenuOpen(false)}>
              {item.name}
            </NavLink>
          ))}
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              {user.role === "admin" && <span className="admin-badge"><Shield size={12} /> 管理员</span>}
              <span className="team-pill">{user.teamName}</span>
              <button className="icon-btn" type="button" onClick={() => { localStorage.removeItem("authToken"); setUser(null) }} aria-label="退出登录">
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <button className="login-btn" type="button" onClick={openLogin}>
              <LogIn size={14} /> 登录
            </button>
          )}
          <button className="menu-btn" type="button" onClick={() => setMenuOpen((o) => !o)} aria-label="菜单">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Sub Nav — frosted parchment */}
      {currentCategory && (
        <div className="sub-nav">
          <span className="sub-nav-title">{currentCategory.name}</span>
          <div className="sub-nav-actions">
            <Link className="pill-btn primary" to={`/submit?category=${currentCategory.id}`}>
              发布项目招募
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
