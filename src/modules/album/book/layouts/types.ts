import type { MemoryBookPhoto } from '../types'

export type PageLayoutId =
  | 'full-bleed'
  | 'double-spread'
  | 'hero-caption'
  | 'asymmetric-duo'
  | 'editorial-trio'
  | 'polaroid-memory'
  | 'collage-grid'
  | 'text-focus'
  | 'chapter-opener'

export type LayoutStrategy =
  | 'classic'
  | 'wedding'
  | 'family'
  | 'polaroid'
  | 'scrapbook'
  | 'travel'
  | 'magazine'
  | 'luxury'

export interface PhotoUnit {
  photo: MemoryBookPhoto
  title?: string
  message?: string
  memoryDate?: string
}

export interface PageGroup {
  photos: MemoryBookPhoto[]
  title?: string
  message?: string
  memoryDate?: string
}
