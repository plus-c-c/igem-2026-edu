import type React from "react"

export interface User {
  id: string
  email: string
  teamName: string
  role?: string
  registrantName?: string
  igemRole?: string
  avatar?: string
}

export interface Category {
  id: string
  path: string
  name: string
  short: string
  icon: React.ComponentType<{ size?: number }>
  intro: string
  accent: string
  image: string
  recommended: string[]
}

export interface Resource {
  id: string | number
  userId?: string
  category: string
  team: string
  organization?: string
  title: string
  negotiator?: string
  acceptsOthers?: string
  delivery?: string
  audience: string
  duration?: string
  location?: string
  reimbursement?: string
  contact?: string
  desc: string
  materials: string[]
  type?: string
  status?: string
  originalId?: string
  subtitle?: string
  image?: string
  format?: string
  impact?: string
  campaignSteps?: { id: string; text: string; files: { fileId: string; name: string }[] }[]
  // 活动信息
  canParticipate?: string
  locationType?: string
  locationCountry?: string
  locationProvince?: string
  locationCity?: string
  eventDate?: string
  timeLimitType?: string
  timeRangeStart?: string
  timeRangeEnd?: string
  duration?: string
  // 项目Tips
  tips?: string
  // 现场照片
  sitePhotosFormat?: string
  sitePhotoIds?: string
  // 项目介绍书
  introductionContent?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProjectMeta {
  organization: string
  kind: string
  delivery: string
  region: string
  duration: string
  venue: string
}

export type CategoryId = "applications" | "activities" | "cooperation" | "about"

export interface UploadedFile {
  id: string
  resourceId: string
  originalName: string
  storedName: string
  mimeType: string
  size: number
  materialLabel?: string
  createdAt?: string
}
