import type { BookPresentationId } from '../types'
import type { LayoutStrategy } from '../layouts/types'

export interface BookTheme {
  id: BookPresentationId
  name: string
  strategy: LayoutStrategy
  fonts: {
    display: string
    body: string
    accent?: string
  }
  tokens: {
    paper: string
    paperAlt: string
    ink: string
    muted: string
    border: string
    shadow: string
  }
  cover: {
    variant: 'minimal' | 'romantic' | 'family' | 'polaroid' | 'scrapbook' | 'travel' | 'magazine' | 'luxury'
    eyebrow?: string
  }
  features: {
    pageNumbers: boolean
    showBinder: boolean
    chapterOpeners: boolean
    polaroidFrames: boolean
    scrapbookDecor: boolean
    textureOverlay: boolean
  }
}

/** Slugs legados → tema canônico */
export const LEGACY_PRESENTATION_MAP: Record<string, BookPresentationId> = {
  'family-album': 'family-memories',
  'romantic-book': 'wedding-book',
  polaroid: 'polaroid-memories',
  'memory-notebook': 'travel-journal',
  'photo-magazine': 'magazine-style',
}

const CANONICAL_PRESENTATIONS = [
  'classic-photobook',
  'wedding-book',
  'family-memories',
  'polaroid-memories',
  'scrapbook',
  'travel-journal',
  'magazine-style',
  'luxury-album',
  'timeline',
] as const

export type CanonicalPresentationId = (typeof CANONICAL_PRESENTATIONS)[number]

export function normalizePresentationId(id: string | null | undefined): BookPresentationId {
  if (!id) return 'classic-photobook'
  const mapped = LEGACY_PRESENTATION_MAP[id]
  if (mapped) return mapped
  return id as BookPresentationId
}

const BASE_FEATURES: BookTheme['features'] = {
  pageNumbers: true,
  showBinder: false,
  // Capítulos automáticos desligados até existirem controles no wizard
  chapterOpeners: false,
  polaroidFrames: false,
  scrapbookDecor: false,
  textureOverlay: false,
}

