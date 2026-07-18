import { defineStore } from 'pinia'
import { clearStoredTokens, refreshAuthSession } from '@/api/client'
import * as authApi from '@/api/auth'
import type { AuthPayload, User } from '@/api/types'
import { startSessionRefreshScheduler, stopSessionRefreshScheduler } from '@/composables/useSessionRefresh'
import {
  clearAuthSession,
  getAccessToken,
  isAccessTokenExpired,
  isRefreshSessionExpired,
  persistAuthSession,
  readStoredSession,
} from '@/utils/authSession'

function applyAuthPayload(payload: AuthPayload): void {
  persistAuthSession({
    token: payload.token,
    expiresAt: payload.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    refreshExpiresAt:
      payload.refreshExpiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  })
  startSessionRefreshScheduler()
}

let bootstrapPromise: Promise<void> | null = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: getAccessToken(),
    loading: false,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
  },
  actions: {
    hydrateFromStorage() {
      const stored = readStoredSession()
      this.token = stored.token ?? null
    },

    async tryRestoreSession(): Promise<boolean> {
      if (isRefreshSessionExpired()) {
        clearAuthSession()
        this.token = null
        return false
      }

      const hasToken = Boolean(getAccessToken())
      if (hasToken && !isAccessTokenExpired()) {
        this.token = getAccessToken()
        startSessionRefreshScheduler()
        return true
      }

      try {
        const session = await refreshAuthSession()
        this.token = session.token
        return true
      } catch {
        clearAuthSession()
        this.token = null
        return false
      }
    },

    async bootstrap() {
      if (bootstrapPromise) return bootstrapPromise

      bootstrapPromise = (async () => {
        this.hydrateFromStorage()
        this.loading = true
        try {
          const restored = await this.tryRestoreSession()
          if (!restored) {
            this.user = null
            return
          }
          this.user = await authApi.fetchMe()
        } catch {
          stopSessionRefreshScheduler()
          clearStoredTokens()
          this.token = null
          this.user = null
        } finally {
          this.loading = false
          this.initialized = true
          bootstrapPromise = null
        }
      })()

      return bootstrapPromise
    },

    async login(email: string, password: string) {
      const payload = await authApi.login({ email, password })
      applyAuthPayload(payload)
      this.token = payload.token
      this.user = payload.user
    },

    async logout() {
      try {
        await authApi.logout()
      } finally {
        stopSessionRefreshScheduler()
        clearStoredTokens()
        this.token = null
        this.user = null
      }
    },

    async verifyEmail(token: string) {
      const payload = await authApi.verifyEmail(token)
      if (payload.token) {
        applyAuthPayload(payload)
        this.token = payload.token
        this.user = payload.user
      }
    },
  },
})
