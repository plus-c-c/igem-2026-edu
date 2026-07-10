import { DEFAULT_AVATAR } from "../data/constants"
import type { User } from "../types"

export function resizeAvatar(file: File, maxSize = 384, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const width = Math.max(1, Math.round(img.width * scale))
      const height = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas is not available"))
        return
      }
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/jpeg", quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Invalid image"))
    }

    img.src = url
  })
}

export function mapUser(user: any): User {
  return {
    id: user.id,
    email: user.email,
    teamName: user.name,
    role: user.role,
    registrantName: user.registrantName,
    igemRole: user.igemRole,
    avatar: user.avatar || DEFAULT_AVATAR,
  }
}
