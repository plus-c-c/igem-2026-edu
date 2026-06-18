const API_BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("hpEduToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const authApi = {
  login: async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async ({ email, password, name }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    return res.json();
  },

  getMe: async (token) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};

export const resourceApi = {
  list: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "all") params.set("category", filters.category);
    if (filters.team) params.set("team", filters.team);
    const qs = params.toString();
    const res = await fetch(`${API_BASE}/resources${qs ? `?${qs}` : ""}`);
    const data = await res.json();
    let items = data.resources || [];
    if (filters.material && filters.material !== "all") {
      items = items.filter((r) => r.materials?.includes(filters.material));
    }
    if (filters.audience) {
      items = items.filter((r) => r.audience?.includes(filters.audience));
    }
    return items;
  },

  create: async (resource) => {
    const res = await fetch(`${API_BASE}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(resource),
    });
    return res.json();
  },

  get: async (id) => {
    const res = await fetch(`${API_BASE}/resources/${id}`);
    return res.json();
  },

  remove: async (id) => {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return res.json();
  },
};
