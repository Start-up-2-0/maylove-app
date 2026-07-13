import type { BookPresentationDefinition } from './types'

/** Catálogo local — espelha o backend e permite extensão sem deploy da API. */
export const BOOK_PRESENTATIONS: BookPresentationDefinition[] = [
  {
    id: 'family-album',
    name: 'Álbum de Família',
    description: 'Fotos coladas à mão, anotações afetivas e aparência vintage.',
    emoji: '📒',
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    description: 'Molduras instantâneas com legendas escritas ao lado.',
    emoji: '📷',
  },
  {
    id: 'memory-notebook',
    name: 'Caderno de Memórias',
    description: 'Diário ilustrado com papel texturizado e escrita manuscrita.',
    emoji: '📓',
  },
  {
    id: 'romantic-book',
    name: 'Livro Romântico',
    description: 'Elegante e minimalista — ideal para casais e declarações.',
    emoji: '💕',
  },
  {
    id: 'timeline',
    name: 'Linha do Tempo',
    description: 'História organizada cronologicamente, capítulo a capítulo.',
    emoji: '🕰️',
  },
  {
    id: 'photo-magazine',
    name: 'Revista Fotográfica',
    description: 'Layout editorial moderno com fotos em grande destaque.',
    emoji: '📰',
  },
]

export function getBookPresentation(id: string): BookPresentationDefinition | undefined {
  return BOOK_PRESENTATIONS.find((item) => item.id === id)
}

export const DEFAULT_BOOK_PRESENTATION = BOOK_PRESENTATIONS[0].id
