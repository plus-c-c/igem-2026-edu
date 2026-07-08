import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Resource } from "../types"
import { resourceService } from "../services/resourceService"
import { categories } from "../data/categories"


export function useResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    resourceService.list().then((items) => {
      if (items.length) setResources(items)
    })
  }, [])

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
        navigate("/")
      }
    })
  }

  const findById = (id: string) => resources.find((r) => String(r.id) === id) || null

  return { resources, addResource, updateResource, deleteResource, findById }
}
