import { API_BASE } from "./client"

export interface RegisterPayload {
  email: string
  name: string
  password: string
  registrantName: string
  igemRole: string
  avatar?: string
}

export const authService = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return res.json()
  },

  sendCode: async ({ email, name, password, registrantName, igemRole, avatar }: RegisterPayload) => {
    const res = await fetch(`${API_BASE}/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, registrantName, igemRole, avatar }),
    })
    return res.json()
  },

  verifyRegister: async ({ email, code }: { email: string; code: string }) => {
    const res = await fetch(`${API_BASE}/auth/verify-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    })
    return res.json()
  },

  getMe: async (token: string) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json()
  },

  updateMe: async (token: string, data: { name?: string; registrantName?: string; igemRole?: string; avatar?: string }) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  changePassword: async (token: string, currentPassword: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    return res.json()
  },

  sendPasswordResetCode: async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/send-password-reset-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    return res.json()
  },

  resetPassword: async ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    })
    return res.json()
  },
}
