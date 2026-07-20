import type { BookPresentationDefinition } from './types'
import { MEMORIAL_PRESENTATION } from '../albumModels'

/** Catálogo completo (lookups + álbuns legados). */
export const ALL_BOOK_PRESENTATIONS: BookPresentationDefinition[] = [
  {
    id: 'classic-photobook',
    name: 'Memory Book',
    description:
      'Livro editorial personalizável: capa, cores e páginas sob seu controle.',
    emoji: '📖',
    tagline: 'Do sonho às memórias',
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
    id: 'polaroid-board',
    name: 'Quadro Polaroid',
    description:
      'Um mural com polaroids coladas no quadro — fitas, pins e fotos tortinhas.',
    emoji: '🖼️',
    tagline: 'Coladas com carinho',
  },
  {
    id: 'portrait-album',
    name: 'Álbum Retrato',
    description:
      'Página vintage: papel envelhecido, cantos de foto e bordas recortadas.',
    emoji: '📔',
    tagline: 'Memórias encadernadas',
  },
  {
    id: 'instant-photo',
    name: 'Instant Photo',
    description:
      'Só fotos com moldura instantânea em fundo escuro — família, casamento, aniversário ou formatura.',
    emoji: '📸',
    tagline: 'Instant Photo',
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
  {
    id: MEMORIAL_PRESENTATION,
    name: 'Memorial Digital',
    description:
      'Homenagem serena para quem partiu: biografia, linha do tempo, recordações e tributos.',
    emoji: '🕯️',
    tagline: 'Em memória eterna',
  },
]

/** Catálogo visível — galeria + memorial. */
export const BOOK_PRESENTATIONS: BookPresentationDefinition[] = [
  {
    id: 'classic-photobook',
    name: 'Galeria de Memórias',
    description:
      'Galeria fotográfica premium: capa, masonry responsivo, legendas e lightbox elegante.',
    emoji: '🖼️',
    tagline: 'Como um portfólio de estúdio',
  },
  {
    id: MEMORIAL_PRESENTATION,
    name: 'Memorial Digital',
    description:
      'Homenagem serena para quem partiu: biografia, linha do tempo, recordações e tributos.',
    emoji: '🕯️',
    tagline: 'Em memória eterna',
  },
]

export function getBookPresentation(id: string): BookPresentationDefinition | undefined {
  const normalized = normalizePresentationId(id)
  return (
    BOOK_PRESENTATIONS.find((item) => item.id === normalized) ??
    ALL_BOOK_PRESENTATIONS.find((item) => item.id === normalized) ??
    LEGACY_PRESENTATION_FALLBACKS[id]
  )
}

export function isMemorialPresentation(id: string | null | undefined): boolean {
  return normalizePresentationId(id) === MEMORIAL_PRESENTATION
}

export function isTimelinePresentation(id: string | null | undefined): boolean {
  return normalizePresentationId(id) === 'timeline'
}

export function isMemoryBookPresentation(id: string | null | undefined): boolean {
  return normalizePresentationId(id) === 'classic-photobook'
}

export function isPolaroidBoardPresentation(id: string | null | undefined): boolean {
  return normalizePresentationId(id) === 'polaroid-board'
}

export function isPortraitAlbumPresentation(id: string | null | undefined): boolean {
  return normalizePresentationId(id) === 'portrait-album'
}

export function isInstantPhotoPresentation(id: string | null | undefined): boolean {
  return normalizePresentationId(id) === 'instant-photo'
}

/** Murais livres (cork / papel vintage). */
export function isMuralPresentation(id: string | null | undefined): boolean {
  return isPolaroidBoardPresentation(id) || isPortraitAlbumPresentation(id)
}

/** Estilos sem editor de páginas Memory Book. */
export function isPhotoFirstPresentation(id: string | null | undefined): boolean {
  return isMuralPresentation(id) || isInstantPhotoPresentation(id)
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
  'family-album': ALL_BOOK_PRESENTATIONS.find((p) => p.id === 'family-memories')!,
  'romantic-book': ALL_BOOK_PRESENTATIONS.find((p) => p.id === 'wedding-book')!,
  polaroid: ALL_BOOK_PRESENTATIONS.find((p) => p.id === 'polaroid-memories')!,
  'memory-notebook': ALL_BOOK_PRESENTATIONS.find((p) => p.id === 'travel-journal')!,
  'photo-magazine': ALL_BOOK_PRESENTATIONS.find((p) => p.id === 'magazine-style')!,
}

export const DEFAULT_BOOK_PRESENTATION = 'classic-photobook' as const
