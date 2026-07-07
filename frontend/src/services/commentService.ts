import { API_BASE, authHeaders, authFetch } from "./client"

export interface CommentData {
  id: string
  resourceId: string
  userId: string
  content: string
  parentId: string | null
  createdAt: string
  likesCount: number
  likedByMe: boolean
  user: { id: string; name: string; email: string }
  replies: CommentData[]
}

export const commentService = {
  list: async (resourceId: string): Promise<CommentData[]> => {
    const res = await fetch(`${API_BASE}/resources/${resourceId}/comments`)
    const data = await res.json()
    return data.comments || []
  },

  create: async (resourceId: string, content: string): Promise<CommentData> => {
    const res = await authFetch(`${API_BASE}/resources/${resourceId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "评论失败")
    return data.comment
  },

  reply: async (resourceId: string, commentId: string, content: string): Promise<CommentData> => {
    const res = await authFetch(`${API_BASE}/resources/${resourceId}/comments/${commentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "回复失败")
    return data.comment
  },

  like: async (resourceId: string, commentId: string): Promise<{ likesCount: number }> => {
    const res = await authFetch(`${API_BASE}/resources/${resourceId}/comments/${commentId}/like`, {
      method: "POST",
      headers: authHeaders(),
    })
    return res.json()
  },

  unlike: async (resourceId: string, commentId: string): Promise<{ likesCount: number }> => {
    const res = await authFetch(`${API_BASE}/resources/${resourceId}/comments/${commentId}/like`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    return res.json()
  },
}
