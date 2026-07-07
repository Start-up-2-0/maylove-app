import { defineStore } from 'pinia'
import { clearStoredTokens, setStoredTokens } from '@/api/client'
import * as authApi from '@/api/auth'
import type { User } from '@/api/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('maylove_access_token'),
    loading: false,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
  },
  actions: {
    async bootstrap() {
      if (!this.token) {
        this.initialized = true
        return
      }

      this.loading = true
      try {
        this.user = await authApi.fetchMe()
      } catch {
        clearStoredTokens()
        this.token = null
        this.user = null
      } finally {
        this.loading = false
        this.initialized = true
      }
    },
    async login(email: string, password: string) {
      const payload = await authApi.login({ email, password })
      setStoredTokens(payload.token, payload.refresh_token)
      this.token = payload.token
      this.user = payload.user
    },
    async logout() {
      try {
        await authApi.logout()
      } finally {
        clearStoredTokens()
        this.token = null
        this.user = null
      }
    },
    async verifyEmail(token: string) {
      const payload = await authApi.verifyEmail(token)
      setStoredTokens(payload.token, payload.refresh_token)
      this.token = payload.token
      this.user = payload.user
    },
  },
})
