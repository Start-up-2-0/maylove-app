import { DEFAULT_BOOK_PRESENTATION } from './presentations'
import { resolveMediaUrl } from './mediaUrl'
import type { BookPresentationId, MemoryBookContentPage, MemoryBookModel, MemoryBookPhoto } from './types'

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
  photos_per_page?: number | null
  photos: PhotoInput[]
}

const MAX_PHOTOS_PER_PAGE = 4

const DEFAULT_CLOSING_MESSAGE =
  'Obrigado por folhear este livro de memórias. Que cada página guarde um pedaço de carinho para sempre.'

function resolveClosingMessage(value?: string | null): string {
  const trimmed = value?.trim()
  return trimmed || DEFAULT_CLOSING_MESSAGE
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

function resolvePhotosPerPage(value?: number | null): number {
  const parsed = Number(value ?? 1)
  if (!Number.isFinite(parsed)) return 1
  return Math.min(MAX_PHOTOS_PER_PAGE, Math.max(1, Math.round(parsed)))
}

/** Exibe ISO (YYYY-MM-DD) em português; mantém texto livre legado. */
function formatMemoryDate(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T12:00:00`)
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(parsed)
    }
  }
  return trimmed
}

function toBookPhoto(photo: PhotoInput): MemoryBookPhoto {
  const url = resolveMediaUrl(photo.url) ?? ''
  return {
    id: photo.id,
    url,
    title: photo.title?.trim() || undefined,
    caption: photo.caption?.trim() || undefined,
    memoryDate: formatMemoryDate(photo.memory_date),
  }
}

function chunkPhotos<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export function buildMemoryBookModel(album: AlbumInput): MemoryBookModel {
  const perPage = resolvePhotosPerPage(album.photos_per_page)
  const sorted = [...album.photos].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )
  const groups = chunkPhotos(sorted, perPage)

  const contentPages: MemoryBookContentPage[] = groups.map((group, index) => {
    const bookPhotos = group.map(toBookPhoto)
    const lead = bookPhotos[0]

    return {
      kind: 'content',
      pageNo: index + 1,
      photos: bookPhotos,
      title: lead?.title,
      message: perPage === 1 ? lead?.caption : undefined,
      memoryDate: lead?.memoryDate,
      caption: lead?.caption,
    }
  })

  return {
    presentation: resolvePresentation(album.presentation),
    title: album.title ?? 'Livro de memórias',
    subtitle: album.subtitle ?? undefined,
    closingMessage: resolveClosingMessage(album.closing_message),
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
  photos_per_page?: number | null
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
        url: resolveMediaUrl(m.url, m.url_thumbnail) ?? '',
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
    photos_per_page: album.photos_per_page,
    photos,
  })
}

export function estimateBookPageCount(photoCount: number, photosPerPage?: number | null): number {
  const perPage = resolvePhotosPerPage(photosPerPage)
  const contentPages = photoCount > 0 ? Math.ceil(photoCount / perPage) : 0
  return contentPages + 2
}
