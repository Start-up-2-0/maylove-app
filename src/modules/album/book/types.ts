import type { PageLayoutId } from './layouts/types'

export type BookPresentationId =
  | 'classic-photobook'
  | 'wedding-book'
  | 'family-memories'
  | 'polaroid-memories'
  | 'polaroid-board'
  | 'portrait-album'
  | 'instant-photo'
  | 'scrapbook'
  | 'travel-journal'
  | 'magazine-style'
  | 'luxury-album'
  | 'timeline'
  | 'memorial-luz'
  /** @deprecated slugs legados — normalizados em runtime */
  | 'family-album'
  | 'polaroid'
  | 'memory-notebook'
  | 'romantic-book'
  | 'photo-magazine'

export interface MemoryBookPhoto {
  id: string
  url: string
  title?: string
  caption?: string
  memoryDate?: string
  placeName?: string
  /** Posicionamento livre (páginas Polaroid scrap). */
  x?: number
  y?: number
  rotation?: number
  scale?: number
}

export interface MemoryBookContentPage {
  kind: 'content'
  pageNo: number
  layout: PageLayoutId
  photos: MemoryBookPhoto[]
  title?: string
  message?: string
  memoryDate?: string
  caption?: string
  chapterTitle?: string
}

export interface MemoryBookCoverPage {
  kind: 'cover'
}

export interface MemoryBookBackPage {
  kind: 'back'
}

export type MemoryBookPage = MemoryBookCoverPage | MemoryBookContentPage | MemoryBookBackPage

export interface MemoryBookModel {
  presentation: BookPresentationId
  title: string
  subtitle?: string
  closingMessage?: string
  signature?: string
  lifeDates?: string
  colorPrimary: string
  contentPages: MemoryBookContentPage[]
  bookConfig?: import('./bookConfig').BookConfig
  coverPhotoUrl?: string
}

export interface BookPresentationDefinition {
  id: BookPresentationId
  name: string
  description: string
  emoji: string
  tagline?: string
}

export type BookRenderMode = 'preview' | 'full'
