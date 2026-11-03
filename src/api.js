const BASE = '/api/v1'

function authHeaders(authed) {
  const h = { 'Content-Type': 'application/json' }
  if (authed) {
    const token  = localStorage.getItem('sphir_token')
    const uid    = localStorage.getItem('sphir_uid')
    const client = localStorage.getItem('sphir_client')
    if (token)  h['Authorization'] = `Bearer ${token}`
    if (uid)    h['uid'] = uid
    if (client) h['client'] = client
  }
  return h
}

function clearSession() {
  localStorage.removeItem('sphir_token')
  localStorage.removeItem('sphir_uid')
  localStorage.removeItem('sphir_client')
}

async function req(path, { method = 'GET', body, authed = true, query } = {}) {
  let url = `${BASE}${path}`
  if (query) url += '?' + new URLSearchParams(query)
  const res = await fetch(url, {
    method,
    headers: authHeaders(authed),
    body: body ? JSON.stringify(body) : undefined
  })
  if (res.status === 401 && authed) {
    clearSession()
    window.location.href = '/login?reason=session_expired'
    throw new Error('Session expired. Please sign in again.')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg  = data.message || data.error || data.errors?.join(', ') || `Error ${res.status}`
    throw new Error(msg)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const signIn  = (email, password) =>
  req('/auth/sign_in', { method: 'POST', body: { email, password }, authed: false })

export const signUp = (email, password, firstName = '', lastName = '') =>
  req('/auth', {
    method: 'POST',
    body: {
      email, password, password_confirmation: password,
      first_name: firstName, last_name: lastName,
      account_type: 'personal', domain: 'sphir.io'
    },
    authed: false
  })

export const signOut = () => req('/auth/sign_out', { method: 'DELETE' })

export const guestLogin = () => req('/auth/guest', { authed: false })

// ── Collections (folders) ────────────────────────────────────────────────────

export const fetchCollections     = ()          => req('/folders')
export const createCollection     = (body)      => req('/folders',     { method: 'POST',   body })
export const updateCollection     = (id, body)  => req(`/folders/${id}`, { method: 'PUT', body })
export const deleteCollection     = (id)        => req(`/folders/${id}`, { method: 'DELETE' })

// ── Cards (businesses) ───────────────────────────────────────────────────────

export async function fetchAllCards(page = 1, perPage = 100) {
  const data = await req('/users/get_businesses', { query: { page, per_page: perPage } })
  if (Array.isArray(data)) return data
  for (const key of ['data', 'businesses', 'results']) {
    if (Array.isArray(data?.[key])) return data[key]
  }
  return []
}

export const createCard = (body)      => req('/businesses',      { method: 'POST',   body })
export const updateCard = (id, body)  => req(`/businesses/${id}`, { method: 'PUT',   body })
export const deleteCard = (id)        => req(`/businesses/${id}`, { method: 'DELETE' })

// Preview: GET /api/v1/businesses/preview?url=... → { title, description, image }
export async function previewUrl(url) {
  try {
    return await req('/businesses/preview', { query: { url } })
  } catch {
    return null
  }
}
