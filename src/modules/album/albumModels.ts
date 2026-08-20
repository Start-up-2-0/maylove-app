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
  {
    id: 'wedding', category: 'wedding', presentation: 'wedding-book', name: 'Álbum de Casamento',
    description: 'Uma narrativa elegante do preparo à celebração, com espaço para a história do casal.',
    emoji: '💍', tagline: 'O começo do para sempre', defaultTitle: 'Nosso casamento', defaultEyebrow: 'CASAMENTO',
    seedChapters: ['Nossa história', 'Cerimônia', 'Celebração', 'Momentos favoritos'],
  },
  {
    id: 'childhood', category: 'children', presentation: 'scrapbook', name: 'Álbum de Infância',
    description: 'Fases, descobertas e pequenas histórias em um livro leve e afetivo.',
    emoji: '🧸', tagline: 'Crescer em memórias', defaultTitle: 'Minha infância', defaultEyebrow: 'INFÂNCIA',
    seedChapters: ['Chegada ao mundo', 'Primeiras descobertas', 'Família', 'Escola e aventuras'],
  },
  {
    id: 'birthday', category: 'birthday', presentation: 'instant-photo', name: 'Álbum de Aniversário',
    description: 'Uma celebração vibrante com fotos, mensagens e os melhores momentos da festa.',
    emoji: '🎂', tagline: 'Um novo capítulo', defaultTitle: 'Um dia para celebrar', defaultEyebrow: 'ANIVERSÁRIO',
    seedChapters: ['Quem celebramos', 'A festa', 'Mensagens especiais'],
  },
  {
    id: 'travel', category: 'custom', presentation: 'travel-journal', name: 'Diário de Viagem',
    description: 'Destinos, datas e relatos organizados como um diário editorial de viagem.',
    emoji: '✈️', tagline: 'Histórias pelo caminho', defaultTitle: 'Nossa viagem', defaultEyebrow: 'DIÁRIO DE VIAGEM',
    seedChapters: ['Partida', 'Lugares inesquecíveis', 'Descobertas', 'Volta para casa'],
  },
  {
    id: 'family', category: 'family', presentation: 'family-memories', name: 'Álbum de Família',
    description: 'Um livro acolhedor para reunir gerações, tradições e histórias compartilhadas.',
    emoji: '👨‍👩‍👧', tagline: 'Nossa história continua', defaultTitle: 'Nossa família', defaultEyebrow: 'FAMÍLIA',
    seedChapters: ['Nossas raízes', 'Tradições', 'Encontros', 'Novos capítulos'],
  },
  {
    id: 'graduation', category: 'graduation', presentation: 'magazine-style', name: 'Álbum de Formatura',
    description: 'Uma edição especial da jornada, das amizades e da conquista.',
    emoji: '🎓', tagline: 'Uma conquista para sempre', defaultTitle: 'Nossa formatura', defaultEyebrow: 'FORMATURA',
    seedChapters: ['A jornada', 'Amizades', 'O grande dia', 'Próximos passos'],
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
