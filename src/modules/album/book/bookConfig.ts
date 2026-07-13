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

export interface BookConfig {
  cover: BookConfigCover
  colors: BookConfigColors
  fonts: BookConfigFonts
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
  }
}

export function slotCountForLayout(layout: BookPageLayout): number {
  return BOOK_PAGE_LAYOUTS.find((item) => item.id === layout)?.slots ?? 1
}
