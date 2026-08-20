import type { ExperienceMediaItem, ExperienceTimelineItem } from '@/templates/types'

export function timelineItemHasContent(item: {
  title?: string
  description?: string
  photo_url?: string
  photo_media_id?: string
}): boolean {
  return Boolean(
    item.title?.trim() ||
      item.description?.trim() ||
      item.photo_url?.trim() ||
      item.photo_media_id?.trim(),
  )
}

export function plainTimelineText(value?: string | null): string {
  return (value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/__([^_\n]+)__/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function fallbackTimelineTitle(description?: string): string {
  const plain = plainTimelineText(description)
  if (!plain) return 'Momento'
  return plain.length > 60 ? `${plain.slice(0, 57)}...` : plain
}

function normalizeMediaPath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url.split('?')[0] ?? url
  }
}

/** Resolve a foto de um momento pelo media id ou URL (inclui URLs assinadas legadas). */
export function resolveTimelinePhoto(
  photos: ExperienceMediaItem[],
  item: Pick<ExperienceTimelineItem, 'photoUrl' | 'photoMediaId'>,
): ExperienceMediaItem | undefined {
  if (item.photoMediaId) {
    const byId = photos.find((photo) => photo.id === item.photoMediaId)
    if (byId) return byId
  }

  if (!item.photoUrl) return undefined

  const exact = photos.find((photo) => photo.url === item.photoUrl || photo.thumbnail === item.photoUrl)
  if (exact) return exact

  const target = normalizeMediaPath(item.photoUrl)
  return photos.find((photo) => {
    const candidates = [photo.url, photo.thumbnail].filter(Boolean) as string[]
    return candidates.some((url) => normalizeMediaPath(url) === target)
  })
}
