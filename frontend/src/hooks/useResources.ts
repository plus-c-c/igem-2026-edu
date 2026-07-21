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

  useEffect(() => {
    const timer = setInterval(fetchResources, 30000)
    return () => clearInterval(timer)
  }, [fetchResources])

  const addResource = (resource: Partial<Resource>) => {
    if (resource.id) {
      const cat = categories.find((c) => c.id === resource.category)
      fetchResources()
      if (cat) navigate(cat.path)
    }
  }

  const updateResource = (id: string, updated: Partial<Resource>) => {
    fetchResources()
    navigate(`/cases/${updated.id}`)
  }

  const deleteResource = (id: string) => {
    resourceService.remove(id).then(() => {
      fetchResources()
    }).catch(() => {})
  }

  const findById = (id: string) => resources.find((r) => String(r.id) === id) || null

  return { resources, loading, error, retry: fetchResources, addResource, updateResource, deleteResource, findById }
}
