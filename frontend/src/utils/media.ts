/** 封面媒体类型判定: 优先用后端存的 imageType, 否则按 URL 扩展名推断。 */

const VIDEO_EXT = /\.(mp4|m4v|webm|ogv|ogg|mov|avi|mkv)(?:[?#].*)?$/i

export function isVideoUrl(url?: string | null): boolean {
  return !!url && VIDEO_EXT.test(url)
}

export function isVideoCover(url?: string | null, imageType?: string | null): boolean {
  if (!url) return false
  if (imageType === "video") return true
  if (imageType === "image") return false
  return isVideoUrl(url)
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/") || isVideoUrl(file.name)
}
