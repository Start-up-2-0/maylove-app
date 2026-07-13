import { DEFAULT_BOOK_PRESENTATION } from './presentations'
import type { BookPresentationId, MemoryBookContentPage, MemoryBookModel } from './types'

interface PhotoInput {
  id: string
  url: string
  sort_order?: number
  title?: string | null
  caption?: string | null
  memory_date?: string | null
}

interface AlbumInput {
  title?: string | null
  subtitle?: string | null
  closing_message?: string | null
  signature?: string | null
  color_primary?: string | null
  presentation?: string | null
  photos: PhotoInput[]
}

function resolvePresentation(value?: string | null): BookPresentationId {
  const allowed: BookPresentationId[] = [
    'family-album',
    'polaroid',
    'memory-notebook',
    'romantic-book',
    'timeline',
    'photo-magazine',
  ]
  if (value && allowed.includes(value as BookPresentationId)) {
    return value as BookPresentationId
  }
  return DEFAULT_BOOK_PRESENTATION
}

export function buildMemoryBookModel(album: AlbumInput): MemoryBookModel {
  const sorted = [...album.photos].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )

  const contentPages: MemoryBookContentPage[] = sorted.map((photo, index) => ({
    kind: 'content',
    pageNo: index + 1,
    photos: [{ id: photo.id, url: photo.url }],
    title: photo.title ?? undefined,
    message: photo.caption ?? undefined,
    memoryDate: photo.memory_date ?? undefined,
    caption: photo.caption ?? undefined,
  }))

  return {
    presentation: resolvePresentation(album.presentation),
    title: album.title ?? 'Livro de memórias',
    subtitle: album.subtitle ?? undefined,
    closingMessage: album.closing_message ?? undefined,
    signature: album.signature ?? undefined,
    colorPrimary: album.color_primary ?? '#c45d7a',
    contentPages,
  }
}

export function buildMemoryBookModelFromDetail(album: {
  title?: string | null
  subtitle?: string | null
  closing_message?: string | null
  signature?: string | null
  color_primary?: string | null
  presentation?: string | null
  media?: Array<{
    id: string
    media_type: string
    url?: string | null
    url_thumbnail?: string | null
    sort_order: number
    title?: string | null
    caption?: string | null
    memory_date?: string | null
  }>
}): MemoryBookModel {
  const photos =
    album.media
      ?.filter((m) => m.media_type === 'photo')
      .map((m) => ({
        id: m.id,
        url: m.url ?? m.url_thumbnail ?? '',
        sort_order: m.sort_order,
        title: m.title,
        caption: m.caption,
        memory_date: m.memory_date,
      })) ?? []

  return buildMemoryBookModel({
    title: album.title,
    subtitle: album.subtitle,
    closing_message: album.closing_message,
    signature: album.signature,
    color_primary: album.color_primary,
    presentation: album.presentation,
    photos,
  })
}
