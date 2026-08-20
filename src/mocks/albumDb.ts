import type {
  AlbumChapter,
  AlbumDetail,
  AlbumMedia,
  AlbumMemory,
  AlbumSummary,
  AlbumValidation,
  PublicAlbum,
} from '@/api/types'
import { defaultBookConfigFor } from '@/modules/album/book/bookConfig'

const STORAGE_KEY = 'maylove_mock_albums'
const now = () => new Date().toISOString()
let sequence = 0

const demoPhoto =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#ead8cc"/><stop offset="1" stop-color="#a77365"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="600" cy="330" r="150" fill="#fff" fill-opacity=".35"/><text x="600" y="620" text-anchor="middle" font-family="Georgia" font-size="56" fill="#fff">Uma memória especial</text></svg>')

function id(prefix: string): string {
  sequence += 1
  return `${prefix}-mock-${Date.now().toString(36)}-${sequence}`
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function photo(photoId: string, order: number, title: string): AlbumMedia {
  return {
    id: photoId,
    storage_file_id: `storage-${photoId}`,
    media_type: 'photo',
    original_filename: `memoria-${order + 1}.jpg`,
    mime_type: 'image/jpeg',
    size_bytes: 640_000,
    sort_order: order,
    title,
    caption: 'Um momento guardado com carinho.',
    memory_date: order === 0 ? '1998-05-12' : '2012-09-20',
    place_name: 'São Paulo, SP',
    url_thumbnail: demoPhoto,
    url: demoPhoto,
    created_at: now(),
  }
}

function initialAlbums(): AlbumDetail[] {
  const created = now()
  const memorialPhotos = [photo('album-photo-jose-1', 0, 'Um sorriso inesquecível'), photo('album-photo-jose-2', 1, 'Em família')]
  const chapters: AlbumChapter[] = [
    {
      id: 'album-chapter-jose-bio',
      title: 'Biografia',
      sort_order: 0,
      memories: [
        {
          id: 'album-memory-jose-1',
          sort_order: 0,
          title: 'Uma vida de afeto',
          description: 'José deixou como legado a generosidade, a alegria e o amor pela família.',
          date: '1998-05-12',
          tags: [],
          people: [],
          media_ids: [memorialPhotos[0].id],
          media: [],
          content_json: { media_ids: [memorialPhotos[0].id] },
        },
      ],
    },
    { id: 'album-chapter-jose-timeline', title: 'Linha do Tempo', sort_order: 1, memories: [] },
    { id: 'album-chapter-jose-memories', title: 'Recordações', sort_order: 2, memories: [] },
  ]

  return [
    {
      id: 'album-demo-gallery',
      slug: 'nossas-memorias-demo',
      status: 'draft',
      category: 'custom',
      title: 'Nossas melhores memórias',
      subtitle: 'Pequenos momentos que merecem ficar para sempre.',
      color_primary: '#c45d7a',
      presentation: 'classic-photobook',
      is_public: true,
      views_count: 0,
      published_at: null,
      created_at: created,
      updated_at: created,
      honoree_names: 'Ana e João',
      dedication: 'Com carinho, para sempre.',
      closing_message: null,
      music_media_id: null,
      media: [photo('album-photo-gallery-1', 0, 'Nosso começo')],
      book_config: defaultBookConfigFor('classic-photobook') as unknown as Record<string, unknown>,
      chapters: [],
      experiences: [],
      content_json: { presentation: 'classic-photobook', effects: [] },
    },
    {
      id: 'album-demo-memorial',
      slug: 'em-memoria-jose-demo',
      status: 'published',
      category: 'memorial',
      title: 'Em memória de José',
      subtitle: '1948 — 2024 · Seu amor permanece entre nós.',
      color_primary: '#c9a86a',
      presentation: 'memorial-luz',
      is_public: true,
      views_count: 84,
      published_at: created,
      created_at: created,
      updated_at: created,
      honoree_names: 'José da Silva',
      dedication: 'José deixou como legado a generosidade, a alegria e o amor pela família.',
      closing_message: null,
      music_media_id: null,
      media: memorialPhotos,
      book_config: { ...defaultBookConfigFor('memorial-luz'), cover: { mode: 'photo', media_id: memorialPhotos[0].id, eyebrow: 'EM MEMÓRIA' } },
      chapters,
      experiences: [],
      content_json: { presentation: 'memorial-luz', effects: ['stars'] },
    },
  ]
}

function load(): Map<string, AlbumDetail> {
  let values: AlbumDetail[] | null = null
  if (typeof sessionStorage !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      values = raw ? (JSON.parse(raw) as AlbumDetail[]) : null
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }
  return new Map((values ?? initialAlbums()).map((album) => [album.id, album]))
}

const albums = load()

function persist(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(albums.values())))
  }
}

