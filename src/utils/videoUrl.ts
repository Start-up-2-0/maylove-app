export type SupportedVideoProvider = 'youtube' | 'vimeo' | 'direct'

export interface SupportedVideoEmbed {
  provider: SupportedVideoProvider
  type: 'iframe' | 'video'
  src: string
}

export function resolveSupportedVideoEmbed(value?: string | null): SupportedVideoEmbed | null {
  if (!value?.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:') return null
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      const parts = url.pathname.split('/').filter(Boolean)
      const id = host === 'youtu.be'
        ? parts[0]
        : url.searchParams.get('v') || (['embed', 'shorts'].includes(parts[0] ?? '') ? parts[1] : null)
      if (!id || !/^[\w-]{6,}$/.test(id)) return null
      return { provider: 'youtube', type: 'iframe', src: `https://www.youtube.com/embed/${id}` }
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part))
      if (!id) return null
      return { provider: 'vimeo', type: 'iframe', src: `https://player.vimeo.com/video/${id}` }
    }
    if (/\.(mp4|webm)(?:$|\?)/i.test(url.href)) {
      return { provider: 'direct', type: 'video', src: url.href }
    }
    return null
  } catch {
    return null
  }
}

export function resolveSupportedVideoProvider(value?: string | null): SupportedVideoProvider | null {
  return resolveSupportedVideoEmbed(value)?.provider ?? null
}

export function isSupportedVideoUrl(value?: string | null): boolean {
  return resolveSupportedVideoProvider(value) !== null
}
