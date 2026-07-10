import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { resourceService } from "../services/resourceService"
import { authHeaders } from "../services/client"
import { SubmitResourcePage } from "./SubmitResourcePage"
import { LoginRequiredPage } from "./Pages"
import type { Resource, User } from "../types"

interface EditResourceRouteProps {
  user: User | null
  addResource: (resource: Partial<Resource>) => void
  updateResource: (id: string, updated: Partial<Resource>) => void
  findById: (id: string) => Resource | null
  openLogin: () => void
}

export function EditResourceRoute({ user, addResource, updateResource, findById, openLogin }: EditResourceRouteProps) {
  const { resourceId } = useParams<{ resourceId: string }>()
  const [editRes, setEditRes] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!resourceId) { setLoading(false); return }
    const loadEditRes = async () => {
      try {
        const data = await resourceService.get(resourceId)
        const res = data.resource
        if (!res) { setLoading(false); return }
        if (res.status === "published") {
          const draftRes = await fetch(`/api/resources/draft-for/${resourceId}`, { headers: authHeaders() })
          if (draftRes.ok) {
            const draftData = await draftRes.json()
            if (draftData.resource) { setEditRes(draftData.resource); setLoading(false); return }
          }
        }
        setEditRes(res)
      } catch {
        setEditRes(findById(resourceId!))
      }
      setLoading(false)
    }
    loadEditRes()
  }, [resourceId, findById])

  if (loading) return null
  return user
    ? <SubmitResourcePage key={editRes?.id || "edit"} user={user} addResource={addResource} updateResource={updateResource} editResource={editRes} />
    : <LoginRequiredPage openLogin={openLogin} />
}
