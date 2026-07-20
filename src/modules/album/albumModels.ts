import type { AlbumCategory } from '@/api/types'
import type { BookPresentationId } from './book/types'
import { MEMORIAL_PRESENTATION } from './book/presentations'

export interface AlbumModelDefinition {
  id: string
  category: AlbumCategory
  presentation: BookPresentationId
  name: string
  description: string
  emoji: string
  tagline: string
  defaultTitle: string
  defaultEyebrow: string
  /** Capítulos sugeridos ao criar (memorial). */
  seedChapters?: string[]
}

export const ALBUM_MODELS: AlbumModelDefinition[] = [
  {
    id: 'gallery',
    category: 'custom',
    presentation: 'classic-photobook',
    name: 'Galeria de Memórias',
    description:
      'Galeria fotográfica premium: capa, masonry responsivo, legendas e lightbox elegante.',
    emoji: '🖼️',
    tagline: 'Como um portfólio de estúdio',
    defaultTitle: 'Meu álbum de memórias',
    defaultEyebrow: 'ÁLBUM',
  },
  {
    id: 'memorial',
    category: 'memorial',
    presentation: MEMORIAL_PRESENTATION,
    name: 'Memorial Digital',
    description:
      'Homenagem serena para quem partiu: biografia, linha do tempo, recordações e tributos de visitantes.',
    emoji: '🕯️',
    tagline: 'Em memória eterna',
    defaultTitle: 'Em memória',
    defaultEyebrow: 'EM MEMÓRIA',
    seedChapters: ['Biografia', 'Linha do Tempo', 'Recordações'],
  },
]

export function getAlbumModel(id: string): AlbumModelDefinition | undefined {
  return ALBUM_MODELS.find((model) => model.id === id)
}

export function isMemorialModel(model?: AlbumModelDefinition | null): boolean {
  return model?.id === 'memorial' || model?.presentation === MEMORIAL_PRESENTATION
}

export function isMemorialCategory(category?: string | null): boolean {
  return category === 'memorial' || category === 'posthumous'
}
