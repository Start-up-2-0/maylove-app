import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, AUTH_TOKEN_HEADER, type ApiEnvelope, type ApiErrorBody, type AuthPayload } from './types'

const TOKEN_STORAGE_KEY = 'maylove_access_token'
const REFRESH_STORAGE_KEY = 'maylove_refresh_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredTokens(token: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  if (refreshToken) {
    localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken)
  }
}

export function clearStoredTokens(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_STORAGE_KEY)
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()
  if (token) {
    config.headers.set(AUTH_TOKEN_HEADER, token)
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_STORAGE_KEY)
  const response = await axios.post<ApiEnvelope<AuthPayload>>(
    `${API_BASE_URL}/auth/refresh`,
    refreshToken ? { refreshToken } : {},
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    },
  )

  const token = response.data.data.token
  setStoredTokens(token, response.data.data.refresh_token)
  return token
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config
    const code = error.response?.data?.error

    if (!original || code !== 'TOKEN_EXPIRED' || original.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken()
        .catch(() => {
          clearStoredTokens()
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
