import type { IncidentRecord } from '../types'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api').replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  headers.set('Content-Type', 'application/json')
  const token = window.localStorage.getItem('nirvaan_token')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error ?? `API request failed with status ${response.status}.`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function saveIncident(incident: IncidentRecord) {
  return request<IncidentRecord>('/incidents', {
    method: 'POST',
    body: JSON.stringify(incident),
  })
}

export async function getAllIncidents() {
  return request<IncidentRecord[]>('/incidents')
}

export async function getIncidentByComplaintId(complaintId: string) {
  try {
    return await request<IncidentRecord>(`/incidents/${encodeURIComponent(complaintId)}`)
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) return undefined
    throw error
  }
}

export async function updateIncident(id: string, updates: Partial<IncidentRecord>) {
  return request<IncidentRecord>(`/incidents/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function clearAllIncidents() {
  await request<void>('/incidents', { method: 'DELETE' })
}

export async function seedDemoData(incidents: IncidentRecord[]) {
  const existing = await getAllIncidents()
  if (existing.length > 0) return existing
  await Promise.all(incidents.map((incident) => saveIncident(incident)))
  return getAllIncidents()
}

export async function login(email: string, password: string) {
  const result = await request<{ token: string; user: { id: string; email: string; role: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  window.localStorage.setItem('nirvaan_token', result.token)
  return result.user
}
