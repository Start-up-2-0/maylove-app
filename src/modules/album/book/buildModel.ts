import {
  isInstantPhotoPresentation,
  isMemorialPresentation,
  isMuralPresentation,
  isTimelinePresentation,
  normalizePresentationId,
} from './presentations'
import { composePhotobookPages } from './layouts/layoutEngine'
import { getBookTheme } from './themes'
import { resolveMediaUrl } from './mediaUrl'
import { isAlbumVisualMedia } from '../mediaTypes'
import {
  resolveBookConfig,
  type BookConfig,
} from './bookConfig'
import type { BookPresentationId, MemoryBookContentPage, MemoryBookModel, MemoryBookPhoto } from './types'

interface PhotoInput {
  id: string
  url: string
  sort_order?: number
  title?: string | null
  caption?: string | null
  memory_date?: string | null
  place_name?: string | null
}

interface AlbumMediaInput {
  id: string
  url: string | null
  url_thumbnail?: string | null
  media_type: string
  sort_order?: number
  title?: string | null
  caption?: string | null
  memory_date?: string | null
  place_name?: string | null
}

interface AlbumMemoryInput {
  id: string
  sort_order: number
  title?: string | null
  subtitle?: string | null
  description?: string | null
  date?: string | null
  time?: string | null
  location?: { label?: string | null } | null
  sentiment?: string | null
  tags?: string[]
  people?: string[]
  media: PhotoInput[]
  media_ids?: string[] | null
}

interface AlbumChapterInput {
  id: string
  title: string
  sort_order: number
  memories: AlbumMemoryInput[]
}

interface AlbumBookInput {
  title?: string | null
  subtitle?: string | null
  category?: string | null
  honoree_names?: string | null
  dedication?: string | null
  life_dates?: { birth_date?: string | null; death_date?: string | null } | null
  color_primary?: string | null
  presentation?: string | null
  book_config?: BookConfig | Record<string, unknown> | null
  chapters: AlbumChapterInput[]
  media?: AlbumMediaInput[]
  experiences?: Array<{ id: string; type: string; config?: Record<string, unknown> | null }>
}

