import type { PageLayoutId } from './layouts/types'

export type CoverMode = 'text' | 'photo' | 'full-bleed'

export type BookFontPreset = 'editorial' | 'classic' | 'modern'

export interface BookConfigColors {
  paper: string
  ink: string
  accent: string
  /** Fundo das páginas de conteúdo; se omitido, usa paper. */
  page?: string
}

export interface BookConfigCover {
  mode: CoverMode
  media_id?: string | null
  eyebrow?: string | null
}

export interface BookConfigFonts {
  preset: BookFontPreset
}

/** Posição de uma polaroid no quadro (coordenadas em % do palco). */
export interface BookBoardItem {
  media_id: string
  x: number
  y: number
  rotation?: number
  z?: number
}

export interface BookConfigBoard {
  items: BookBoardItem[]
}

export interface BookConfigMusicImport {
  status: 'processing' | 'ready' | 'failed' | null
  error: string | null
  media_id: string | null
}

export interface BookConfigMusic {
  source: 'none' | 'upload'
  autoplay: boolean
  loop: boolean
  duration_seconds: number
  start_seconds: number
  end_seconds: number
  import?: BookConfigMusicImport | null
}

export interface BookConfig {
  cover: BookConfigCover
  colors: BookConfigColors
  fonts: BookConfigFonts
  board?: BookConfigBoard
  music?: BookConfigMusic
}

export type BookPageLayout =
  | 'one'
  | 'two'
  | 'three'
  | 'bleed'
  | 'text_photo'
  | 'text'

export interface BookPageSlot {
  media_id: string | null
  show_title: boolean
  show_caption: boolean
  show_date: boolean
}

export interface BookPage {
  id: string
  sort_order: number
  layout: BookPageLayout
  title?: string | null
  place_name?: string | null
  slots: BookPageSlot[]
}

export const DEFAULT_BOOK_MUSIC: BookConfigMusic = {
  source: 'none',
  autoplay: true,
  loop: true,
  duration_seconds: 0,
  start_seconds: 0,
  end_seconds: 0,
  import: null,
}

export const DEFAULT_BOOK_CONFIG: BookConfig = {
  cover: {
    mode: 'text',
    media_id: null,
    eyebrow: 'MEMORY',
  },
  colors: {
    paper: '#ffffff',
    ink: '#111111',
    accent: '#c45d7a',
    page: '#ffffff',
  },
  fonts: {
    preset: 'editorial',
  },
  board: {
    items: [],
  },
  music: { ...DEFAULT_BOOK_MUSIC },
}

export function normalizeBookMusic(raw?: Partial<BookConfigMusic> | null): BookConfigMusic {
  return {
    source: raw?.source === 'upload' ? 'upload' : 'none',
    autoplay: raw?.autoplay !== false,
    loop: raw?.loop !== false,
    duration_seconds: Number(raw?.duration_seconds) || 0,
    start_seconds: Number(raw?.start_seconds) || 0,
    end_seconds: Number(raw?.end_seconds) || 0,
    import: raw?.import ?? null,
  }
}

const BOARD_ROTATIONS = [-8, 5, -3, 7, -6, 4, -9, 6, -2, 8, -5, 3]

export function defaultBoardItem(mediaId: string, index: number): BookBoardItem {
  const col = index % 4
  const row = Math.floor(index / 4)
  return {
    media_id: mediaId,
    x: Math.min(78, 6 + col * 22 + (index % 3) * 1.5),
    y: Math.min(72, 6 + row * 26 + (index % 2) * 2),
    rotation: BOARD_ROTATIONS[index % BOARD_ROTATIONS.length],
    z: index + 1,
  }
}

export function syncBoardItems(
  photoIds: string[],
  existing?: BookBoardItem[] | null,
): BookBoardItem[] {
  const byId = new Map((existing ?? []).map((item) => [item.media_id, item]))
  return photoIds.map((id, index) => {
    const prev = byId.get(id)
    if (prev) {
      return {
        ...prev,
        x: clampPercent(prev.x),
        y: clampPercent(prev.y),
        rotation: clampRotation(prev.rotation ?? BOARD_ROTATIONS[index % BOARD_ROTATIONS.length]),
        z: prev.z ?? index + 1,
      }
    }
    return defaultBoardItem(id, index)
  })
}

export function normalizeBoardItems(raw?: BookBoardItem[] | null): BookBoardItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item) => item && typeof item.media_id === 'string')
    .map((item, index) => ({
      media_id: item.media_id,
      x: clampPercent(Number(item.x) || 0),
      y: clampPercent(Number(item.y) || 0),
      rotation:
          typeof item.rotation === 'number'
            ? clampRotation(item.rotation)
            : BOARD_ROTATIONS[index % BOARD_ROTATIONS.length],
      z: typeof item.z === 'number' ? item.z : index + 1,
    }))
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  // Quase sem teto: permite cobrir o quadro inteiro (e leve overhang).
  return Math.min(120, Math.max(-30, value))
}

function clampRotation(value: number): number {
  if (!Number.isFinite(value)) return 0
  // Normaliza para -180..180
  let rot = ((value + 180) % 360 + 360) % 360 - 180
  return Math.round(rot * 10) / 10
}

