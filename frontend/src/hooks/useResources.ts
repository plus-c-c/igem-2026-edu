import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Resource } from "../types"
import { resourceService } from "../services/resourceService"
import { categories } from "../data/categories"


export function useResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchResources = useCallback(() => {
    setLoading(true)
    setError(null)
    resourceService.list()
      .then((items) => {
        setResources(items)
        setLoading(false)
      })
      .catch(() => {
        setError("加载失败，请检查网络后重试")
        setLoading(false)
      })
  }, [])

  useEffect(() => { fetchResources() }, [fetchResources])

  const addResource = (resource: Partial<Resource>) => {
    if (resource.id) {
      setResources((items) => [resource as Resource, ...items])
      const cat = categories.find((c) => c.id === resource.category)
      if (cat) navigate(cat.path)
    }
  }

  const updateResource = (id: string, updated: Partial<Resource>) => {
    setResources((items) => items.map((r) => String(r.id) === id ? { ...r, ...updated } : r))
    navigate(`/cases/${updated.id}`)
  }

  const deleteResource = (id: string) => {
    resourceService.remove(id).then((res: any) => {
      if (res.message) {
        setResources((items) => items.filter((r) => String(r.id) !== id))
      }
    }).catch(() => {})
  }

  const findById = (id: string) => resources.find((r) => String(r.id) === id) || null

  return { resources, loading, error, retry: fetchResources, addResource, updateResource, deleteResource, findById }
}