function touch(album: AlbumDetail): void {
  album.updated_at = now()
  album.chapter_count = album.chapters.length
  album.memory_count = album.chapters.reduce((total, chapter) => total + chapter.memories.length, 0)
}

function hydrateMemory(album: AlbumDetail, memory: AlbumMemory): AlbumMemory {
  const mediaIds = memory.media_ids ?? []
  return {
    ...clone(memory),
    media: album.media
      .filter((item) => mediaIds.includes(item.id) && item.media_type === 'photo' && item.url)
      .map((item) => ({ id: item.id, media_type: item.media_type, url: item.url! })),
  }
}

function hydrate(album: AlbumDetail): AlbumDetail {
  touch(album)
  const result = clone(album)
  result.chapters = result.chapters.map((chapter) => ({
    ...chapter,
    memories: chapter.memories.map((memory) => hydrateMemory(result, memory)),
  }))
  return result
}

function summary(album: AlbumDetail): AlbumSummary {
  touch(album)
  const photos = album.media.filter((item) => item.media_type === 'photo')
  const coverId = (album.book_config as { cover?: { media_id?: string | null } } | null)?.cover?.media_id
  const cover = photos.find((item) => item.id === coverId) ?? photos[0]
  return {
    id: album.id,
    slug: album.slug,
    status: album.status,
    category: album.category,
    title: album.title,
    subtitle: album.subtitle,
    color_primary: album.color_primary,
    presentation: album.presentation,
    is_public: album.is_public,
    chapter_count: album.chapter_count,
    memory_count: album.memory_count,
    views_count: album.views_count,
    cover_url: cover?.url ?? null,
    preview_thumbs: photos.slice(0, 3).map((item) => item.url_thumbnail ?? item.url).filter((url): url is string => Boolean(url)),
    published_at: album.published_at,
    created_at: album.created_at,
    updated_at: album.updated_at,
  }
}

