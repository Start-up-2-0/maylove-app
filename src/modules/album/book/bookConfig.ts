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

export interface BookConfig {
  cover: BookConfigCover
  colors: BookConfigColors
  fonts: BookConfigFonts
  board?: BookConfigBoard
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
        rotation: prev.rotation ?? BOARD_ROTATIONS[index % BOARD_ROTATIONS.length],
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
      rotation: typeof item.rotation === 'number' ? item.rotation : BOARD_ROTATIONS[index % BOARD_ROTATIONS.length],
      z: typeof item.z === 'number' ? item.z : index + 1,
    }))
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(90, Math.max(0, value))
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
