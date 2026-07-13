import {
  DEFAULT_BOOK_PRESENTATION,
  isTimelinePresentation,
  normalizePresentationId,
} from './presentations'
import { composePhotobookPages } from './layouts/layoutEngine'
import { getBookTheme } from './themes'
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
  return normalizePresentationId(value) as BookPresentationId
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

function sortPhotosByTimelineDate(photos: PhotoInput[]): PhotoInput[] {
  return [...photos].sort((a, b) => {
    const dateA = a.memory_date?.trim() ?? ''
    const dateB = b.memory_date?.trim() ?? ''
    if (dateA && dateB && dateA !== dateB) {
      return dateA.localeCompare(dateB)
    }
    return (a.sort_order ?? 0) - (b.sort_order ?? 0)
  })
}

function buildTimelinePages(album: AlbumInput): MemoryBookContentPage[] {
  const sorted = sortPhotosByTimelineDate(album.photos)

  return sorted.map((photo, index) => {
    const bookPhoto = toBookPhoto(photo)

    return {
      kind: 'content',
      pageNo: index + 1,
      layout: 'hero-caption',
      photos: [bookPhoto],
      title: bookPhoto.title,
      message: bookPhoto.caption,
      memoryDate: bookPhoto.memoryDate,
      caption: bookPhoto.caption,
    }
  })
}

function buildPhotobookPages(album: AlbumInput, presentation: BookPresentationId): MemoryBookContentPage[] {
  const perPage = resolvePhotosPerPage(album.photos_per_page)
  const sorted = [...album.photos].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const bookPhotos = sorted.map(toBookPhoto)
  const theme = getBookTheme(presentation)

  return composePhotobookPages(bookPhotos, perPage, theme)
}

function buildContentPages(album: AlbumInput): MemoryBookContentPage[] {
  const presentation = resolvePresentation(album.presentation)

  if (isTimelinePresentation(presentation)) {
    return buildTimelinePages(album)
  }

  return buildPhotobookPages(album, presentation)
}

export function buildMemoryBookModel(album: AlbumInput): MemoryBookModel {
  const presentation = resolvePresentation(album.presentation)
  const contentPages = buildContentPages(album)

  return {
    presentation,
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

export function estimateBookPageCount(
  photoCount: number,
  photosPerPage?: number | null,
  presentation?: string | null,
): number {
  if (photoCount <= 0) return 2

  if (isTimelinePresentation(presentation)) {
    return photoCount + 2
  }

  const perPage = resolvePhotosPerPage(photosPerPage)
  const theme = getBookTheme(presentation ?? DEFAULT_BOOK_PRESENTATION)
  const dummyPhotos = Array.from({ length: photoCount }, (_, index) => ({
    id: String(index),
    url: '',
  }))

  return composePhotobookPages(dummyPhotos, perPage, theme).length + 2
}
