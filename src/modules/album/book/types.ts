export type BookPresentationId =
  | 'family-album'
  | 'polaroid'
  | 'memory-notebook'
  | 'romantic-book'
  | 'timeline'
  | 'photo-magazine'

export interface MemoryBookPhoto {
  id: string
  url: string
}

export interface MemoryBookContentPage {
  kind: 'content'
  pageNo: number
  photos: MemoryBookPhoto[]
  title?: string
  message?: string
  memoryDate?: string
  caption?: string
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
}

export interface BookPresentationDefinition {
  id: BookPresentationId
  name: string
  description: string
  emoji: string
}

export type BookRenderMode = 'preview' | 'full'
