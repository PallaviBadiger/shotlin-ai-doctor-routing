import { useAuthStore } from '@/store/auth.store'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function req(path, options = {}) {
  const token = useAuthStore.getState().token
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  if (options.body instanceof FormData) delete headers['Content-Type']
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`)
  return data
}

export const api = {
  post: (path, body) => req(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: (path, form) => req(path, { method: 'POST', body: form, headers: {} }),
  get: (path) => req(path),
  patch: (path, body) => req(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => req(path, { method: 'DELETE' }),
}

export default api

export function fileUrl(name) {
  return `${BASE}/uploads/${name}`
}