const CANONICAL_THEMES: Record<CanonicalPresentationId, BookTheme> = {
  'classic-photobook': {
    id: 'classic-photobook',
    name: 'Memory Book',
    strategy: 'classic',
    fonts: {
      display: "'Archivo Black', 'Arial Black', sans-serif",
      body: "'Libre Baskerville', Georgia, serif",
      accent: "'Libre Baskerville', Georgia, serif",
    },
    tokens: {
      paper: '#ffffff',
      paperAlt: '#f4f4f4',
      ink: '#111111',
      muted: '#666666',
      border: 'rgba(17, 17, 17, 0.12)',
      shadow: '0 24px 48px -28px rgba(0, 0, 0, 0.35)',
    },
    cover: { variant: 'minimal', eyebrow: 'MEMORY' },
    features: { ...BASE_FEATURES, showBinder: false },
  },
  'wedding-book': {
    id: 'wedding-book',
    name: 'Wedding Book',
    strategy: 'wedding',
    fonts: {
      display: "'Cormorant Garamond', Georgia, serif",
      body: "'Cormorant Garamond', Georgia, serif",
      accent: "'Dancing Script', cursive",
    },
    tokens: {
      paper: '#fffcfa',
      paperAlt: '#faf5f2',
      ink: '#2a2220',
      muted: '#8a7a72',
      border: 'rgba(42, 34, 32, 0.09)',
      shadow: '0 32px 64px -36px rgba(60, 40, 35, 0.35)',
    },
    cover: { variant: 'romantic', eyebrow: 'Para sempre' },
    features: { ...BASE_FEATURES },
  },
  'family-memories': {
    id: 'family-memories',
    name: 'Family Memories',
    strategy: 'family',
    fonts: {
      display: "'Fraunces', Georgia, serif",
      body: "'Hanken Grotesk', system-ui, sans-serif",
    },
    tokens: {
      paper: '#fffaf6',
      paperAlt: '#fff3ea',
      ink: '#2b2118',
      muted: '#7d6f62',
      border: 'rgba(43, 33, 24, 0.12)',
      shadow: '0 24px 50px -28px rgba(43, 33, 24, 0.4)',
    },
    cover: { variant: 'family', eyebrow: 'Nossas memórias' },
    features: { ...BASE_FEATURES, showBinder: true },
  },
  'polaroid-memories': {
    id: 'polaroid-memories',
    name: 'Polaroid Memories',
    strategy: 'polaroid',
    fonts: {
      display: "'Caveat', cursive",
      body: "'Caveat', cursive",
    },
    tokens: {
      paper: '#eceae4',
      paperAlt: '#e4e1da',
      ink: '#3a3835',
      muted: '#6f6c66',
      border: 'rgba(0, 0, 0, 0.08)',
      shadow: '0 18px 40px -22px rgba(0, 0, 0, 0.45)',
    },
    cover: { variant: 'polaroid', eyebrow: 'Instantâneos' },
    features: { ...BASE_FEATURES, chapterOpeners: false, polaroidFrames: true },
  },
  scrapbook: {
    id: 'scrapbook',
    name: 'Scrapbook',
    strategy: 'scrapbook',
    fonts: {
      display: "'Special Elite', monospace",
      body: "'Caveat', cursive",
    },
    tokens: {
      paper: '#fbf7ef',
      paperAlt: '#f3ebdf',
      ink: '#3b3228',
      muted: '#7a6f60',
      border: 'rgba(59, 50, 40, 0.14)',
      shadow: '0 22px 44px -26px rgba(59, 50, 40, 0.42)',
    },
    cover: { variant: 'scrapbook', eyebrow: 'Álbum artesanal' },
    features: {
      ...BASE_FEATURES,
      scrapbookDecor: true,
      textureOverlay: true,
    },
  },
  'travel-journal': {
    id: 'travel-journal',
    name: 'Travel Journal',
    strategy: 'travel',
    fonts: {
      display: "'Josefin Sans', sans-serif",
      body: "'Hanken Grotesk', system-ui, sans-serif",
    },
    tokens: {
      paper: '#f8f6f1',
      paperAlt: '#efece4',
      ink: '#1f2a30',
      muted: '#5f6d74',
      border: 'rgba(31, 42, 48, 0.1)',
      shadow: '0 26px 54px -30px rgba(31, 42, 48, 0.38)',
    },
    cover: { variant: 'travel', eyebrow: 'Diário de viagem' },
    features: { ...BASE_FEATURES, textureOverlay: true },
  },
  'magazine-style': {
    id: 'magazine-style',
    name: 'Magazine Style',
    strategy: 'magazine',
    fonts: {
      display: "'Space Grotesk', system-ui, sans-serif",
      body: "'Hanken Grotesk', system-ui, sans-serif",
    },
    tokens: {
      paper: '#fafafa',
      paperAlt: '#111111',
      ink: '#111111',
      muted: '#666666',
      border: 'rgba(0, 0, 0, 0.08)',
      shadow: '0 30px 60px -34px rgba(0, 0, 0, 0.5)',
    },
    cover: { variant: 'magazine', eyebrow: 'Edição especial' },
    features: { ...BASE_FEATURES },
  },
  'luxury-album': {
    id: 'luxury-album',
    name: 'Luxury Album',
    strategy: 'luxury',
    fonts: {
      display: "'Cinzel', Georgia, serif",
      body: "'Cormorant Garamond', Georgia, serif",
    },
    tokens: {
      paper: '#f9f7f4',
      paperAlt: '#1a1714',
      ink: '#14110f',
      muted: '#6e655d',
      border: 'rgba(20, 17, 15, 0.12)',
      shadow: '0 36px 72px -40px rgba(0, 0, 0, 0.55)',
    },
    cover: { variant: 'luxury', eyebrow: 'Coleção privada' },
    features: { ...BASE_FEATURES, showBinder: true },
  },
  timeline: {
    id: 'timeline',
    name: 'Linha do Tempo',
    strategy: 'classic',
    fonts: {
      display: "'Playfair Display', Georgia, serif",
      body: "'Hanken Grotesk', system-ui, sans-serif",
    },
    tokens: {
      paper: '#fffdf8',
      paperAlt: '#f7f3ec',
      ink: '#2a2420',
      muted: '#7a6f66',
      border: 'rgba(42, 36, 32, 0.12)',
      shadow: '0 24px 48px -28px rgba(0, 0, 0, 0.4)',
    },
    cover: { variant: 'minimal' },
    features: {
      pageNumbers: false,
      showBinder: false,
      chapterOpeners: false,
      polaroidFrames: false,
      scrapbookDecor: false,
      textureOverlay: false,
    },
  },
}

export function getBookTheme(presentation: string | null | undefined): BookTheme {
  const canonical = normalizePresentationId(presentation)
  return CANONICAL_THEMES[canonical as CanonicalPresentationId] ?? CANONICAL_THEMES['classic-photobook']
}

export function getThemeCssVars(
  theme: BookTheme,
  accentColor: string,
  overrides?: {
    paper?: string
    ink?: string
    page?: string
    fontDisplay?: string
    fontBody?: string
  },
): Record<string, string> {
  return {
    '--book-paper': overrides?.paper ?? theme.tokens.paper,
    '--book-paper-alt': overrides?.page ?? theme.tokens.paperAlt,
    '--book-ink': overrides?.ink ?? theme.tokens.ink,
    '--book-muted': theme.tokens.muted,
    '--book-border': theme.tokens.border,
    '--book-shadow': theme.tokens.shadow,
    '--book-accent': accentColor,
    '--book-font-display': overrides?.fontDisplay ?? theme.fonts.display,
    '--book-font-body': overrides?.fontBody ?? theme.fonts.body,
    '--book-font-accent': theme.fonts.accent ?? theme.fonts.display,
  }
}

const FONT_PRESETS: Record<string, { display: string; body: string }> = {
  editorial: {
    display: "'Archivo Black', 'Arial Black', sans-serif",
    body: "'Libre Baskerville', Georgia, serif",
  },
  classic: {
    display: "'Playfair Display', Georgia, serif",
    body: "'Cormorant Garamond', Georgia, serif",
  },
  modern: {
    display: "'Space Grotesk', system-ui, sans-serif",
    body: "'Hanken Grotesk', system-ui, sans-serif",
  },
}

export function fontPresetVars(preset?: string): { display: string; body: string } {
  return FONT_PRESETS[preset ?? 'editorial'] ?? FONT_PRESETS.editorial
}
