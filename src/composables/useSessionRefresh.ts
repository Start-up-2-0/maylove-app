import { refreshAuthSession } from '@/api/client'
import { readStoredSession } from '@/utils/authSession'

const REFRESH_MARGIN_MS = 60_000

let refreshTimer: ReturnType<typeof setTimeout> | null = null

function clearRefreshTimer(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

export function startSessionRefreshScheduler(): void {
  clearRefreshTimer()

  const { expiresAt } = readStoredSession()
  if (!expiresAt) return

  const expiresMs = new Date(expiresAt).getTime()
  if (Number.isNaN(expiresMs)) return

  const delay = expiresMs - Date.now() - REFRESH_MARGIN_MS
  const wait = Math.max(delay, 0)

  refreshTimer = setTimeout(async () => {
    try {
      await refreshAuthSession()
      startSessionRefreshScheduler()
    } catch {
      clearRefreshTimer()
    }
  }, wait)
}

export function stopSessionRefreshScheduler(): void {
  clearRefreshTimer()
}