export function normalizeBookConfig(raw?: Partial<BookConfig> | null): BookConfig {
  return {
    cover: {
      mode: raw?.cover?.mode ?? DEFAULT_BOOK_CONFIG.cover.mode,
      media_id: raw?.cover?.media_id ?? null,
      eyebrow: raw?.cover?.eyebrow ?? DEFAULT_BOOK_CONFIG.cover.eyebrow,
    },
    colors: {
      paper: raw?.colors?.paper ?? DEFAULT_BOOK_CONFIG.colors.paper,
      ink: raw?.colors?.ink ?? DEFAULT_BOOK_CONFIG.colors.ink,
      accent: raw?.colors?.accent ?? DEFAULT_BOOK_CONFIG.colors.accent,
      page: raw?.colors?.page ?? raw?.colors?.paper ?? DEFAULT_BOOK_CONFIG.colors.paper,
    },
    fonts: {
      preset: raw?.fonts?.preset ?? DEFAULT_BOOK_CONFIG.fonts.preset,
    },
    board: {
      items: normalizeBoardItems(raw?.board?.items),
    },
    music: normalizeBookMusic(raw?.music ?? DEFAULT_BOOK_MUSIC),
  }
}

/** Defaults visuais por apresentação (Instant Photo, murais, Memory Book). */
export function defaultBookConfigFor(presentation?: string | null): BookConfig {
  switch (presentation) {
    case 'instant-photo':
      return normalizeBookConfig({
        cover: { mode: 'text', media_id: null, eyebrow: 'INSTANT PHOTO' },
        colors: { paper: '#141414', ink: '#f5f5f5', accent: '#c45d7a', page: '#141414' },
        fonts: { preset: 'editorial' },
        board: { items: [] },
      })
    case 'polaroid-board':
      return normalizeBookConfig({
        cover: { mode: 'text', media_id: null, eyebrow: 'COLADAS' },
        colors: { paper: '#c4a574', ink: '#2c241c', accent: '#c45d7a', page: '#c4a574' },
        fonts: { preset: 'editorial' },
        board: { items: [] },
      })
    case 'portrait-album':
      return normalizeBookConfig({
        cover: { mode: 'text', media_id: null, eyebrow: 'ÁLBUM DE RETRATOS' },
        colors: { paper: '#e8dcc8', ink: '#2c241c', accent: '#c45d7a', page: '#e8dcc8' },
        fonts: { preset: 'editorial' },
        board: { items: [] },
      })
    default:
      return normalizeBookConfig(null)
  }
}

function normalizeHex(value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (/^#[0-9a-f]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
  }
  return trimmed
}

function looksLikeClassicPaper(value: string | null | undefined): boolean {
  if (value == null || String(value).trim() === '') return true
  return normalizeHex(String(value)) === '#ffffff'
}

function looksLikeClassicInk(value: string | null | undefined): boolean {
  if (value == null || String(value).trim() === '') return true
  return normalizeHex(String(value)) === '#111111'
}

function looksLikeClassicEyebrow(value: string | null | undefined): boolean {
  if (value == null || String(value).trim() === '') return true
  return String(value).trim().toUpperCase() === 'MEMORY'
}

/**
 * Normaliza book_config e troca defaults do Memory Book (branco/MEMORY)
 * pelos tokens do estilo quando a apresentação for Instant Photo / mural.
 * Corrige álbuns antigos criados sem book_config específico.
 */
export function resolveBookConfig(
  raw?: Partial<BookConfig> | null,
  presentation?: string | null,
): BookConfig {
  const styleDefaults = defaultBookConfigFor(presentation)
  const base = normalizeBookConfig(raw)
  const styled =
    presentation === 'instant-photo' ||
    presentation === 'polaroid-board' ||
    presentation === 'portrait-album'

  if (!styled) return base

  const paper = looksLikeClassicPaper(raw?.colors?.paper)
    ? styleDefaults.colors.paper
    : base.colors.paper
  const ink = looksLikeClassicInk(raw?.colors?.ink) ? styleDefaults.colors.ink : base.colors.ink
  const page = looksLikeClassicPaper(raw?.colors?.page ?? raw?.colors?.paper)
    ? (styleDefaults.colors.page ?? styleDefaults.colors.paper)
    : (base.colors.page ?? paper)
  const eyebrow = looksLikeClassicEyebrow(raw?.cover?.eyebrow)
    ? styleDefaults.cover.eyebrow
    : base.cover.eyebrow

  return {
    ...base,
    cover: {
      ...base.cover,
      eyebrow,
    },
    colors: {
      ...base.colors,
      paper,
      ink,
      page,
    },
  }
}

export const BOOK_PAGE_LAYOUTS: Array<{
  id: BookPageLayout
  label: string
  slots: number
  pageLayout: PageLayoutId
}> = [
  { id: 'one', label: '1 foto', slots: 1, pageLayout: 'hero-caption' },
  { id: 'two', label: '2 fotos', slots: 2, pageLayout: 'asymmetric-duo' },
  { id: 'three', label: '3 fotos', slots: 3, pageLayout: 'editorial-trio' },
  { id: 'bleed', label: 'Full bleed', slots: 1, pageLayout: 'full-bleed' },
  { id: 'text_photo', label: 'Texto + foto', slots: 1, pageLayout: 'hero-caption' },
  { id: 'text', label: 'Só texto', slots: 0, pageLayout: 'text-focus' },
]

export function emptySlots(count: number): BookPageSlot[] {
  return Array.from({ length: count }, () => ({
    media_id: null,
    show_title: true,
    show_caption: true,
    show_date: true,
  }))
}

export function createBookPage(layout: BookPageLayout, sortOrder: number): BookPage {
  const def = BOOK_PAGE_LAYOUTS.find((item) => item.id === layout) ?? BOOK_PAGE_LAYOUTS[0]
  return {
    id: crypto.randomUUID(),
    sort_order: sortOrder,
    layout: def.id,
    title: null,
    place_name: null,
    slots: emptySlots(def.slots),
  }
}

export function slotCountForLayout(layout: BookPageLayout): number {
  return BOOK_PAGE_LAYOUTS.find((item) => item.id === layout)?.slots ?? 1
}
