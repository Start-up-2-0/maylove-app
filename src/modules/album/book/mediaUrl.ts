export function isRenderableMediaUrl(url?: string | null): boolean {
  if (!url?.trim()) return false
  return /^https?:\/\//i.test(url.trim())
}

export function resolveMediaUrl(url?: string | null, fallback?: string | null): string | null {
  if (isRenderableMediaUrl(url)) return url!.trim()
  if (isRenderableMediaUrl(fallback)) return fallback!.trim()
  return null
}
