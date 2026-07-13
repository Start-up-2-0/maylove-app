import { defineAsyncComponent, type Component } from 'vue'
import type { BookPresentationId } from './types'

export const BOOK_TEMPLATE_REGISTRY: Record<BookPresentationId, Component> = {
  'family-album': defineAsyncComponent(() => import('./templates/FamilyAlbumTemplate.vue')),
  polaroid: defineAsyncComponent(() => import('./templates/PolaroidTemplate.vue')),
  'memory-notebook': defineAsyncComponent(() => import('./templates/MemoryNotebookTemplate.vue')),
  'romantic-book': defineAsyncComponent(() => import('./templates/RomanticBookTemplate.vue')),
  timeline: defineAsyncComponent(() => import('./templates/TimelineTemplate.vue')),
  'photo-magazine': defineAsyncComponent(() => import('./templates/PhotoMagazineTemplate.vue')),
}

export function getBookTemplate(presentation: BookPresentationId): Component {
  return BOOK_TEMPLATE_REGISTRY[presentation] ?? BOOK_TEMPLATE_REGISTRY['family-album']
}
