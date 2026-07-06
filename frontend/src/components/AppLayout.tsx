import type { ReactNode } from "react"
import type { User } from "../types"
import { Header } from "./Header"

interface AppLayoutProps {
  children: ReactNode
  user: User | null
  setUser: (user: User | null) => void
  openLogin: () => void
}

export function AppLayout({ children, user, setUser, openLogin }: AppLayoutProps) {
  return (
    <>
      <Header user={user} setUser={setUser} openLogin={openLogin} />
      <main>{children}</main>
      <footer>
        <div>HP-Education 联盟</div>
        <span>Westlake University × Zhejiang University · iGEM Education Demo</span>
      </footer>
    </>
  )
}
