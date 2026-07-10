import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom"
import { setOnUnauthorized } from "./services/client"
import { categories } from "./data/categories"
import { useLocalAuth } from "./hooks/useLocalAuth"
import { useResources } from "./hooks/useResources"
import { AppLayout } from "./components/AppLayout"
import { HomePage, LoginRequiredPage, CategoryPage, CaseDetailPage, RecruitmentPage, AboutPage, FavoritesPage } from "./components/Pages"
import { SubmitResourcePage } from "./components/SubmitResourcePage"
import { ProfilePage } from "./components/ProfilePage"
import { LoginModal } from "./components/LoginModal"
import { EditResourceRoute } from "./components/EditResourceRoute"
import { LanguageProvider } from "./i18n"
import "./styles/index.css"

function App() {
  const [user, setUser, authLoading] = useLocalAuth()
  const { resources, addResource, updateResource, deleteResource, findById } = useResources()
  const [loginOpen, setLoginOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setOnUnauthorized(() => {
      localStorage.removeItem("authToken")
      localStorage.removeItem("hpEduUser")
      setUser(null)
    })
  }, [setUser])

  const requestSubmit = (categoryId?: string) => {
    if (!user) {
      setLoginOpen(true)
      return
    }
    const params = new URLSearchParams()
    if (categoryId) params.set("category", categoryId)
    navigate(`/submit${params.toString() ? `?${params.toString()}` : ""}`)
  }

  if (authLoading) return null

  return (
    <AppLayout user={user} setUser={setUser} openLogin={() => setLoginOpen(true)}>
      <Routes>
        <Route path="/" element={<HomePage resources={resources} />} />
        <Route path="/applications" element={<Navigate to="/lecture" replace />} />
        <Route path="/recruitment" element={<RecruitmentPage resources={resources} onSubmit={requestSubmit} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/submit"
          element={user ? <SubmitResourcePage key="new" user={user} addResource={addResource} /> : <LoginRequiredPage openLogin={() => setLoginOpen(true)} />}
        />
        <Route path="/cases/:caseId" element={<CaseDetailPage resources={resources} user={user} onDelete={deleteResource} />} />
          <Route path="/resource/:resourceId/edit" element={<EditResourceRoute user={user} addResource={addResource} updateResource={updateResource} findById={findById} openLogin={() => setLoginOpen(true)} />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} setUser={setUser} /> : <LoginRequiredPage openLogin={() => setLoginOpen(true)} />} />
          <Route path="/favorites" element={user ? <FavoritesPage resources={resources} /> : <LoginRequiredPage openLogin={() => setLoginOpen(true)} />} />
        {categories.filter((cat) => cat.id !== "about").map((cat) => (
          <Route key={cat.id} path={cat.path} element={<CategoryPage category={cat} resources={resources} onSubmit={requestSubmit} />} />
        ))}
      </Routes>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={setUser} />
    </AppLayout>
  )
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </BrowserRouter>
)
