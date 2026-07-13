import type { PageLayoutId } from './layouts/types'

export type BookPresentationId =
  | 'classic-photobook'
  | 'wedding-book'
  | 'family-memories'
  | 'polaroid-memories'
  | 'scrapbook'
  | 'travel-journal'
  | 'magazine-style'
  | 'luxury-album'
  | 'timeline'
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
