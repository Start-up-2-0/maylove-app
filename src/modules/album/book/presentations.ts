import type { BookPresentationDefinition } from './types'

/** Catálogo principal — inspirado em photobooks profissionais (Adobe Stock e afins) */
export const BOOK_PRESENTATIONS: BookPresentationDefinition[] = [
  {
    id: 'classic-photobook',
    name: 'Classic Photobook',
    description: 'Minimalista e elegante. Tipografia refinada, margens generosas e fotos em destaque.',
    emoji: '📖',
    tagline: 'Atemporal',
  },
  {
    id: 'wedding-book',
    name: 'Wedding Book',
    description: 'Romântico e sofisticado. Composições assimétricas para histórias de casamento.',
    emoji: '💍',
    tagline: 'Para sempre',
  },
  {
    id: 'family-memories',
    name: 'Family Memories',
    description: 'Álbum de família acolhedor. Páginas quentes com espaço para relatos e datas.',
    emoji: '👨‍👩‍👧',
    tagline: 'Nossas memórias',
  },
  {
    id: 'polaroid-memories',
    name: 'Polaroid Memories',
    description: 'Molduras instantâneas com anotações manuscritas na margem branca.',
    emoji: '📷',
    tagline: 'Instantâneos',
  },
  {
    id: 'scrapbook',
    name: 'Scrapbook',
    description: 'Papéis texturizados, fitas e elementos artesanais com charme handmade.',
    emoji: '✂️',
    tagline: 'Artesanal',
  },
  {
    id: 'travel-journal',
    name: 'Travel Journal',
    description: 'Diário de viagem editorial. Mapas mentais, datas e relatos por destino.',
    emoji: '✈️',
    tagline: 'Roteiro afetivo',
  },
  {
    id: 'magazine-style',
    name: 'Magazine Style',
    description: 'Layout editorial ousado. Tipografia forte e fotos em múltiplas proporções.',
    emoji: '📰',
    tagline: 'Edição especial',
  },
  {
    id: 'luxury-album',
    name: 'Luxury Album',
    description: 'Acabamento premium. Imagens grandes, pouco texto e muito espaço em branco.',
    emoji: '✨',
    tagline: 'Coleção privada',
  },
  {
    id: 'timeline',
    name: 'Linha do Tempo',
    description: 'Momentos em ordem cronológica com rolagem vertical contínua.',
    emoji: '🕰️',
    tagline: 'Capítulo a capítulo',
  },
]

export function getBookPresentation(id: string): BookPresentationDefinition | undefined {
  const normalized = normalizePresentationId(id)
  return BOOK_PRESENTATIONS.find((item) => item.id === normalized)
    ?? LEGACY_PRESENTATION_FALLBACKS[id]
}

export function isTimelinePresentation(id: string | null | undefined): boolean {
  return normalizePresentationId(id) === 'timeline'
}

export function normalizePresentationId(id: string | null | undefined): string {
  const map: Record<string, string> = {
    'family-album': 'family-memories',
    'romantic-book': 'wedding-book',
    polaroid: 'polaroid-memories',
    'memory-notebook': 'travel-journal',
    'photo-magazine': 'magazine-style',
  }
  if (!id) return 'classic-photobook'
  return map[id] ?? id
}

const LEGACY_PRESENTATION_FALLBACKS: Record<string, BookPresentationDefinition> = {
  'family-album': BOOK_PRESENTATIONS.find((p) => p.id === 'family-memories')!,
  'romantic-book': BOOK_PRESENTATIONS.find((p) => p.id === 'wedding-book')!,
  polaroid: BOOK_PRESENTATIONS.find((p) => p.id === 'polaroid-memories')!,
  'memory-notebook': BOOK_PRESENTATIONS.find((p) => p.id === 'travel-journal')!,
  'photo-magazine': BOOK_PRESENTATIONS.find((p) => p.id === 'magazine-style')!,
}

export const DEFAULT_BOOK_PRESENTATION = 'classic-photobook' as const
