import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom"
import type { Resource } from "./types"
import { resourceApi } from "./api"
import { categories } from "./data/categories"
import { starterResources } from "./data/resources"
import { useLocalAuth } from "./hooks/useLocalAuth"
import { AppLayout } from "./components/AppLayout"
import { HomePage, ResourceLibraryPage, LoginRequiredPage, CategoryPage, CaseDetailPage, ResourceDetailPage } from "./components/Pages"
import { SubmitResourcePage } from "./components/SubmitResourcePage"
import { LoginModal } from "./components/LoginModal"
import "./styles.css"

function App() {
  const [user, setUser, authLoading] = useLocalAuth()
  const [resources, setResources] = useState<Resource[]>(starterResources)
  const [loginOpen, setLoginOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    resourceApi.list().then((items) => {
      if (items.length) setResources(items)
    })
  }, [])

  const requestSubmit = (categoryId?: string, campaign?: boolean) => {
    if (!user) {
      setLoginOpen(true)
      return
    }
    const params = new URLSearchParams()
    if (categoryId) params.set("category", categoryId)
    if (campaign) params.set("type", "campaign")
    navigate(`/submit${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const addResource = (resource: Partial<Resource>) => {
    resourceApi.create(resource).then((res: any) => {
      if (res.resource) {
        setResources((items) => [res.resource, ...items])
        navigate(`/resources?category=${resource.category}`)
      }
    })
  }

  const updateResource = (id: string, updated: Partial<Resource>) => {
    setResources((items) => items.map((r) => String(r.id) === id ? { ...r, ...updated } : r))
    navigate(`/resource/${id}`)
  }

  const deleteResource = (id: string) => {
    resourceApi.remove(id).then((res: any) => {
      if (res.message) {
        setResources((items) => items.filter((r) => String(r.id) !== id))
        navigate("/resources")
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
        <Route path="/resources" element={<ResourceLibraryPage resources={resources} onSubmit={requestSubmit} />} />
        <Route
          path="/submit"
          element={user ? <SubmitResourcePage key="new" user={user} addResource={addResource} /> : <LoginRequiredPage openLogin={() => setLoginOpen(true)} />}
        />
        <Route path="/cases/:caseId" element={<CaseDetailPage resources={resources} user={user} onDelete={deleteResource} />} />
        <Route path="/resource/:resourceId/edit" element={<EditResourceRoute />} />
        <Route path="/resource/:resourceId" element={<ResourceDetailPage resources={resources} user={user} onDelete={deleteResource} />} />
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
