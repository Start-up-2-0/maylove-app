import {
  DEFAULT_BOOK_PRESENTATION,
  isInstantPhotoPresentation,
  isMuralPresentation,
  isTimelinePresentation,
  normalizePresentationId,
} from './presentations'
import { composePhotobookPages } from './layouts/layoutEngine'
import { getBookTheme } from './themes'
import { resolveMediaUrl } from './mediaUrl'
import {
  resolveBookConfig,
  clampPolaroidScale,
  defaultPolaroidPlacement,
  isPolaroidPageLayout,
  type BookConfig,
  type BookPage,
  type BookPageLayout,
} from './bookConfig'
import type { BookPresentationId, MemoryBookContentPage, MemoryBookModel, MemoryBookPhoto } from './types'
import type { PageLayoutId } from './layouts/types'

interface PhotoInput {
  id: string
  url: string
  sort_order?: number
  title?: string | null
  caption?: string | null
  memory_date?: string | null
  place_name?: string | null
}

interface AlbumInput {
  title?: string | null
  subtitle?: string | null
  closing_message?: string | null
  signature?: string | null
  color_primary?: string | null
  presentation?: string | null
  photos_per_page?: number | null
  book_config?: BookConfig | Record<string, unknown> | null
  book_pages?: BookPage[] | Array<Record<string, unknown>> | null
  photos: PhotoInput[]
}

const MAX_PHOTOS_PER_PAGE = 4

