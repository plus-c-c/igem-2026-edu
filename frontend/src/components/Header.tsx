import { Link, NavLink } from "react-router-dom"
import { ChevronDown, LogIn, LogOut, Monitor, Moon, Shield, Sun } from "lucide-react"
import { useState } from "react"
import type { User } from "../types"

const themeOptions = {
  system: { label: "跟随系统", icon: Monitor },
  light: { label: "浅色模式", icon: Sun },
  dark: { label: "深色模式", icon: Moon },
}

const themeOrder: Array<"system" | "light" | "dark"> = ["system", "light", "dark"]

const navItems = [
  { path: "/", name: "首页" },
  { path: "/synbio", name: "合成生物学科普" },
  { path: "/applications", name: "项目应用科普" },
  { path: "/activities", name: "缤纷开放活动" },
  { path: "/cooperation", name: "教育合作" },
  { path: "/about", name: "关于联盟" },
  { path: "/submit", name: "教育项目招募" },
]

interface HeaderProps {
  user: User | null
  setUser: (user: User | null) => void
  openLogin: () => void
  themeMode: string
  setThemeMode: (mode: "system" | "light" | "dark") => void
}

export function Header({ user, setUser, openLogin, themeMode, setThemeMode }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const nextThemeMode = themeOrder[(themeOrder.indexOf(themeMode as any) + 1) % themeOrder.length]
  const ThemeIcon = themeOptions[themeMode as keyof typeof themeOptions]?.icon || Monitor

  return (
    <header className="site-header">
      <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
        <span className="brand-mark">HP</span>
        <span>
          HP-Education 联盟
          <small>Education Resource Hub</small>
        </span>
      </Link>
      <button className="menu-button" type="button" onClick={() => setMenuOpen((o) => !o)}>
        栏目 <ChevronDown size={16} />
      </button>
      <nav className={menuOpen ? "nav open" : "nav"}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"} onClick={() => setMenuOpen(false)}>
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="account">
        <button
          className="icon-button theme-toggle"
          type="button"
          onClick={() => setThemeMode(nextThemeMode)}
          aria-label={`当前：${themeOptions[themeMode as keyof typeof themeOptions]?.label}。切换到${themeOptions[nextThemeMode].label}`}
          title={`当前：${themeOptions[themeMode as keyof typeof themeOptions]?.label}`}
        >
          <ThemeIcon size={18} />
        </button>
        {user ? (
          <>
            {user.role === "admin" && <span className="admin-badge"><Shield size={14} /> 管理员</span>}
            <span className="team-pill">{user.teamName}</span>
            <button className="icon-button" type="button" onClick={() => { localStorage.removeItem("authToken"); setUser(null) }} aria-label="退出登录">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <button className="login-button" type="button" onClick={openLogin}>
            <LogIn size={18} /> 登录
          </button>
        )}
      </div>
    </header>
  )
}
