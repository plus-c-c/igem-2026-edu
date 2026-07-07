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
        <div className="footer-brand">
          <span>SynEdu Global</span>
          <img src="/images/logo.jpg" alt="SynEdu Global" />
        </div>
        <div className="footer-partners">
          <span>ZJU-China &amp; Westlake &amp; XJTLU-China</span>
          <div className="footer-partner-logos">
            <img src="/images/logoWestlake.png" alt="Westlake" />
            <img src="/images/logoXJTLU.png" alt="XJTLU-China" />
          </div>
        </div>
      </footer>
    </>
  )
}
