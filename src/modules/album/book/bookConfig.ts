import {
  DEFAULT_BOOK_FRAME_STYLE,
  normalizeFrameStyle,
  type BookFrameStyle,
} from './frameStyles'

export type { BookFrameStyle }
export { BOOK_FRAME_STYLES, DEFAULT_BOOK_FRAME_STYLE, normalizeFrameStyle } from './frameStyles'

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
  /** Moldura Polaroid das fotos (todos os estilos de álbum). */
  frame_style?: BookFrameStyle
  board?: BookConfigBoard
  music?: BookConfigMusic
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
    eyebrow: 'ÁLBUM',
  },
  colors: {
    paper: '#fbfaf7',
    ink: '#1c1814',
    accent: '#c45d7a',
    page: '#f5f3ee',
  },
  fonts: {
    preset: 'editorial',
  },
  frame_style: DEFAULT_BOOK_FRAME_STYLE,
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
    frame_style: normalizeFrameStyle(raw?.frame_style ?? DEFAULT_BOOK_FRAME_STYLE),
    board: {
      items: normalizeBoardItems(raw?.board?.items),
    },
    music: normalizeBookMusic(raw?.music ?? DEFAULT_BOOK_MUSIC),
  }
}

/** Defaults visuais por apresentação (photobook editorial). */
export function defaultBookConfigFor(presentation?: string | null): BookConfig {
  switch (presentation) {
    case 'instant-photo':
    case 'polaroid-board':
    case 'portrait-album':
    case 'classic-photobook':
    default:
      return normalizeBookConfig({
        cover: { mode: 'text', media_id: null, eyebrow: 'ÁLBUM' },
        colors: { paper: '#fbfaf7', ink: '#1c1814', accent: '#c45d7a', page: '#f5f3ee' },
        fonts: { preset: 'editorial' },
        frame_style: DEFAULT_BOOK_FRAME_STYLE,
        board: { items: [] },
      })
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

const POLAROID_PLACEMENTS: Array<Array<{ x: number; y: number; rotation: number; scale: number }>> = [
  [
    { x: 50, y: 50, rotation: -2, scale: 1 },
  ],
  [
    { x: 30, y: 40, rotation: -6, scale: 0.86 },
    { x: 64, y: 58, rotation: 5, scale: 0.9 },
  ],
  [
    { x: 26, y: 34, rotation: -7, scale: 0.72 },
    { x: 58, y: 30, rotation: 4, scale: 0.76 },
    { x: 34, y: 64, rotation: 5, scale: 0.74 },
  ],
  [
    { x: 26, y: 34, rotation: -7, scale: 0.72 },
    { x: 58, y: 30, rotation: 4, scale: 0.76 },
    { x: 34, y: 64, rotation: 5, scale: 0.74 },
    { x: 68, y: 62, rotation: -3.5, scale: 0.78 },
  ],
]

export function defaultPolaroidPlacement(index: number, total: number) {
  const pack = POLAROID_PLACEMENTS[Math.min(Math.max(total, 1), 4) - 1]
  return pack[Math.min(index, pack.length - 1)]
}

export function clampPolaroidScale(value?: number | null): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 1
  return Math.min(1.35, Math.max(0.55, n))
}

