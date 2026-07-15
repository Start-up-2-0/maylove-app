import { defineAsyncComponent, type Component } from 'vue'

const GalleryAlbumTemplate = defineAsyncComponent(
  () => import('./templates/GalleryAlbumTemplate.vue'),
)

/** Todos os álbuns públicos usam a galeria Polaroid. */
export function getBookTemplate(_presentation?: string): Component {
  return GalleryAlbumTemplate
}