function resolvePresentation(value?: string | null): BookPresentationId {
  return normalizePresentationId(value) as BookPresentationId
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

function flattenMemories(album: AlbumBookInput): Array<{
  chapter: AlbumChapterInput
  memory: AlbumMemoryInput
}> {
  return album.chapters
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((chapter) =>
      chapter.memories
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((memory) => ({ chapter, memory })),
    )
}

function memoryToBookPhoto(media: PhotoInput): MemoryBookPhoto {
  return toBookPhoto(media)
}

// Resolve as fotos de uma memória: prioriza `media` (memória já populada) e,
// em seguida, resolve `media_ids` contra a fototeca solta do álbum (content_json.media_ids).
function resolveMemoryPhotos(album: AlbumBookInput, memory: AlbumMemoryInput): PhotoInput[] {
  if (memory.media && memory.media.length > 0) {
    return memory.media.filter((m) => m.url)
  }
  const ids = memory.media_ids ?? []
  if (ids.length === 0 || !album.media) return []
  const byId = new Map(album.media.map((m) => [m.id, m]))
  return ids
    .map((id) => byId.get(id))
    .filter((m): m is AlbumMediaInput => Boolean(m && m.url))
    .map((m) => ({
      id: m.id,
      url: m.url as string,
      title: m.title,
      caption: m.caption,
      memory_date: m.memory_date,
      place_name: m.place_name,
    }))
}

function buildPhotobookPages(album: AlbumBookInput, presentation: BookPresentationId): MemoryBookContentPage[] {
  const ordered = flattenMemories(album)
  const bookPhotos = ordered.map(({ memory }) =>
    resolveMemoryPhotos(album, memory).map(memoryToBookPhoto),
  )
  const theme = getBookTheme(presentation)

  const perPage = 3
  const flatPhotos = bookPhotos.flat()
  if (flatPhotos.length === 0) return []

  const pages = composePhotobookPages(flatPhotos, perPage, theme)
  // Etiqueta cada página com o título do capítulo da 1ª memória que ela contém.
  let cursor = 0
  return pages.map((page) => {
    const slice = ordered.slice(cursor, cursor + perPage)
    cursor += perPage
    const chapterTitle = slice[0]?.chapter.title
    return { ...page, chapterTitle }
  })
}

function buildMemoryMosaicPages(album: AlbumBookInput): MemoryBookContentPage[] {
  return flattenMemories(album).map(({ chapter, memory }, index) => {
    const photos = resolveMemoryPhotos(album, memory).map(memoryToBookPhoto)
    const lead = photos[0]
    return {
      kind: 'content' as const,
      pageNo: index + 1,
      layout: photos.length >= 3 ? 'editorial-trio' : photos.length === 2 ? 'asymmetric-duo' : 'hero-caption',
      photos,
      title: memory.title?.trim() || chapter.title,
      message: memory.description?.trim() || memory.subtitle?.trim() || lead?.caption,
      memoryDate: formatMemoryDate(memory.date),
      caption: memory.description?.trim() || lead?.caption,
      chapterTitle: chapter.title,
    }
  })
}

function buildGalleryPagesFromMedia(album: AlbumBookInput): MemoryBookContentPage[] {
  const photos = (album.media ?? [])
    .filter((m) => isAlbumVisualMedia(m.media_type) && m.url)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((m) =>
      memoryToBookPhoto({
        id: m.id,
        url: m.url as string,
        title: m.title,
        caption: m.caption,
        memory_date: m.memory_date,
        place_name: m.place_name,
      }),
    )

  return photos.map((photo, index) => ({
    kind: 'content' as const,
    pageNo: index + 1,
    layout: 'hero-caption' as const,
    photos: [photo],
    title: photo.title,
    caption: photo.caption,
    memoryDate: photo.memoryDate,
  }))
}

function buildContentPages(album: AlbumBookInput): MemoryBookContentPage[] {
  const presentation = resolvePresentation(album.presentation)

  if (isInstantPhotoPresentation(presentation)) {
    const pages = buildMemoryMosaicPages(album)
    return pages.length ? pages : buildGalleryPagesFromMedia(album)
  }

  if (isMemorialPresentation(presentation) || isTimelinePresentation(presentation) || isMuralPresentation(presentation)) {
    const pages = buildMemoryMosaicPages(album)
    return pages.length ? pages : buildGalleryPagesFromMedia(album)
  }

  const photobookPages = buildPhotobookPages(album, presentation)
  return photobookPages.length ? photobookPages : buildGalleryPagesFromMedia(album)
}

function chapterInputFromDetail(chapters: import('@/api/types').AlbumChapter[]): AlbumChapterInput[] {
  return chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    sort_order: chapter.sort_order,
    memories: chapter.memories.map((memory) => ({
      id: memory.id,
      sort_order: memory.sort_order,
      title: memory.title ?? null,
      subtitle: memory.subtitle ?? null,
      description: memory.description ?? null,
      date: memory.date ?? null,
      time: memory.time ?? null,
      location: memory.location ? { label: memory.location.label ?? null } : null,
      sentiment: memory.sentiment ?? null,
      tags: memory.tags,
      people: memory.people,
      media_ids: memory.media_ids ?? null,
      media: (memory.media ?? [])
        .filter((m) => isAlbumVisualMedia(m.media_type))
        .map((m) => ({
          id: m.id,
          url: m.url,
          sort_order: 0,
          title: null,
          caption: null,
          memory_date: memory.date ?? null,
          place_name: memory.location?.label ?? null,
        })),
    })),
  }))
}

