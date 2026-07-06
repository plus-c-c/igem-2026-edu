import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom"
import type { Resource } from "./types"
import { resourceApi } from "./api"
import { categories } from "./data/categories"
import { useLocalAuth } from "./hooks/useLocalAuth"
import { AppLayout } from "./components/AppLayout"
import { HomePage, LoginRequiredPage, CategoryPage, CaseDetailPage } from "./components/Pages"
import { SubmitResourcePage } from "./components/SubmitResourcePage"
import { LoginModal } from "./components/LoginModal"
import "./styles.css"

function App() {
  const [user, setUser, authLoading] = useLocalAuth()
  const [resources, setResources] = useState<Resource[]>([])
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
    const params = new URLSearchParams()
    if (categoryId) params.set("category", categoryId)
    navigate(`/submit${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const addResource = (resource: Partial<Resource>) => {
    resourceApi.create(resource).then((res: any) => {
      if (res.resource) {
        setResources((items) => [res.resource, ...items])
        const cat = categories.find((c) => c.id === resource.category)
        if (cat) navigate(cat.path)
      }
    })
  }

  const updateResource = (id: string, updated: Partial<Resource>) => {
    setResources((items) => items.map((r) => String(r.id) === id ? { ...r, ...updated } : r))
    const slug = (updated.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    navigate(`/cases/${slug}`)
  }

  const deleteResource = (id: string) => {
    resourceApi.remove(id).then((res: any) => {
      if (res.message) {
        setResources((items) => items.filter((r) => String(r.id) !== id))
        navigate("/")
      }
    })
  }

  const EditResourceRoute = () => {
    const { resourceId } = useParams<{ resourceId: string }>()
    const resource = resources.find((r) => String(r.id) === resourceId) || null
    return user
      ? <SubmitResourcePage key={resource?.id || "edit"} user={user} addResource={addResource} updateResource={updateResource} editResource={resource} />
      : <LoginRequiredPage openLogin={() => setLoginOpen(true)} />
  }

  if (authLoading) return null

  return (
    <AppLayout user={user} setUser={setUser} openLogin={() => setLoginOpen(true)}>
      <Routes>
        <Route path="/" element={<HomePage resources={resources} onSubmit={requestSubmit} />} />
        <Route
          path="/submit"
          element={user ? <SubmitResourcePage key="new" user={user} addResource={addResource} /> : <LoginRequiredPage openLogin={() => setLoginOpen(true)} />}
        />
        <Route path="/cases/:caseId" element={<CaseDetailPage resources={resources} user={user} onDelete={deleteResource} />} />
        <Route path="/resource/:resourceId/edit" element={<EditResourceRoute />} />
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
