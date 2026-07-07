import { API_BASE } from "./client"

export const authService = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return res.json()
  },

  sendCode: async ({ email, name, password }: { email: string; name: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
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
}
