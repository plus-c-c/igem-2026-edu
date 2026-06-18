import type React from "react"

export interface User {
  id: string
  email: string
  teamName: string
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
  createdAt?: string
  updatedAt?: string
}

export interface CampaignCase {
  category: string
  title: string
  subtitle: string
  image: string
  format: string
  impact: string
  materials: string[]
}

export interface ProjectMeta {
  organization: string
  kind: string
  delivery: string
  region: string
  duration: string
  venue: string
}

export type CategoryId = "synbio" | "applications" | "activities" | "cooperation" | "about"
