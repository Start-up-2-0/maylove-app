import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { startSessionRefreshScheduler } from '@/composables/useSessionRefresh'
import {
  clearAuthSession,
  getAccessToken,
  persistAuthSession,
  type StoredAuthSession,
} from '@/utils/authSession'
import { API_BASE_URL, AUTH_TOKEN_HEADER, type ApiEnvelope, type ApiErrorBody, type AuthPayload } from './types'

/** @deprecated use getAccessToken from authSession */
export function getStoredToken(): string | null {
  return getAccessToken()
}

export function setStoredTokens(token: string, _refreshToken?: string): void {
  // Mantido por compatibilidade; login/refresh usam persistAuthSession com expiresAt.
  persistAuthSession({
    token,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    refreshExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  })
}

export function clearStoredTokens(): void {
  clearAuthSession()
}

function toStoredSession(payload: AuthPayload): StoredAuthSession {
  const expiresAt =
    payload.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000).toISOString()
  const refreshExpiresAt =
    payload.refreshExpiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  return {
    token: payload.token,
    expiresAt,
    refreshExpiresAt,
  }
}

export async function refreshAuthSession(): Promise<StoredAuthSession> {
  const response = await axios.post<ApiEnvelope<AuthPayload>>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    },
  )

  const session = toStoredSession(response.data.data)
  persistAuthSession(session)
  startSessionRefreshScheduler()
  return session
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.set(AUTH_TOKEN_HEADER, token)
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

function shouldAttemptRefresh(error: AxiosError<ApiErrorBody>, url?: string): boolean {
  if (error.response?.status !== 401) return false
  if (!url || url.includes('/auth/refresh') || url.includes('/auth/login')) return false

  const code = error.response.data?.code ?? error.response.data?.error
  return !code || code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || code === 'UNAUTHORIZED'
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config

    if (!original || !shouldAttemptRefresh(error, original.url)) {
      return Promise.reject(error)
    }

    if (!refreshPromise) {
      refreshPromise = refreshAuthSession()
        .then((session) => session.token)
        .catch(() => {
          clearAuthSession()
          return null
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    const newToken = await refreshPromise
    if (!newToken) {
      return Promise.reject(error)
    }

    original.headers.set(AUTH_TOKEN_HEADER, newToken)
    return apiClient.request(original)
  },
)

export function unwrap<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.data
}