export const albumDb = {
  list(status?: string): AlbumSummary[] {
    return Array.from(albums.values())
      .filter((album) => !status || album.status === status)
      .map(summary)
  },

  get(albumId: string): AlbumDetail | undefined {
    const album = albums.get(albumId)
    return album ? hydrate(album) : undefined
  },

  getMutable(albumId: string): AlbumDetail | undefined {
    return albums.get(albumId)
  },

  create(payload: Record<string, unknown>): AlbumDetail {
    const created = now()
    const albumId = id('album')
    const album: AlbumDetail = {
      id: albumId,
      slug: `album-${crypto.randomUUID()}`,
      status: 'draft',
      category: (payload.category as AlbumDetail['category']) ?? 'custom',
      title: (payload.title as string) ?? null,
      subtitle: null,
      color_primary: '#c45d7a',
      presentation: 'classic-photobook',
      is_public: true,
      views_count: 0,
      published_at: null,
      created_at: created,
      updated_at: created,
      honoree_names: (payload.honoree_names as string) ?? null,
      dedication: null,
      closing_message: null,
      music_media_id: null,
      media: [],
      book_config: defaultBookConfigFor('classic-photobook') as unknown as Record<string, unknown>,
      chapters: [],
      experiences: [],
      content_json: { presentation: 'classic-photobook', effects: [] },
    }
    albums.set(albumId, album)
    persist()
    return hydrate(album)
  },

  update(albumId: string, payload: Record<string, unknown>): AlbumDetail | undefined {
    const album = albums.get(albumId)
    if (!album || album.status === 'published') return undefined
    const assignable = ['title', 'subtitle', 'honoree_names', 'dedication', 'category', 'presentation', 'color_primary', 'is_public', 'book_config'] as const
    for (const key of assignable) {
      if (key in payload) Object.assign(album, { [key]: payload[key] ?? null })
    }
    if (payload.content_json && typeof payload.content_json === 'object') {
      album.content_json = { ...(album.content_json ?? {}), ...(payload.content_json as Record<string, unknown>) }
    }
    touch(album)
    persist()
    return hydrate(album)
  },

  remove(albumId: string): boolean {
    const removed = albums.delete(albumId)
    if (removed) persist()
    return removed
  },

  validate(albumId: string): AlbumValidation | undefined {
    const album = albums.get(albumId)
    if (!album) return undefined
    const errors: AlbumValidation['errors'] = []
    const warnings: AlbumValidation['warnings'] = []
    if (!album.title?.trim() || album.title.trim().length < 2) errors.push({ field: 'title', code: 'REQUIRED', message: 'Título do álbum é obrigatório.' })
    if (!album.media.some((item) => item.media_type === 'photo')) errors.push({ field: 'photos', code: 'MIN_PHOTOS', message: 'Adicione pelo menos uma foto ao álbum.' })
    const memorial = album.category === 'memorial' || album.category === 'posthumous' || album.presentation === 'memorial-luz'
    if (memorial) {
      if (!album.honoree_names?.trim()) errors.push({ field: 'honoree_names', code: 'MEMORIAL_HONOREE_REQUIRED', message: 'Informe o nome do homenageado.' })
      if ((album.dedication?.trim().length ?? 0) < 20) errors.push({ field: 'dedication', code: 'MEMORIAL_BIOGRAPHY_REQUIRED', message: 'Escreva uma biografia com pelo menos 20 caracteres.' })
      if (album.chapters.length === 0) errors.push({ field: 'chapters', code: 'MEMORIAL_CHAPTER_REQUIRED', message: 'Crie ao menos um capítulo para organizar a homenagem.' })
      if (!album.chapters.some((chapter) => chapter.memories.length > 0)) errors.push({ field: 'memories', code: 'MEMORIAL_MEMORY_REQUIRED', message: 'Adicione ao menos uma memória ao memorial.' })
      const lifeDates = (album.content_json as { life_dates?: { birth_date?: string; death_date?: string } } | null)?.life_dates
      if (lifeDates?.birth_date && lifeDates?.death_date && lifeDates.death_date < lifeDates.birth_date) {
        errors.push({ field: 'life_dates', code: 'MEMORIAL_LIFE_DATES_INVALID', message: 'A data de falecimento não pode ser anterior à data de nascimento.' })
      }
    } else if (album.media.some((item) => item.media_type === 'photo' && !item.title?.trim() && !item.caption?.trim())) {
      warnings.push({ field: 'photos', code: 'PHOTO_CONTEXT_RECOMMENDED', message: 'Adicione títulos ou legendas para transformar a galeria em uma história.' })
    }
    const coverId = (album.book_config as { cover?: { media_id?: string | null } } | null)?.cover?.media_id
    if (!coverId) warnings.push({ field: 'photos', code: 'COVER_RECOMMENDED', message: 'Escolha uma foto de capa para melhorar a primeira impressão.' })
    return { valid: errors.length === 0, errors, warnings }
  },

  publish(albumId: string): AlbumDetail | undefined {
    const album = albums.get(albumId)
    const validation = this.validate(albumId)
    if (!album || !validation?.valid) return undefined
    album.status = 'published'
    album.published_at = now()
    touch(album)
    persist()
    return hydrate(album)
  },

  chapters(albumId: string): AlbumChapter[] | undefined {
    const album = albums.get(albumId)
    return album ? clone(album.chapters.map((chapter) => ({ ...chapter, memories: [] })).sort((a, b) => a.sort_order - b.sort_order)) : undefined
  },

  createChapter(albumId: string, payload: { title: string; sort_order?: number }): AlbumChapter | undefined {
    const album = albums.get(albumId)
    if (!album) return undefined
    const chapter: AlbumChapter = { id: id('chapter'), title: payload.title, sort_order: payload.sort_order ?? album.chapters.length, memories: [] }
    album.chapters.push(chapter)
    touch(album); persist()
    return clone(chapter)
  },

  updateChapter(albumId: string, chapterId: string, payload: { title?: string; sort_order?: number }): AlbumChapter | undefined {
    const album = albums.get(albumId)
    const chapter = album?.chapters.find((item) => item.id === chapterId)
    if (!album || !chapter) return undefined
    if (payload.title !== undefined) chapter.title = payload.title
    if (payload.sort_order !== undefined) chapter.sort_order = payload.sort_order
    touch(album); persist()
    return clone(chapter)
  },

  removeChapter(albumId: string, chapterId: string): boolean {
    const album = albums.get(albumId)
    if (!album) return false
    const before = album.chapters.length
    album.chapters = album.chapters.filter((chapter) => chapter.id !== chapterId)
    touch(album); persist()
    return album.chapters.length !== before
  },

  memories(albumId: string, chapterId: string): AlbumMemory[] | undefined {
    const album = albums.get(albumId)
    const chapter = album?.chapters.find((item) => item.id === chapterId)
    return album && chapter ? chapter.memories.map((memory) => hydrateMemory(album, memory)).sort((a, b) => a.sort_order - b.sort_order) : undefined
  },

  createMemory(albumId: string, chapterId: string, payload: Record<string, unknown>): AlbumMemory | undefined {
    const album = albums.get(albumId)
    const chapter = album?.chapters.find((item) => item.id === chapterId)
    if (!album || !chapter) return undefined
    const content = (payload.content_json as Record<string, unknown> | undefined) ?? {}
    const memory: AlbumMemory = {
      id: id('memory'), sort_order: Number(payload.sort_order) || chapter.memories.length,
      title: String(payload.title ?? ''), description: String(payload.description ?? ''), date: String(payload.date ?? ''),
      tags: (payload.tags as string[] | undefined) ?? [], people: (payload.people as string[] | undefined) ?? [], media: [],
      media_ids: (content.media_ids as string[] | undefined) ?? [], content_json: content,
    }
    chapter.memories.push(memory); touch(album); persist()
    return hydrateMemory(album, memory)
  },

  updateMemory(albumId: string, chapterId: string, memoryId: string, payload: Record<string, unknown>): AlbumMemory | undefined {
    const album = albums.get(albumId)
    const chapter = album?.chapters.find((item) => item.id === chapterId)
    const memory = chapter?.memories.find((item) => item.id === memoryId)
    if (!album || !memory) return undefined
    for (const key of ['title', 'subtitle', 'description', 'date', 'time', 'sort_order'] as const) {
      if (key in payload) Object.assign(memory, { [key]: payload[key] })
    }
    if (payload.content_json && typeof payload.content_json === 'object') {
      memory.content_json = { ...(memory.content_json ?? {}), ...(payload.content_json as Record<string, unknown>) }
      memory.media_ids = (memory.content_json.media_ids as string[] | undefined) ?? []
    }
    touch(album); persist()
    return hydrateMemory(album, memory)
  },

  removeMemory(albumId: string, chapterId: string, memoryId: string): boolean {
    const album = albums.get(albumId)
    const chapter = album?.chapters.find((item) => item.id === chapterId)
    if (!album || !chapter) return false
    const before = chapter.memories.length
    chapter.memories = chapter.memories.filter((memory) => memory.id !== memoryId)
    touch(album); persist()
    return chapter.memories.length !== before
  },

  addMedia(albumId: string, mediaId: string, mediaType: 'photo' | 'audio', filename = 'arquivo.jpg'): AlbumMedia | undefined {
    const album = albums.get(albumId)
    if (!album) return undefined
    const media: AlbumMedia = mediaType === 'photo' ? photo(mediaId, album.media.length, '') : {
      id: mediaId, storage_file_id: `storage-${mediaId}`, media_type: 'audio', original_filename: filename,
      mime_type: 'audio/mpeg', size_bytes: 1_200_000, sort_order: album.media.length, title: null, caption: null,
      memory_date: null, place_name: null, url_thumbnail: null, url: demoPhoto, created_at: now(),
    }
    media.original_filename = filename
    album.media.push(media)
    if (mediaType === 'audio') album.music_media_id = mediaId
    touch(album); persist()
    return clone(media)
  },

  updateMedia(albumId: string, mediaId: string, payload: Partial<Pick<AlbumMedia, 'title' | 'caption' | 'memory_date' | 'place_name'>>): AlbumMedia | undefined {
    const album = albums.get(albumId)
    const media = album?.media.find((item) => item.id === mediaId && item.media_type === 'photo')
    if (!album || !media) return undefined
    for (const key of ['title', 'caption', 'memory_date', 'place_name'] as const) {
      if (key in payload) media[key] = payload[key] ?? null
    }
    touch(album); persist()
    return clone(media)
  },

  replaceMedia(albumId: string, mediaId: string, replacementId: string): AlbumMedia | undefined {
    const album = albums.get(albumId)
    const old = album?.media.find((item) => item.id === mediaId)
    const replacement = album?.media.find((item) => item.id === replacementId)
    if (!album || !old || !replacement) return undefined
    Object.assign(replacement, { sort_order: old.sort_order, title: old.title, caption: old.caption, memory_date: old.memory_date, place_name: old.place_name })
    const config = album.book_config as { cover?: { media_id?: string | null } } | null
    if (config?.cover?.media_id === mediaId) config.cover.media_id = replacementId
    for (const chapter of album.chapters) for (const memory of chapter.memories) {
      memory.media_ids = (memory.media_ids ?? []).map((id) => id === mediaId ? replacementId : id)
      memory.content_json = { ...(memory.content_json ?? {}), media_ids: memory.media_ids }
    }
    album.media = album.media.filter((item) => item.id !== mediaId).sort((a, b) => a.sort_order - b.sort_order)
    touch(album); persist()
    return clone(replacement)
  },

  removeMedia(albumId: string, mediaId: string): boolean {
    const album = albums.get(albumId)
    if (!album) return false
    const before = album.media.length
    album.media = album.media.filter((media) => media.id !== mediaId)
    album.media.forEach((media, index) => { media.sort_order = index })
    for (const chapter of album.chapters) for (const memory of chapter.memories) memory.media_ids = (memory.media_ids ?? []).filter((id) => id !== mediaId)
    touch(album); persist()
    return album.media.length !== before
  },

  reorderMedia(albumId: string, order: string[]): boolean {
    const album = albums.get(albumId)
    if (!album) return false
    album.media.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    album.media.forEach((media, index) => { media.sort_order = index })
    touch(album); persist()
    return true
  },

  publicBySlug(slug: string): PublicAlbum | undefined {
    const album = Array.from(albums.values()).find((item) => item.slug === slug && item.status === 'published' && item.is_public)
    if (!album) return undefined
    const detail = hydrate(album)
    const audio = detail.media.find((item) => item.media_type === 'audio')
    return {
      slug: detail.slug, title: detail.title, subtitle: detail.subtitle, color_primary: detail.color_primary,
      presentation: detail.presentation, category: detail.category, honoree_names: detail.honoree_names,
      dedication: detail.dedication, published_at: detail.published_at, views_count: detail.views_count,
      photos: detail.media.filter((item) => item.media_type === 'photo').map((item) => ({ id: item.id, url: item.url ?? null, title: item.title, caption: item.caption, memory_date: item.memory_date, place_name: item.place_name, sort_order: item.sort_order })),
      chapters: detail.chapters, experiences: detail.experiences, content_json: detail.content_json,
      music: audio ? { id: audio.id, url: audio.url ?? null } : null,
    }
  },

  incrementViews(slug: string): void {
    const album = Array.from(albums.values()).find((item) => item.slug === slug)
    if (album) { album.views_count += 1; persist() }
  },
}