function resolveClosingMessage(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function resolvePresentation(value?: string | null): BookPresentationId {
  return normalizePresentationId(value) as BookPresentationId
}

function resolvePhotosPerPage(value?: number | null): number {
  const parsed = Number(value ?? 1)
  if (!Number.isFinite(parsed)) return 1
  return Math.min(MAX_PHOTOS_PER_PAGE, Math.max(1, Math.round(parsed)))
}

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
    placeName: photo.place_name?.trim() || undefined,
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

function mapLayout(layout: BookPageLayout, _hasText: boolean): PageLayoutId {
  if (layout === 'bleed') return 'full-bleed'
  if (layout === 'spread') return 'double-spread'
  if (layout === 'text') return 'text-focus'
  if (layout === 'two') return 'asymmetric-duo'
  if (layout === 'three') return 'editorial-trio'
  if (layout === 'four') return 'collage-grid'
  if (isPolaroidPageLayout(layout)) return 'polaroid-memory'
  if (layout === 'text_photo' || layout === 'one') return 'hero-caption'
  return 'hero-caption'
}

function buildPagesFromBookPages(
  album: AlbumInput,
  bookPages: BookPage[],
): MemoryBookContentPage[] {
  const byId = new Map(album.photos.map((photo) => [photo.id, photo]))

  const sorted = [...bookPages].sort((a, b) => a.sort_order - b.sort_order)

  return sorted.map((page, index) => {
    const polaroid = isPolaroidPageLayout(page.layout)
    const filledSlots = page.slots ?? []
    const photos: MemoryBookPhoto[] = []

    filledSlots.forEach((slot, slotIndex) => {
      if (!slot.media_id) return
      const raw = byId.get(slot.media_id)
      if (!raw) return
      const photo = toBookPhoto(raw)
      const place = polaroid
        ? {
            x: typeof slot.x === 'number' ? slot.x : defaultPolaroidPlacement(slotIndex, filledSlots.length).x,
            y: typeof slot.y === 'number' ? slot.y : defaultPolaroidPlacement(slotIndex, filledSlots.length).y,
            rotation:
              typeof slot.rotation === 'number'
                ? slot.rotation
                : defaultPolaroidPlacement(slotIndex, filledSlots.length).rotation,
            scale: clampPolaroidScale(
              slot.scale ?? defaultPolaroidPlacement(slotIndex, filledSlots.length).scale,
            ),
          }
        : {}

      photos.push({
        ...photo,
        title: slot.show_title ? photo.title : undefined,
        caption: slot.show_caption ? photo.caption : undefined,
        memoryDate: slot.show_date ? photo.memoryDate : undefined,
        ...place,
      })
    })

    const lead = photos[0]
    const pageTitle = page.title?.trim() || (polaroid ? undefined : lead?.title)
    const message =
      page.layout === 'text' || page.layout === 'text_photo'
        ? page.place_name?.trim() || lead?.caption
        : !polaroid && photos.length === 1
          ? lead?.caption
          : page.place_name?.trim() || undefined
    const memoryDate = !polaroid && photos.length === 1 ? lead?.memoryDate : undefined

    return {
      kind: 'content' as const,
      pageNo: index + 1,
      layout: mapLayout(page.layout, Boolean(pageTitle || message || memoryDate)),
      photos,
      title: pageTitle,
      message,
      memoryDate,
      caption: message,
      chapterTitle: pageTitle,
    }
  })
}

function buildPhotobookPages(album: AlbumInput, presentation: BookPresentationId): MemoryBookContentPage[] {
  const rawPages = album.book_pages
  if (Array.isArray(rawPages) && rawPages.length > 0) {
    return buildPagesFromBookPages(album, rawPages as BookPage[])
  }

  const perPage = resolvePhotosPerPage(album.photos_per_page)
  const sorted = [...album.photos].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const bookPhotos = sorted.map(toBookPhoto)
  const theme = getBookTheme(presentation)

  return composePhotobookPages(bookPhotos, perPage, theme)
}

function buildInstantPhotoPages(album: AlbumInput): MemoryBookContentPage[] {
  const sorted = [...album.photos].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const photos = sorted.map(toBookPhoto)
  if (photos.length === 0) return []

  const perPage = 6
  const pages: MemoryBookContentPage[] = []
  for (let i = 0; i < photos.length; i += perPage) {
    const chunk = photos.slice(i, i + perPage)
    pages.push({
      kind: 'content',
      pageNo: pages.length + 1,
      layout: chunk.length >= 4 ? 'editorial-trio' : 'asymmetric-duo',
      photos: chunk,
    })
  }
  return pages
}

function buildContentPages(album: AlbumInput): MemoryBookContentPage[] {
  const presentation = resolvePresentation(album.presentation)

  if (isInstantPhotoPresentation(presentation)) {
    return buildInstantPhotoPages(album)
  }

  if (isTimelinePresentation(presentation) || isMuralPresentation(presentation)) {
    return buildTimelinePages(album)
  }

  return buildPhotobookPages(album, presentation)
}

export function buildMemoryBookModel(album: AlbumInput): MemoryBookModel {
  const presentation = resolvePresentation(album.presentation)
  const contentPages = buildContentPages(album)
  const bookConfig = resolveBookConfig(
    album.book_config as BookConfig | null | undefined,
    presentation,
  )
  const coverId = bookConfig.cover.media_id
  const coverPhoto = coverId ? album.photos.find((p) => p.id === coverId) : undefined

  return {
    presentation,
    title: album.title ?? 'Livro de memórias',
    subtitle: album.subtitle ?? undefined,
    closingMessage: resolveClosingMessage(album.closing_message),
    signature: album.signature ?? undefined,
    colorPrimary: bookConfig.colors.accent || album.color_primary || '#c45d7a',
    contentPages,
    bookConfig,
    coverPhotoUrl: coverPhoto ? resolveMediaUrl(coverPhoto.url) ?? undefined : undefined,
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
  book_config?: BookConfig | Record<string, unknown> | null
  book_pages?: BookPage[] | Array<Record<string, unknown>> | null
  media?: Array<{
    id: string
    media_type: string
    url?: string | null
    url_thumbnail?: string | null
    sort_order: number
    title?: string | null
    caption?: string | null
    memory_date?: string | null
    place_name?: string | null
  }>
  photos?: Array<{
    id: string
    url?: string | null
    title?: string | null
    caption?: string | null
    memory_date?: string | null
    place_name?: string | null
    sort_order: number
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
        place_name: m.place_name,
      })) ??
    album.photos?.map((p) => ({
      id: p.id,
      url: resolveMediaUrl(p.url) ?? '',
      sort_order: p.sort_order,
      title: p.title,
      caption: p.caption,
      memory_date: p.memory_date,
      place_name: p.place_name,
    })) ??
    []

  return buildMemoryBookModel({
    title: album.title,
    subtitle: album.subtitle,
    closing_message: album.closing_message,
    signature: album.signature,
    color_primary: album.color_primary,
    presentation: album.presentation,
    photos_per_page: album.photos_per_page,
    book_config: album.book_config,
    book_pages: album.book_pages,
    photos,
  })
}

export function estimateBookPageCount(
  photoCount: number,
  photosPerPage?: number | null,
  presentation?: string | null,
  bookPages?: BookPage[] | null,
): number {
  if (bookPages && bookPages.length > 0) {
    return bookPages.length + 2
  }

  if (photoCount <= 0) return 2

  if (isInstantPhotoPresentation(presentation)) {
    if (photoCount <= 0) return 2
    return Math.ceil(photoCount / 6) + 2
  }

  if (isTimelinePresentation(presentation) || isMuralPresentation(presentation)) {
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