export function buildMemoryBookModel(album: AlbumBookInput): MemoryBookModel {
  const presentation = resolvePresentation(album.presentation)
  const contentPages = buildContentPages(album)
  const bookConfig = resolveBookConfig(
    album.book_config as BookConfig | null | undefined,
    presentation,
  )
  const defaultAccent = isMemorialPresentation(presentation) ? '#c9a86a' : '#c45d7a'
  const coverId = bookConfig.cover.media_id
  const coverMedia = coverId
    ? (album.media ?? []).find((m) => m.id === coverId)
    : undefined

  return {
    presentation,
    title: album.title ?? 'Livro de memórias',
    subtitle: album.subtitle ?? undefined,
    closingMessage: album.dedication?.trim() || undefined,
    signature: album.honoree_names?.trim() || undefined,
    lifeDates: formatLifeDates(album.life_dates),
    colorPrimary: bookConfig.colors.accent || album.color_primary || defaultAccent,
    contentPages,
    bookConfig,
    coverPhotoUrl: coverMedia ? resolveMediaUrl(coverMedia.url) ?? undefined : undefined,
  }
}

export function buildMemoryBookModelFromDetail(
  album: import('@/api/types').AlbumDetail | import('@/api/types').PublicAlbum,
): MemoryBookModel {
  const albumMedia =
    'media' in album && Array.isArray(album.media)
      ? album.media.map((m) => ({
          id: m.id,
          url: m.url ?? null,
          url_thumbnail: 'url_thumbnail' in m ? (m.url_thumbnail ?? null) : null,
          media_type: m.media_type,
          sort_order: m.sort_order,
          title: 'title' in m ? m.title : null,
          caption: 'caption' in m ? m.caption : null,
          memory_date: 'memory_date' in m ? m.memory_date : null,
          place_name: 'place_name' in m ? (m.place_name ?? null) : null,
        }))
      : 'photos' in album && Array.isArray(album.photos)
        ? album.photos.map((p) => ({
            id: p.id,
            url: p.url ?? null,
            media_type: 'photo',
            sort_order: p.sort_order,
            title: p.title,
            caption: p.caption,
            memory_date: p.memory_date,
            place_name: p.place_name ?? null,
          }))
        : undefined

  const lifeDates = (album.content_json as { life_dates?: { birth_date?: string | null; death_date?: string | null } } | null)?.life_dates
  return buildMemoryBookModel({
    title: album.title,
    subtitle: album.subtitle,
    category: 'category' in album ? (album.category ?? undefined) ?? null : null,
    honoree_names: 'honoree_names' in album ? (album.honoree_names ?? undefined) ?? null : null,
    dedication: 'dedication' in album ? (album.dedication ?? undefined) ?? null : null,
    life_dates: lifeDates ?? null,
    color_primary: album.color_primary,
    presentation: resolvePresentation(
      album.content_json && (album.content_json as { presentation?: string }).presentation
        ? ((album.content_json as { presentation?: string }).presentation as string)
        : undefined,
    ),
    book_config: (album as { book_config?: BookConfig | null }).book_config ?? null,
    media: albumMedia,
    chapters: chapterInputFromDetail(album.chapters ?? []),
    experiences: (album.experiences ?? []).map((e) => ({
      id: e.id,
      type: e.type,
      config: e.config ?? null,
    })),
  })
}

function formatLifeDates(dates?: { birth_date?: string | null; death_date?: string | null } | null): string | undefined {
  const year = (value?: string | null) => value?.match(/^\d{4}/)?.[0]
  const birth = year(dates?.birth_date)
  const death = year(dates?.death_date)
  if (birth && death) return `${birth} — ${death}`
  if (birth) return `Nasc. ${birth}`
  if (death) return `† ${death}`
  return undefined
}

export function estimateBookPageCount(
  photoCount: number,
  presentation?: string | null,
): number {
  if (photoCount <= 0) return 2

  if (isInstantPhotoPresentation(presentation) || isTimelinePresentation(presentation) || isMuralPresentation(presentation)) {
    return photoCount + 2
  }

  const perPage = 3
  return Math.ceil(photoCount / perPage) + 2
}
