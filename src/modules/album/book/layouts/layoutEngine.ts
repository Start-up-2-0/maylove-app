import type { PageLayoutId, PageGroup } from './types'
import type { MemoryBookContentPage, MemoryBookPhoto } from '../types'
import type { BookTheme } from '../themes'

function hasText(group: PageGroup): boolean {
  return Boolean(group.title?.trim() || group.message?.trim() || group.memoryDate)
}

function resolveLayout(group: PageGroup, theme: BookTheme): PageLayoutId {
  const count = group.photos.length
  const text = hasText(group)

  if (theme.features.polaroidFrames || theme.strategy === 'polaroid') {
    return 'polaroid-memory'
  }

  if (count === 0 && text) return 'text-focus'
  if (count === 1 && !text) return 'full-bleed'
  if (count === 1 && text) return 'hero-caption'
  if (count === 2) return 'asymmetric-duo'
  if (count === 3) return 'editorial-trio'
  if (count >= 4) return 'collage-grid'

  return 'hero-caption'
}

/**
 * Agrupa fotos em páginas de tamanho fixo (`photos_per_page`).
 * A última página pode ter menos fotos se sobrar resto.
 */
function packGroups(photos: MemoryBookPhoto[], perPage: number): PageGroup[] {
  const groups: PageGroup[] = []
  let index = 0

  while (index < photos.length) {
    const size = Math.max(1, Math.min(perPage, photos.length - index))
    const chunk = photos.slice(index, index + size)
    const lead = chunk[0]

    groups.push({
      photos: chunk,
      title: lead?.title,
      message: size === 1 ? lead?.caption : undefined,
      memoryDate: lead?.memoryDate,
    })

    index += size
  }

  return groups
}

export function composePhotobookPages(
  photos: MemoryBookPhoto[],
  perPage: number,
  theme: BookTheme,
): MemoryBookContentPage[] {
  const groups = packGroups(photos, perPage)
  const pages: MemoryBookContentPage[] = []

  groups.forEach((group, index) => {
    if (theme.features.chapterOpeners && index > 0 && index % 5 === 0) {
      pages.push({
        kind: 'content',
        pageNo: 0,
        layout: 'chapter-opener',
        photos: [],
        chapterTitle: group.title ?? `Capítulo ${Math.floor(index / 5) + 1}`,
        memoryDate: group.memoryDate,
      })
    }

    pages.push({
      kind: 'content',
      pageNo: 0,
      layout: resolveLayout(group, theme),
      photos: group.photos,
      title: group.title,
      message: group.message,
      memoryDate: group.memoryDate,
      caption: group.message,
      chapterTitle: group.title,
    })
  })

  return pages.map((page, index) => ({ ...page, pageNo: index + 1 }))
}
