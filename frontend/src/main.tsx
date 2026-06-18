import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import type { Resource } from "./types"
import { resourceApi } from "./api"
import { categories } from "./data/categories"
import { starterResources } from "./data/resources"
import { useLocalAuth } from "./hooks/useLocalAuth"
import { useThemeMode } from "./hooks/useThemeMode"
import { AppLayout } from "./components/AppLayout"
import { HomePage, ResourceLibraryPage, LoginRequiredPage, CategoryPage, CaseDetailPage } from "./components/Pages"
import { SubmitResourcePage } from "./components/SubmitResourcePage"
import { LoginModal } from "./components/LoginModal"
import "./styles.css"

function App() {
  const [user, setUser, authLoading] = useLocalAuth()
  const [themeMode, setThemeMode] = useThemeMode()
  const [resources, setResources] = useState<Resource[]>(starterResources)
  const [loginOpen, setLoginOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    resourceApi.list().then((items) => {
      if (items.length) setResources(items)
    })
  }, [])

  const requestSubmit = (categoryId?: string) => {
    if (!user) {
      setLoginOpen(true)
      return
    }
    navigate(categoryId ? `/submit?category=${categoryId}` : "/submit")
  }

  const addResource = (resource: Partial<Resource>) => {
    resourceApi.create(resource).then((res: any) => {
      if (res.resource) {
        setResources((items) => [res.resource, ...items])
        navigate(`/resources?category=${resource.category}`)
      }
    })
  }

  if (authLoading) return null

  return (
    <AppLayout user={user} setUser={setUser} openLogin={() => setLoginOpen(true)} themeMode={themeMode} setThemeMode={setThemeMode}>
      <Routes>
        <Route path="/" element={<HomePage resources={resources} onSubmit={requestSubmit} />} />
        <Route path="/resources" element={<ResourceLibraryPage resources={resources} onSubmit={requestSubmit} />} />
        <Route
          path="/submit"
          element={user ? <SubmitResourcePage user={user} addResource={addResource} /> : <LoginRequiredPage openLogin={() => setLoginOpen(true)} />}
        />
        <Route path="/cases/:caseId" element={<CaseDetailPage onSubmit={requestSubmit} />} />
        {categories.map((cat) => (
          <Route key={cat.id} path={cat.path} element={<CategoryPage category={cat} resources={resources} onSubmit={requestSubmit} />} />
        ))}
      </Routes>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={setUser} />
    </AppLayout>
  )
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
