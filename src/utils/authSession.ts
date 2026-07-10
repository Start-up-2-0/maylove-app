import { STORAGE_KEYS } from '@/constants/storageKeys'

export interface StoredAuthSession {
  token: string
  expiresAt: string
  refreshExpiresAt: string
}

const memoryToken: { value: string | null } = { value: null }

function sessionStore() {
  return {
    get(key: string): string | null {
      try {
        return sessionStorage.getItem(key)
      } catch {
        return null
      }
    },
    set(key: string, value: string): void {
      try {
        sessionStorage.setItem(key, value)
      } catch {
        // quota ou modo privado
      }
    },
    remove(key: string): void {
      try {
        sessionStorage.removeItem(key)
      } catch {
        // noop
      }
    },
  }
}

const session = sessionStore()

/** Limpa chaves legadas do localStorage (refresh agora fica só no cookie HttpOnly). */
function clearLegacyStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem('maylove_refresh_token')
  } catch {
    // noop
  }
}

export function getAccessToken(): string | null {
  return memoryToken.value ?? session.get(STORAGE_KEYS.ACCESS_TOKEN)
}

export function readStoredSession(): Partial<StoredAuthSession> {
  const token = memoryToken.value ?? session.get(STORAGE_KEYS.ACCESS_TOKEN) ?? undefined
  return {
    token,
    expiresAt: session.get(STORAGE_KEYS.EXPIRES_AT) ?? undefined,
    refreshExpiresAt: session.get(STORAGE_KEYS.REFRESH_EXPIRES_AT) ?? undefined,
  }
}

export function persistAuthSession(data: StoredAuthSession): void {
  memoryToken.value = data.token
  session.set(STORAGE_KEYS.ACCESS_TOKEN, data.token)
  session.set(STORAGE_KEYS.EXPIRES_AT, data.expiresAt)
  session.set(STORAGE_KEYS.REFRESH_EXPIRES_AT, data.refreshExpiresAt)
  clearLegacyStorage()
}

export function setAccessToken(token: string): void {
  memoryToken.value = token
  session.set(STORAGE_KEYS.ACCESS_TOKEN, token)
}

export function clearAuthSession(): void {
  memoryToken.value = null
  session.remove(STORAGE_KEYS.ACCESS_TOKEN)
  session.remove(STORAGE_KEYS.EXPIRES_AT)
  session.remove(STORAGE_KEYS.REFRESH_EXPIRES_AT)
  clearLegacyStorage()
}

export function isAccessTokenExpired(marginMs = 5_000): boolean {
  const { token, expiresAt } = readStoredSession()
  if (!token) return true
  if (!expiresAt) return false
  const expiresMs = new Date(expiresAt).getTime()
  if (Number.isNaN(expiresMs)) return true
  return expiresMs <= Date.now() + marginMs
}

export function isRefreshSessionExpired(): boolean {
  const { refreshExpiresAt } = readStoredSession()
  if (!refreshExpiresAt) return false
  const expiresMs = new Date(refreshExpiresAt).getTime()
  if (Number.isNaN(expiresMs)) return true
  return expiresMs <= Date.now()
}
