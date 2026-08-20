import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { startSessionRefreshScheduler } from '@/composables/useSessionRefresh'
import { authPayloadFromRefreshResponse } from '@/api/authResponse'
import { hasAuthRetried, markAuthRetried, setAccessTokenHeader, type AuthRetryConfig } from '@/api/authRetry'
import { useAuthStore } from '@/stores/auth'
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

function toStoredSession(payload: {
  token: string
  expiresAt?: string
  refreshExpiresAt?: string
}): StoredAuthSession {
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

  const payload = authPayloadFromRefreshResponse(response)
  const session = toStoredSession(payload)
  persistAuthSession(session)
  try {
    useAuthStore().token = session.token
  } catch {
    /* Pinia ainda não inicializado */
  }
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

type PublicRequestConfig = InternalAxiosRequestConfig & {
  _retriedAnonymously?: boolean
}

/**
 * Cliente para endpoints que aceitam autenticacao opcional.
 *
 * Um token valido ainda e enviado para que a API possa identificar o proprio
 * autor. Se a credencial local estiver expirada ou invalida, a requisicao e
 * repetida anonimamente: uma sessao antiga nunca deve bloquear conteudo publico.
 */
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

publicApiClient.interceptors.request.use((config: PublicRequestConfig) => {
  const token = getAccessToken()
  if (token && !config._retriedAnonymously) {
    setAccessTokenHeader(config, AUTH_TOKEN_HEADER, token)
  }
  return config
})

publicApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as PublicRequestConfig | undefined
    if (!original || original._retriedAnonymously || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    original._retriedAnonymously = true
    delete original.headers[AUTH_TOKEN_HEADER]
    return publicApiClient.request(original)
  },
)

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    setAccessTokenHeader(config, AUTH_TOKEN_HEADER, token)
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

function shouldAttemptRefresh(error: AxiosError<ApiErrorBody>, config?: AuthRetryConfig, url?: string): boolean {
  if (hasAuthRetried(config)) return false
  if (error.response?.status !== 401) return false
  if (!url || url.includes('/auth/refresh') || url.includes('/auth/login')) return false

  const code = error.response.data?.code ?? error.response.data?.error
  return !code || code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || code === 'UNAUTHORIZED'
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as AuthRetryConfig | undefined

    if (!original || !shouldAttemptRefresh(error, original, original.url)) {
      return Promise.reject(error)
    }

    markAuthRetried(original)

    if (!refreshPromise) {
      refreshPromise = refreshAuthSession()
        .then((session) => session.token)
        .catch(() => {
          clearAuthSession()
          try {
            const auth = useAuthStore()
            auth.token = null
            auth.user = null
          } catch {
            /* noop */
          }
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

    setAccessTokenHeader(original, AUTH_TOKEN_HEADER, newToken)
    return apiClient.request(original)
  },
)

export function unwrap<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.data
}
